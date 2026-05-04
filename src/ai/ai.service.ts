import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private openRouterKey: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.openRouterKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro-latest' });
    }
  }

  async listModels() {
    return { status: 'Ready', provider: 'OpenRouter' };
  }

  private async callOpenRouter(prompt: string): Promise<string> {
    if (!this.openRouterKey) {
      console.error('OPENROUTER_API_KEY is missing in AiService!');
      throw new Error('API Key configuration error');
    }

    // Only Claude models as requested
    const modelOptions = [
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-haiku'
    ];

    let lastError = '';
    for (const modelId of modelOptions) {
      try {
        console.log(`Attempting AI request with model: ${modelId}`);
        const resp = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: modelId,
            messages: [{ role: 'user', content: prompt }],
          },
          {
            headers: {
              Authorization: `Bearer ${this.openRouterKey}`,
              'HTTP-Referer': 'https://specifyer.com',
              'X-Title': 'Specifyer App',
              'Content-Type': 'application/json',
            },
            timeout: 15000 // 15 second timeout
          },
        );
        
        if (resp.data.choices && resp.data.choices.length > 0) {
          console.log(`Success with model: ${modelId}`);
          return resp.data.choices[0].message.content;
        }
        
        if (resp.data.error) {
          lastError = resp.data.error.message || JSON.stringify(resp.data.error);
          console.warn(`Model ${modelId} returned error: ${lastError}`);
        }
      } catch (error) {
        lastError = error.response?.data?.error?.message || error.message;
        console.warn(`Model ${modelId} failed: ${lastError}. Trying next...`);
        continue;
      }
    }
    
    throw new Error(`All AI models failed. Last error: ${lastError}`);
  }

  async recommendFromMultiple(barcodes: string[]) {
    const products: any[] = [];
    for (const barcode of barcodes) {
      const product = await this.prisma.product.findUnique({ where: { barcode } });
      if (product) products.push(product);
    }
    if (products.length === 0) return { success: false, message: 'No valid products found' };

    const prompt = `Analyze and compare these products:
    ${JSON.stringify(products.map(p => ({
      name: p.name,
      brand: p.brand,
      specifications: p.specifications || {}
    })), null, 2)}
    
    Return JSON: { "bestProduct": "Name", "reason": "Why", "summary": "Short summary" }`;

    try {
      const text = await this.callOpenRouter(prompt);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
      return {
        bestProduct: products[0].name,
        reason: 'Comparison Engine Error',
        summary: e.message
      };
    }
  }

  async summarizeProduct(barcode: string) {
    const product = await this.prisma.product.findUnique({ where: { barcode } });
    if (!product) return { success: false, message: 'Product not found' };

    const prompt = `Provide a detailed technical report for this product:
    Name: ${product.name}
    Brand: ${product.brand}
    Category: ${product.category}
    Specifications: ${JSON.stringify(product.specifications || {})}
    
    Format the report as follows:
    - Overview: A concise description of what it is.
    - Key Technical Highlights: Professional technical features.
    - Best Use Case: When and where to use this over others.
    - Verdict: A one-sentence recommendation.`;

    try {
      const text = await this.callOpenRouter(prompt);
      return { success: true, summary: text };
    } catch (e) {
      return { success: false, summary: 'Currently unable to generate AI report.' };
    }
  }

  async extractSpecs(category: string, rawText: string): Promise<Record<string, string>> {
    const prompt = `Extract technical specs for ${category} from: "${rawText}". Return ONLY flat JSON object.`;
    try {
      const text = await this.callOpenRouter(prompt);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
      return { "Raw Text": rawText };
    }
  }
}