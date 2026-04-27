import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = this.generateSlug(createCategoryDto.name);
    
    const existingCategory = await this.categoryRepository.findOne({
      where: { slug },
    });

    if (existingCategory) {
      throw new ConflictException('Já existe uma categoria com este nome');
    }

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      slug,
    });

    return await this.categoryRepository.save(category);
  }

  async findAll(query: QueryCategoriesDto) {
    const { page = 1, limit = 10, name, slug, isActive, sortBy = 'name', sortOrder = 'ASC' } = query;
    
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (name) {
      queryBuilder.andWhere('category.name ILIKE :name', { name: `%${name}%` });
    }

    if (slug) {
      queryBuilder.andWhere('category.slug ILIKE :slug', { slug: `%${slug}%` });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }

    const validSortFields = ['name', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    queryBuilder.orderBy(`category.${sortField}`, sortOrder);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [categories, total] = await queryBuilder.getManyAndCount();

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const newSlug = this.generateSlug(updateCategoryDto.name);
      
      const existingCategory = await this.categoryRepository.findOne({
        where: { slug: newSlug },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Já existe uma categoria com este nome');
      }

      category.slug = newSlug;
    }

    Object.assign(category, updateCategoryDto);

    return await this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (category.products && category.products.length > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma categoria que possui produtos associados. Desative-a ou remova os produtos primeiro.',
      );
    }

    await this.categoryRepository.remove(category);
  }

  async toggleActive(id: string): Promise<Category> {
    const category = await this.findOne(id);
    category.isActive = !category.isActive;
    return await this.categoryRepository.save(category);
  }

  async getActiveCategories(): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getCategoriesWithProductCount() {
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.products', 'product')
      .loadRelationCountAndMap('category.productCount', 'category.products')
      .where('category.isActive = :isActive', { isActive: true })
      .orderBy('category.name', 'ASC')
      .getMany();

    return categories;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

