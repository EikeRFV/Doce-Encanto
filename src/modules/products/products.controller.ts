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
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Permissions('products:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo produto' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar produtos com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de produtos' })
  async findAll(@Query() query: QueryProductsDto) {
    return await this.productsService.findAll(query);
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Listar produtos em destaque' })
  @ApiResponse({ status: 200, description: 'Produtos em destaque' })
  async getFeatured(@Query('limit') limit?: number) {
    return await this.productsService.getFeatured(limit);
  }

  @Get('best-sellers')
  @Public()
  @ApiOperation({ summary: 'Listar produtos mais vendidos' })
  @ApiResponse({ status: 200, description: 'Produtos mais vendidos' })
  async getBestSellers(@Query('limit') limit?: number) {
    return await this.productsService.getBestSellers(limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiResponse({ status: 200, description: 'Produto encontrado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Buscar produto por slug' })
  @ApiResponse({ status: 200, description: 'Produto encontrado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiParam({ name: 'slug', description: 'Slug do produto' })
  async findBySlug(@Param('slug') slug: string) {
    return await this.productsService.findBySlug(slug);
  }

  @Get(':id/related')
  @Public()
  @ApiOperation({ summary: 'Buscar produtos relacionados' })
  @ApiResponse({ status: 200, description: 'Produtos relacionados' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  async getRelated(@Param('id') id: string, @Query('limit') limit?: number) {
    return await this.productsService.getRelated(id, limit);
  }

  @Get(':id/stock-history')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Permissions('products:view-stock')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar histórico de estoque' })
  @ApiResponse({ status: 200, description: 'Histórico de estoque' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  async getStockHistory(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.productsService.getStockHistory(id, page, limit);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Permissions('products:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiResponse({ status: 200, description: 'Produto atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(id, updateProductDto);
  }

  @Put(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Permissions('products:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ativar produto' })
  @ApiResponse({ status: 200, description: 'Produto ativado com sucesso' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  async activate(@Param('id') id: string) {
    return await this.productsService.activate(id);
  }

  @Put(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Permissions('products:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desativar produto' })
  @ApiResponse({ status: 200, description: 'Produto desativado com sucesso' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  async deactivate(@Param('id') id: string) {
    return await this.productsService.deactivate(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Permissions('products:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar produto' })
  @ApiResponse({ status: 200, description: 'Produto deletado com sucesso' })
  @ApiResponse({
    status: 409,
    description: 'Produto possui pedidos associados',
  })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return { message: 'Produto deletado com sucesso' };
  }
}



  @Post(':id/images')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Permissions('products:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload de imagens do produto' })
  @ApiResponse({ status: 201, description: 'Imagens enviadas com sucesso' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  async uploadImages(
    @Param('id') id: string,
    @Body('isPrimary') isPrimary: boolean = false,
  ) {
    // Nota: Implementação completa requer Multer
    // npm install --save @nestjs/platform-express multer
    // npm install --save-dev @types/multer
    return { message: 'Endpoint de upload configurado. Instale Multer para uso completo.' };
  }

  @Delete(':id/images/:imageId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Permissions('products:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar imagem do produto' })
  @ApiResponse({ status: 200, description: 'Imagem deletada com sucesso' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiParam({ name: 'imageId', description: 'ID da imagem' })
  async deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    await this.productsService.deleteImage(id, imageId);
    return { message: 'Imagem deletada com sucesso' };
  }

  @Put(':id/images/:imageId/set-primary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Permissions('products:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Definir imagem como principal' })
  @ApiResponse({ status: 200, description: 'Imagem definida como principal' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiParam({ name: 'imageId', description: 'ID da imagem' })
  async setPrimaryImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return await this.productsService.setPrimaryImage(id, imageId);
  }
