import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /products/barcode/:barcode
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

  // GET /products/compare/:barcode
  @Get('compare/:barcode')
  async compareProducts(@Param('barcode') barcode: string) {
    const products =
      await this.productsService.getCompareProducts(barcode);

    return {
      success: true,
      data: products,
    };
  }

  //GET /products (optional)
  @Get()
  async getAll() {
    const products = await this.productsService.getAllProducts();

    return {
      success: true,
      data: products,
    };
  }
}