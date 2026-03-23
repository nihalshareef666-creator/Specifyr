import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { RecommendDto } from './dto/recommend.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

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