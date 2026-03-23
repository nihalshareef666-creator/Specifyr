import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  //Seed data when app starts (optional but useful)
  async onModuleInit() {
    const count = await this.prisma.product.count();

    if (count === 0) {
      await this.prisma.product.createMany({
        data: [
          {
            name: 'Havells Switch',
            price: 140.5,
            rating: 4.5,
            barcode: '111111',
            category: 'switch',
            brand: 'Havells',
          },
          {
            name: 'Anchor Switch',
            price: 120.0,
            rating: 4.2,
            barcode: '222222',
            category: 'switch',
            brand: 'Anchor',
          },
          {
            name: 'GM Modular Switch',
            price: 160.0,
            rating: 4.7,
            barcode: '333333',
            category: 'switch',
            brand: 'GM',
          },
          {
            name: 'Philips LED Bulb',
            price: 80.0,
            rating: 4.4,
            barcode: '444444',
            category: 'lighting',
            brand: 'Philips',
          },
          {
            name: 'Syska LED Bulb',
            price: 70.0,
            rating: 4.1,
            barcode: '555555',
            category: 'lighting',
            brand: 'Syska',
          },
        ],
      });

      console.log('Seed data inserted');
    }
  }

  //Get product by barcode
  async getProductByBarcode(barcode: string) {
    const product = await this.prisma.product.findUnique({
      where: { barcode },
    });

    if (!product) return null;

    return {
      ...product,
      price: product.price.toNumber(), // fix Decimal
    };
  }

  //Get similar (compare) products
  async getCompareProducts(barcode: string) {
    const product = await this.prisma.product.findUnique({
      where: { barcode },
    });

    if (!product) return [];

    const products = await this.prisma.product.findMany({
      where: {
        category: product.category,
        NOT: {
          barcode: barcode,
        },
      },
      take: 5,
    });

    return products.map((p) => ({
      ...p,
      price: p.price.toNumber(), //fix Decimal
    }));
  }

  //Get all products
  async getAllProducts() {
    const products = await this.prisma.product.findMany();

    return products.map((p) => ({
      ...p,
      price: p.price.toNumber(), //fix Decimal
    }));
  }
}