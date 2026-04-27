import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';
import { OrderStatus } from '../../common/enums/order-status.enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    const { productId, rating, comment } = createReviewDto;

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { userId, productId },
    });

    if (existingReview) {
      throw new BadRequestException('Você já avaliou este produto');
    }

    const hasPurchased = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .where('order.userId = :userId', { userId })
      .andWhere('item.productId = :productId', { productId })
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .getOne();

    if (!hasPurchased) {
      throw new BadRequestException('Você precisa comprar o produto antes de avaliá-lo');
    }

    const review = this.reviewRepository.create({
      userId,
      productId,
      rating,
      comment,
    });

    const savedReview = await this.reviewRepository.save(review);

    await this.updateProductRating(productId);

    return savedReview;
  }

  async findAll(query: QueryReviewsDto) {
    const { page = 1, limit = 10, productId, rating, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product');

    if (productId) {
      queryBuilder.andWhere('review.productId = :productId', { productId });
    }

    if (rating) {
      queryBuilder.andWhere('review.rating = :rating', { rating });
    }

    const validSortFields = ['createdAt', 'rating'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`review.${sortField}`, sortOrder);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
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

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product')
      .where('review.userId = :userId', { userId });

    const validSortFields = ['createdAt', 'rating'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`review.${sortField}`, sortOrder);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, userId: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar esta avaliação');
    }

    Object.assign(review, updateReviewDto);

    const updatedReview = await this.reviewRepository.save(review);

    if (updateReviewDto.rating) {
      await this.updateProductRating(review.productId);
    }

    return updatedReview;
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para excluir esta avaliação');
    }

    const productId = review.productId;

    await this.reviewRepository.remove(review);

    await this.updateProductRating(productId);
  }

  async getProductStats(productId: string) {
    const reviews = await this.reviewRepository.find({
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

    await this.productRepository.update(productId, {
      averageRating: stats.averageRating,
      reviewCount: stats.totalReviews,
    });
  }
}

