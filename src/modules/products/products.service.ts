import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductStockHistory, StockMovementType } from './entities/product-stock-history.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductStockHistory)
    private readonly stockHistoryRepository: Repository<ProductStockHistory>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  /**
   * Regra de Negócio #06: Geração Automática de Slug
   * Gera slug único a partir do nome do produto
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-'); // Remove hífens duplicados
  }

  /**
   * Garante que o slug seja único
   */
  private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const query = this.productRepository.createQueryBuilder('product')
        .where('product.slug = :slug', { slug });

      if (excludeId) {
        query.andWhere('product.id != :excludeId', { excludeId });
      }

      const existing = await query.getOne();

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Criar novo produto
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Regra de Negócio #07: Validação de Preço
    if (createProductDto.price <= 0) {
      throw new BadRequestException('O preço deve ser maior que zero');
    }

    // Regra de Negócio #08: Controle de Estoque Não Negativo
    if (createProductDto.stockQuantity < 0) {
      throw new BadRequestException('O estoque não pode ser negativo');
    }

    // Gerar slug único
    const baseSlug = this.generateSlug(createProductDto.name);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const product = this.productRepository.create({
      ...createProductDto,
      slug,
      averageRating: 0,
      reviewCount: 0,
    });

    const savedProduct = await this.productRepository.save(product);

    // Registrar histórico de estoque inicial
    if (createProductDto.stockQuantity > 0) {
      await this.createStockHistory({
        productId: savedProduct.id,
        movementType: StockMovementType.ADJUSTMENT,
        quantity: createProductDto.stockQuantity,
        previousStock: 0,
        newStock: createProductDto.stockQuantity,
        reason: 'Estoque inicial',
      });
    }

    return savedProduct;
  }

  /**
   * Listar produtos com filtros e paginação
   */
  async findAll(query: QueryProductsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      isActive,
      isFeatured,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images');

    // Filtro de busca
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filtro por categoria
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // Filtro por ativo
    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    // Filtro por destaque
    if (isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured });
    }

    // Filtro por faixa de preço
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Ordenação
    queryBuilder.orderBy(`product.${sortBy}`, sortOrder);

    // Paginação
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Buscar produto por ID
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'images', 'reviews'],
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  /**
   * Buscar produto por slug
   */
  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['category', 'images', 'reviews'],
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  /**
   * Atualizar produto
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Regra de Negócio #07: Validação de Preço
    if (updateProductDto.price !== undefined && updateProductDto.price <= 0) {
      throw new BadRequestException('O preço deve ser maior que zero');
    }

    // Regra de Negócio #08: Controle de Estoque Não Negativo
    if (updateProductDto.stockQuantity !== undefined && updateProductDto.stockQuantity < 0) {
      throw new BadRequestException('O estoque não pode ser negativo');
    }

    // Atualizar slug se o nome mudou
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const baseSlug = this.generateSlug(updateProductDto.name);
      updateProductDto['slug'] = await this.ensureUniqueSlug(baseSlug, id);
    }

    // Registrar mudança de estoque
    if (updateProductDto.stockQuantity !== undefined && updateProductDto.stockQuantity !== product.stockQuantity) {
      await this.createStockHistory({
        productId: id,
        movementType: StockMovementType.ADJUSTMENT,
        quantity: Math.abs(updateProductDto.stockQuantity - product.stockQuantity),
        previousStock: product.stockQuantity,
        newStock: updateProductDto.stockQuantity,
        reason: 'Ajuste manual de estoque',
      });
    }

    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  /**
   * Regra de Negócio #09: Proteção de Produtos com Pedidos
   * Produtos com pedidos não podem ser deletados, apenas desativados
   */
  async remove(id: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['orderItems'],
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (product.orderItems && product.orderItems.length > 0) {
      throw new ConflictException(
        'Produto não pode ser deletado pois possui pedidos associados. Desative o produto ao invés de deletá-lo.',
      );
    }

    await this.productRepository.remove(product);
  }

  /**
   * Desativar produto
   */
  async deactivate(id: string): Promise<Product> {
    const product = await this.findOne(id);
    product.isActive = false;
    return await this.productRepository.save(product);
  }

  /**
   * Ativar produto
   */
  async activate(id: string): Promise<Product> {
    const product = await this.findOne(id);
    product.isActive = true;
    return await this.productRepository.save(product);
  }

  /**
   * Atualizar estoque
   */
  async updateStock(
    id: string,
    quantity: number,
    movementType: StockMovementType,
    reason: string,
    userId?: string,
    orderId?: string,
  ): Promise<Product> {
    const product = await this.findOne(id);
    const previousStock = product.stockQuantity;
    let newStock: number;

    switch (movementType) {
      case StockMovementType.SALE:
      case StockMovementType.DAMAGE:
      case StockMovementType.LOSS:
        newStock = previousStock - quantity;
        break;
      case StockMovementType.PURCHASE:
      case StockMovementType.RETURN:
        newStock = previousStock + quantity;
        break;
      case StockMovementType.ADJUSTMENT:
        newStock = quantity;
        break;
      default:
        throw new BadRequestException('Tipo de movimentação inválido');
    }

    if (newStock < 0) {
      throw new BadRequestException('Estoque insuficiente');
    }

    product.stockQuantity = newStock;
    await this.productRepository.save(product);

    await this.createStockHistory({
      productId: id,
      movementType,
      quantity,
      previousStock,
      newStock,
      reason,
      userId,
      orderId,
    });

    return product;
  }

  /**
   * Criar registro de histórico de estoque
   */
  private async createStockHistory(data: {
    productId: string;
    movementType: StockMovementType;
    quantity: number;
    previousStock: number;
    newStock: number;
    reason: string;
    userId?: string;
    orderId?: string;
  }): Promise<ProductStockHistory> {
    const history = this.stockHistoryRepository.create(data);
    return await this.stockHistoryRepository.save(history);
  }

  /**
   * Buscar histórico de estoque
   */
  async getStockHistory(productId: string, page = 1, limit = 10) {
    const [history, total] = await this.stockHistoryRepository.findAndCount({
      where: { productId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });

    return {
      data: history,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Produtos em destaque
   */
  async getFeatured(limit = 10): Promise<Product[]> {
    return await this.productRepository.find({
      where: { isFeatured: true, isActive: true },
      relations: ['category', 'images'],
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Produtos mais vendidos
   */
  async getBestSellers(limit = 10): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoin('product.orderItems', 'orderItems')
      .where('product.isActive = :isActive', { isActive: true })
      .groupBy('product.id')
      .addGroupBy('category.id')
      .addGroupBy('images.id')
      .orderBy('COUNT(orderItems.id)', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Produtos relacionados (mesma categoria)
   */
  async getRelated(productId: string, limit = 4): Promise<Product[]> {
    const product = await this.findOne(productId);

    return await this.productRepository.find({
      where: {
        categoryId: product.categoryId,
        isActive: true,
      },
      relations: ['category', 'images'],
      take: limit,
      order: { averageRating: 'DESC' },
    });
  }

  /**
   * Upload de imagens do produto
   */
  async uploadImages(
    productId: string,
    files: any[],
    isPrimary: boolean = false,
  ): Promise<ProductImage[]> {
    const product = await this.findOne(productId);

    const images: ProductImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const image = this.productImageRepository.create({
        productId: product.id,
        url: `/uploads/products/${file.filename}`,
        isPrimary: isPrimary && i === 0, // Apenas a primeira é primary se solicitado
        order: i + 1,
        altText: file.originalname,
      });
      const savedImage = await this.productImageRepository.save(image);
      images.push(savedImage);
    }

    return images;
  }

  /**
   * Deletar imagem do produto
   */
  async deleteImage(productId: string, imageId: string): Promise<void> {
    const image = await this.productImageRepository.findOne({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    await this.productImageRepository.remove(image);
  }

  /**
   * Definir imagem como principal
   */
  async setPrimaryImage(productId: string, imageId: string): Promise<any> {
    const product = await this.findOne(productId);

    // Remove primary de todas as imagens
    await this.productImageRepository.update(
      { productId },
      { isPrimary: false },
    );

    // Define a nova imagem como primary
    const image = await this.productImageRepository.findOne({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    image.isPrimary = true;
    return await this.productImageRepository.save(image);
  }
}

