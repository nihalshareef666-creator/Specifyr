import { Body, Controller, Post, Get } from '@nestjs/common';
import { AiService } from './ai.service';
import { RecommendDto } from './dto/recommend.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('debug')
  async debug() {
    return this.aiService.listModels();
  }

  //POST /ai/summarize
  @Post('summarize')
  async summarize(@Body() body: { barcode: string }) {
    const result = await this.aiService.summarizeProduct(body.barcode);
    return result;
  }

  //POST /ai/recommend
  @Post('recommend')
  async recommend(@Body() body: RecommendDto) {
    const { products } = body;

    const result = await this.aiService.recommendFromMultiple(products);

    return {
      success: true,
      data: result,
    };
  }
}