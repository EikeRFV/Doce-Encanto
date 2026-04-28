import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './models/product.model';
import { ProductImage } from './models/product-image.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Product, ProductImage]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

