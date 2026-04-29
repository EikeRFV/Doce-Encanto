import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Product } from './models/product.model';
import { ProductImage } from './models/product-image.model';
import { ProductStockHistory, StockMovementType } from './models/product-stock-history.model';
import { Category } from '../categories/models/category.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
    @InjectModel(ProductStockHistory)
    private readonly stockHistoryModel: typeof ProductStockHistory,
    @InjectModel(ProductImage)
    private readonly productImageModel: typeof ProductImage,
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
      const where: any = { slug };
      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }

      const existing = await this.productModel.findOne({ where });

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

    const savedProduct = await this.productModel.create({
      ...createProductDto,
      slug,
      averageRating: 0,
      reviewCount: 0,
    });

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

    const where: any = {};

    // Filtro de busca
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filtro por categoria
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filtro por ativo
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Filtro por destaque
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    // Filtro por faixa de preço
    if (minPrice !== undefined) {
      where.price = { [Op.gte]: minPrice };
    }
    if (maxPrice !== undefined) {
      if (!where.price) where.price = {};
      where.price[Op.lte] = maxPrice;
    }

    const validSortFields = ['name', 'price', 'createdAt', 'updatedAt', 'averageRating'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order: any = [[sortField, sortOrder]];

    const skip = (page - 1) * limit;
    const { count, rows: products } = await this.productModel.findAndCountAll({
      where,
      order,
      offset: skip,
      limit,
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
      ],
    });

    return {
      data: products,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Buscar produto por ID
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findOne({
      where: { id },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
      ],
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
    const product = await this.productModel.findOne({
      where: { slug },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
      ],
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

    await product.update(updateProductDto);

    return await this.productModel.findOne({
      where: { id },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
      ],
    });
  }

  /**
   * Regra de Negócio #09: Proteção de Produtos com Pedidos
   * Produtos com pedidos não podem ser deletados, apenas desativados
   */
  async remove(id: string): Promise<void> {
    const product = await this.productModel.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Check if product has order items
    const orderItemCount = await product.$count('orderItems');
    if (orderItemCount > 0) {
      throw new ConflictException(
        'Produto não pode ser deletado pois possui pedidos associados. Desative o produto ao invés de deletá-lo.',
      );
    }

    await product.destroy();
  }

  /**
   * Desativar produto
   */
  async deactivate(id: string): Promise<Product> {
    const product = await this.findOne(id);
    await product.update({ isActive: false });
    
    return await this.productModel.findOne({
      where: { id },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
      ],
    });
  }

  /**
   * Ativar produto
   */
  async activate(id: string): Promise<Product> {
    const product = await this.findOne(id);
    await product.update({ isActive: true });
    
    return await this.productModel.findOne({
      where: { id },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
      ],
    });
  }

  /**
   * Atualizar estoque
   */
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

    await product.update({ stockQuantity: newStock });

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

    return await this.productModel.findOne({
      where: { id },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
      ],
    });
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
    return await this.stockHistoryModel.create(data);
  }

  /**
   * Buscar histórico de estoque
   */
  async getStockHistory(productId: string, page = 1, limit = 10) {
    const { count, rows: history } = await this.stockHistoryModel.findAndCountAll({
      where: { productId },
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit,
    });

    return {
      data: history,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Produtos em destaque
   */
  async getFeatured(limit = 10): Promise<Product[]> {
    return await this.productModel.findAll({
      where: { isFeatured: true, isActive: true },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
      ],
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Produtos mais vendidos
   */
  async getBestSellers(limit = 10): Promise<Product[]> {
    return await this.productModel.findAll({
      where: { isActive: true },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
      ],
      limit,
      order: [['orderItems', 'DESC']],
      subQuery: false,
    });
  }

  /**
   * Produtos relacionados (mesma categoria)
   */
  async getRelated(productId: string, limit = 4): Promise<Product[]> {
    const product = await this.findOne(productId);

    return await this.productModel.findAll({
      where: {
        categoryId: product.categoryId,
        isActive: true,
      },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
      ],
      limit,
      order: [['averageRating', 'DESC']],
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
      const image = await this.productImageModel.create({
        productId: product.id,
        url: `/uploads/products/${file.filename}`,
        isPrimary: isPrimary && i === 0,
        order: i + 1,
        altText: file.originalname,
      });
      images.push(image);
    }

    return images;
  }

  /**
   * Deletar imagem do produto
   */
  async deleteImage(productId: string, imageId: string): Promise<void> {
    const image = await this.productImageModel.findOne({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    await image.destroy();
  }

  /**
   * Definir imagem como principal
   */
  async setPrimaryImage(productId: string, imageId: string): Promise<any> {
    const product = await this.findOne(productId);

    // Remove primary de todas as imagens
    await this.productImageModel.update(
      { isPrimary: false },
      { where: { productId } },
    );

    // Define a nova imagem como primary
    const image = await this.productImageModel.findOne({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    await image.update({ isPrimary: true });
    return image;
  }
}

