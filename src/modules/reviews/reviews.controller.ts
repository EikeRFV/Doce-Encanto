import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova avaliação' })
  @ApiResponse({ status: 201, description: 'Avaliação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Produto já avaliado ou não comprado' })
  create(@CurrentUser('id') userId: string, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(userId, createReviewDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar todas as avaliações' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações retornada com sucesso' })
  findAll(@Query() query: QueryReviewsDto) {
    return this.reviewsService.findAll(query);
  }

  @Get('my-reviews')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar minhas avaliações' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações do usuário' })
  findMyReviews(@CurrentUser('id') userId: string, @Query() query: QueryReviewsDto) {
    return this.reviewsService.findMyReviews(userId, query);
  }

  @Get('product/:productId')
  @Public()
  @ApiOperation({ summary: 'Listar avaliações de um produto' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações do produto' })
  findByProduct(@Param('productId') productId: string, @Query() query: QueryReviewsDto) {
    return this.reviewsService.findByProduct(productId, query);
  }

  @Get('product/:productId/stats')
  @Public()
  @ApiOperation({ summary: 'Estatísticas de avaliações de um produto' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
  getProductStats(@Param('productId') productId: string) {
    return this.reviewsService.getProductStats(productId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Buscar avaliação por ID' })
  @ApiResponse({ status: 200, description: 'Avaliação encontrada' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar avaliação' })
  @ApiResponse({ status: 200, description: 'Avaliação atualizada com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, userId, updateReviewDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir avaliação' })
  @ApiResponse({ status: 204, description: 'Avaliação excluída com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para excluir' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.reviewsService.remove(id, userId);
  }
}

