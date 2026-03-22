import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {

  async recommend(products: any[]) {
    try {
      console.log("Products received:", products);

      const prompt = `
You are an expert in electrical and plumbing products.

From the given list, select ONLY ONE best product.

Return response in STRICT JSON format like this:
{
  "bestProduct": "product name",
  "reason": "short reason",
  "summary": "3-4 sentence explanation"
}

Do not return anything else.

Products:
${JSON.stringify(products)}
`;

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert in electrical and plumbing products.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("AI response:", response.data);

      const aiText = response.data.choices[0].message.content;

try {
  return JSON.parse(aiText);
} catch {
  return {
    bestProduct: "Unknown",
    reason: "AI response parsing failed",
    summary: aiText
  };
}

    } catch (error) {
      console.error("FULL ERROR:", error.response?.data || error.message);
      throw error;
    }
  }
}