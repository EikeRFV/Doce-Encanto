import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Review } from './models/review.model';
import { Product } from '../products/models/product.model';
import { Order } from '../orders/models/order.model';
import { User } from '../users/models/user.model';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';
import { OrderStatus } from '../../common/enums/order-status.enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review)
    private readonly reviewModel: typeof Review,
    @InjectModel(Product)
    private readonly productModel: typeof Product,
    @InjectModel(Order)
    private readonly orderModel: typeof Order,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    const { productId, rating, comment } = createReviewDto;

    const product = await this.productModel.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const existingReview = await this.reviewModel.findOne({
      where: { userId, productId },
    });

    if (existingReview) {
      throw new BadRequestException('Você já avaliou este produto');
    }

    const hasPurchased = await this.orderModel.findOne({
      where: {
        userId,
        status: OrderStatus.DELIVERED,
      },
      include: [
        {
          model: Order,
          as: 'items',
          where: { productId },
          required: true,
        },
      ],
    });

    if (!hasPurchased) {
      throw new BadRequestException('Você precisa comprar o produto antes de avaliá-lo');
    }

    const review = await this.reviewModel.create({
      userId,
      productId,
      rating,
      comment,
    });

    await this.updateProductRating(productId);

    return review;
  }

  async findAll(query: QueryReviewsDto) {
    const { page = 1, limit = 10, productId, rating, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const where: any = {};
    if (productId) {
      where.productId = productId;
    }
    if (rating) {
      where.rating = rating;
    }

    const validSortFields = ['createdAt', 'rating'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order: any = [[sortField, sortOrder]];

    const skip = (page - 1) * limit;
    const { count, rows: reviews } = await this.reviewModel.findAndCountAll({
      where,
      order,
      offset: skip,
      limit,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Product, as: 'product' },
      ],
    });

    return {
      data: reviews,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewModel.findOne({
      where: { id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Product, as: 'product' },
      ],
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    return review;
  }

  async findByProduct(productId: string, query: QueryReviewsDto) {
    return this.findAll({ ...query, productId });
  }

  async findMyReviews(userId: string, query: QueryReviewsDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const validSortFields = ['createdAt', 'rating'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order: any = [[sortField, sortOrder]];

    const skip = (page - 1) * limit;
    const { count, rows: reviews } = await this.reviewModel.findAndCountAll({
      where: { userId },
      order,
      offset: skip,
      limit,
      include: [{ model: Product, as: 'product' }],
    });

    return {
      data: reviews,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async update(id: string, userId: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewModel.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar esta avaliação');
    }

    await review.update(updateReviewDto);

    if (updateReviewDto.rating) {
      await this.updateProductRating(review.productId);
    }

    return await this.reviewModel.findOne({
      where: { id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Product, as: 'product' },
      ],
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.reviewModel.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para excluir esta avaliação');
    }

    const productId = review.productId;

    await review.destroy();

    await this.updateProductRating(productId);
  }

  async getProductStats(productId: string) {
    const reviews = await this.reviewModel.findAll({
      where: { productId },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return {
      totalReviews: reviews.length,
      averageRating: Number(averageRating.toFixed(2)),
      ratingDistribution,
    };
  }

  private async updateProductRating(productId: string): Promise<void> {
    const stats = await this.getProductStats(productId);

    await this.productModel.update(
      { averageRating: stats.averageRating, reviewCount: stats.totalReviews },
      { where: { id: productId } },
    );
  }
}

