import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities';
import { ProductImage } from './entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [TypeOrmModule.forFeature([Product, ProductImage]), AuthModule],
  exports: [ProductService, TypeOrmModule],
})
export class ProductModule {}
