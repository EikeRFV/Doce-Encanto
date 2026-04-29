import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Category } from './models/category.model';
import { Product } from '../products/models/product.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category)
    private readonly categoryModel: typeof Category,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = this.generateSlug(createCategoryDto.name);
    
    const existingCategory = await this.categoryModel.findOne({
      where: { slug },
    });

    if (existingCategory) {
      throw new ConflictException('Já existe uma categoria com este nome');
    }

    return await this.categoryModel.create({
      ...createCategoryDto,
      slug,
    });
  }

  async findAll(query: QueryCategoriesDto) {
    const { page = 1, limit = 10, name, slug, isActive, sortBy = 'name', sortOrder = 'ASC' } = query;
    
    const where: any = {};

    if (name) {
      where.name = { [Op.iLike]: `%${name}%` };
    }

    if (slug) {
      where.slug = { [Op.iLike]: `%${slug}%` };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const validSortFields = ['name', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const order: any = [[sortField, sortOrder]];

    const skip = (page - 1) * limit;
    const { count, rows: categories } = await this.categoryModel.findAndCountAll({
      where,
      order,
      offset: skip,
      limit,
    });

    return {
      data: categories,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findOne({
      where: { id },
      include: [{ model: Product, as: 'products' }],
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({
      where: { slug },
      include: [{ model: Product, as: 'products' }],
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
      
      const existingCategory = await this.categoryModel.findOne({
        where: { slug: newSlug },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Já existe uma categoria com este nome');
      }

      category.slug = newSlug;
    }

    await category.update(updateCategoryDto);

    return await this.categoryModel.findOne({
      where: { id },
      include: [{ model: Product, as: 'products' }],
    });
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryModel.findOne({
      where: { id },
      include: [{ model: Product, as: 'products' }],
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (category.products && category.products.length > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma categoria que possui produtos associados. Desative-a ou remova os produtos primeiro.',
      );
    }

    await category.destroy();
  }

  async toggleActive(id: string): Promise<Category> {
    const category = await this.findOne(id);
    category.isActive = !category.isActive;
    await category.save();
    
    return await this.categoryModel.findOne({
      where: { id },
      include: [{ model: Product, as: 'products' }],
    });
  }

  async getActiveCategories(): Promise<Category[]> {
    return await this.categoryModel.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
  }

  async getCategoriesWithProductCount() {
    const categories = await this.categoryModel.findAll({
      where: { isActive: true },
      include: [{ model: Product, as: 'products', attributes: [] }],
      order: [['name', 'ASC']],
      raw: true,
      subQuery: false,
    });

    return categories.map((cat: any) => ({
      ...cat,
      productCount: cat.products?.length || 0,
    }));
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

