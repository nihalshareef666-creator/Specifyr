import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Get product by barcode
  @Get('barcode/:barcode')
  async getProduct(@Param('barcode') barcode: string) {
    const product = await this.productsService.getProductByBarcode(barcode);

    if (!product) {
      return {
        success: false,
        message: 'Product not found',
      };
    }

    return {
      success: true,
      data: product,
    };
  }

  // Get similar products (based on category)
  @Get('compare/:barcode')
  async getSimilar(@Param('barcode') barcode: string) {
    const product = await this.productsService.getProductByBarcode(barcode);

    if (!product) {
      return {
        success: false,
        message: 'Product not found',
      };
    }

    const similarProducts = await this.productsService.getSimilarProducts(
      product.category,
      barcode,
    );

    return {
      success: true,
      data: {
        product,
        similarProducts,
      },
    };
  }

  // Get all products
  @Get()
  async getAll() {
    const products = await this.productsService.getAllProducts();

    return {
      success: true,
      count: products.length,
      data: products,
    };
  }

  // Seed multiple products (temporary route)
  @Get('seed-all')
  async seedAll() {
    await this.productsService.seedMultiple();

    return {
      success: true,
      message: 'Products seeded successfully',
    };
  }
}