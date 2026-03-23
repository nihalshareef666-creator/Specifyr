import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

@Injectable()
export class AiService {
  constructor(private productsService: ProductsService) {}

  async recommendFromMultiple(barcodes: string[]) {
    const products: any[] = [];

    //Fetch products from DB
    for (const barcode of barcodes) {
      const product =
        await this.productsService.getProductByBarcode(barcode);

      if (product) {
        products.push(product);
      }
    }

    //No valid products
    if (products.length === 0) {
      return {
        success: false,
        message: 'No valid products found',
      };
    }

    //Sort by rating (highest first)
    const best = products.sort((a, b) => b.rating - a.rating)[0];

    //Final response
    return {
      bestProduct: best.name,
      reason: 'Highest rating among selected products',
      summary: `${best.name} has the highest rating of ${best.rating}, making it the best choice among the selected products.`,
    };
  }
}