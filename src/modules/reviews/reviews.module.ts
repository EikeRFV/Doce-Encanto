import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './models/review.model';
import { Product } from '../products/models/product.model';
import { Order } from '../orders/models/order.model';

@Module({
  imports: [SequelizeModule.forFeature([Review, Product, Order])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}

