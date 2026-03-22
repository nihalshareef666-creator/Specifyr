import { ProductsModule } from '../products/products.module';
import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [ProductsModule], // REQUIRED
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}