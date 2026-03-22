import { Controller, Post, Param } from '@nestjs/common';
import { AiService } from './ai.service';
import { ProductsService } from '../products/products.service';

@Controller('ai')
export class AiController {
  constructor(
    private aiService: AiService,
    private productsService: ProductsService,
  ) {}

  @Post('recommend/:barcode')
  async recommend(@Param('barcode') barcode: string) {
    try {
      // 1. Fetch main product
      const product = await this.productsService.getProductByBarcode(barcode);

      if (!product) {
        return {
          success: false,
          message: 'Product not found',
        };
      }

      // 2. Fetch similar products
      const similarProducts = await this.productsService.getSimilarProducts(
        product.category,
        product.barcode,
      );

      // 3. Combine products
      const allProducts = [product, ...similarProducts];

      // 4. Send to AI
      const result = await this.aiService.recommend(allProducts);

      // 5. Return structured response
      return {
        success: true,
        data: result,
      };

    } catch (error) {
      console.error('AI ERROR:', error);

      return {
        success: false,
        message: 'Recommendation failed',
        error: error.message,
      };
    }
  }
}