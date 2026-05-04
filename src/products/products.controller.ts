import { Controller, Get, Param, Query, Post, Body, Put, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { AuthGuard } from '../auth/auth.guard';
import { AiService } from '../ai/ai.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly aiService: AiService
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadImage(@UploadedFile() file: any) {
    return {
      success: true,
      imageUrl: `/uploads/${file.filename}`
    };
  }

  @Get()
  async getAll() {
    return {
      success: true,
      data: await this.productsService.getAllProducts(),
    };
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return {
      success: true,
      data: await this.productsService.searchProducts(query || ''),
    };
  }

  @Get(':barcode')
  async getProduct(@Param('barcode') barcode: string) {
    const product = await this.productsService.getProductByBarcode(barcode);
    return {
      success: !!product,
      data: product,
      message: product ? '' : 'Product not found',
    };
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() body: any) {
    const product = await this.productsService.createProduct(body);
    return {
      success: true,
      data: product,
    };
  }

  @UseGuards(AuthGuard)
  @Put(':barcode')
  async update(@Param('barcode') barcode: string, @Body() body: any) {
    const product = await this.productsService.updateProduct(barcode, body);
    return {
      success: true,
      data: product,
    };
  }

  @UseGuards(AuthGuard)
  @Delete(':barcode')
  async delete(@Param('barcode') barcode: string) {
    await this.productsService.deleteProduct(barcode);
    return {
      success: true,
      message: 'Product deleted',
    };
  }

  @Post('compare')
  async compare(@Body() body: { barcodes: string[] }) {
    const { barcodes } = body;
    const result = await this.aiService.recommendFromMultiple(barcodes);
    return {
      success: true,
      recommendation: result.summary, // Adjust to what Flutter expects
      data: result,
    };
  }
}