import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Get product by barcode
  async getProductByBarcode(barcode: string) {
    return this.prisma.product.findUnique({
      where: { barcode },
    });
  }

  // Get similar products (same category, excluding current)
  async getSimilarProducts(category: string, excludeBarcode: string) {
    return this.prisma.product.findMany({
      where: {
        category: category,
        NOT: {
          barcode: excludeBarcode,
        },
      },
      take: 5, // limit results
    });
  }

  // Get all products (optional)
  async getAllProducts() {
    return this.prisma.product.findMany();
  }

  // Seed multiple products (for testing)
  async seedMultiple() {
    return this.prisma.product.createMany({
      data: [
        {
          name: 'Havells Switch',
          price: 140,
          rating: 4.5,
          barcode: '123456',
          category: 'switch',
        },
        {
          name: 'Anchor Switch',
          price: 120,
          rating: 4.2,
          barcode: '123457',
          category: 'switch',
        },
        {
          name: 'GM Modular Switch',
          price: 160,
          rating: 4.7,
          barcode: '123458',
          category: 'switch',
        },
        {
          name: 'Philips LED Bulb',
          price: 200,
          rating: 4.6,
          barcode: '223456',
          category: 'lighting',
        },
        {
          name: 'Syska LED Bulb',
          price: 180,
          rating: 4.3,
          barcode: '223457',
          category: 'lighting',
        },
      ],
      skipDuplicates: true, // avoids crash if already inserted
    });
  }
}