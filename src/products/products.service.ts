import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService
  ) {}

  async onModuleInit() {
    const count = await this.prisma.product.count();

    if (count === 0) {
      await this.prisma.product.createMany({
        data: [
          {
            name: 'Havells Modular Switch',
            barcode: '111111',
            category: 'Electrical',
            brand: 'Havells',
            imageUrl: 'https://picsum.photos/id/1/400/300',
            specifications: { "Voltage": "240V", "Material": "Polycarbonate" }
          },
          {
            name: 'Anchor Penta Switch',
            barcode: '222222',
            category: 'Electrical',
            brand: 'Anchor',
            imageUrl: 'https://picsum.photos/id/2/400/300',
            specifications: { "Voltage": "220V", "Type": "1-Way" }
          },
          {
            name: 'Philips LED 9W',
            barcode: '444444',
            category: 'Lighting',
            brand: 'Philips',
            imageUrl: 'https://picsum.photos/id/3/400/300',
            specifications: { "Lumens": "900lm", "Life": "15000 hrs" }
          },
        ],
      });
      console.log('Technical Seed data inserted');
    } else {
      // Temporary: Update existing products that don't have images to use placeholders
      const productsWithoutImages = await this.prisma.product.findMany({
        where: { OR: [{ imageUrl: null }, { imageUrl: '' }] }
      });
      
      if (productsWithoutImages.length > 0) {
        console.log(`Updating ${productsWithoutImages.length} products with placeholder images...`);
        for (const [index, p] of productsWithoutImages.entries()) {
          await this.prisma.product.update({
            where: { id: p.id },
            data: { imageUrl: `https://picsum.photos/id/${(index % 50) + 10}/400/300` }
          });
        }
      }
    }
  }

  async getProductByBarcode(barcode: string) {
    return this.prisma.product.findUnique({
      where: { barcode },
    });
  }

  async getAllProducts() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async searchProducts(query: string) {
    return this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
          { barcode: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
  }

  async createProduct(data: any) {
    let finalSpecs = data.specifications;

    // Smart Extraction: If specifications is a string (OCR paragraph), use AI to clean it
    if (typeof data.specifications === 'string' && data.specifications.length > 5) {
      console.log('AI extracting specs for category:', data.category);
      finalSpecs = await this.aiService.extractSpecs(data.category, data.specifications);
    }

    return this.prisma.product.create({
      data: {
        name: data.name,
        barcode: data.barcode,
        brand: data.brand,
        category: data.category,
        imageUrl: data.imageUrl,
        specifications: finalSpecs,
      },
    });
  }

  async updateProduct(barcode: string, data: any) {
    return this.prisma.product.update({
      where: { barcode },
      data: {
        name: data.name,
        brand: data.brand,
        category: data.category,
        imageUrl: data.imageUrl,
        specifications: data.specifications,
      },
    });
  }

  async deleteProduct(barcode: string) {
    return this.prisma.product.delete({
      where: { barcode },
    });
  }
}