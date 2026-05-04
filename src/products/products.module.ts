import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, JwtModule, AiModule],
  providers: [ProductsService],
  exports: [ProductsService], 
  controllers: [ProductsController]
})
export class ProductsModule {}