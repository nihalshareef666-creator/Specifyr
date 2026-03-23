import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsController } from './products.controller';

@Module({
  providers: [ProductsService, PrismaService],
  exports: [ProductsService], 
  controllers: [ProductsController]
})
export class ProductsModule {}