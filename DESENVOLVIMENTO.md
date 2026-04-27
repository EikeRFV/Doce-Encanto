# Guia de Desenvolvimento - Doce Encanto API

## 📋 Visão Geral do Projeto

API completa para loja de velas artesanais aromáticas e sabonetes personalizados, desenvolvida com NestJS, PostgreSQL, Redis, e implementando CQRS, Cache e Filas para máximo desempenho.

## 🎯 Requisitos do Trabalho

### ✅ Requisitos Obrigatórios Implementados

1. **60+ Endpoints** - Estrutura preparada para implementar todos os endpoints necessários
2. **Documentação Swagger** - Configurada e funcionando em `/api/docs`
3. **Autenticação JWT** - Sistema completo de autenticação implementado
4. **Perfis e Permissões (RBAC)** - Sistema de controle de acesso baseado em roles e permissions
5. **Paginação e Filtros** - DTOs e estrutura preparados para todos os endpoints GET
6. **Migrations e Seeds** - Estrutura configurada (precisa executar as migrations)
7. **Validações e Regras de Negócio** - Várias regras já implementadas

### 🎁 Bônus Implementados

1. **Cache com Redis** - Configurado globalmente
2. **CQRS** - Módulo importado e pronto para uso
3. **Filas com BullMQ** - Configurado para processamento assíncrono

## 🏗️ Estrutura do Projeto

```
src/
├── common/
│   ├── decorators/          # Decorators customizados (Roles, Permissions, Public, CurrentUser)
│   ├── dto/                 # DTOs comuns (Pagination)
│   ├── enums/              # Enums (UserRole, Permission, OrderStatus, PaymentMethod)
│   └── guards/             # Guards (JWT, Roles, Permissions)
├── modules/
│   ├── auth/               # ✅ Módulo de autenticação (COMPLETO)
│   ├── users/              # 🔨 Módulo de usuários (PARCIAL - entidades e DTOs criados)
│   ├── products/           # 🔨 Módulo de produtos (PARCIAL - entidades criadas)
│   ├── categories/         # 🔨 Módulo de categorias (PARCIAL - entidades criadas)
│   ├── orders/             # 🔨 Módulo de pedidos (PARCIAL - entidades criadas)
│   ├── reviews/            # 🔨 Módulo de avaliações (PARCIAL - entidades criadas)
│   ├── addresses/          # 🔨 Módulo de endereços (PARCIAL - entidades criadas)
│   ├── discounts/          # 🔨 Módulo de descontos (PARCIAL - entidades criadas)
│   ├── wishlists/          # 🔨 Módulo de lista de desejos (PARCIAL - entidades criadas)
│   ├── permissions/        # ⏳ Módulo de permissões (A CRIAR)
│   └── reports/            # ⏳ Módulo de relatórios (A CRIAR)
└── database/
    ├── migrations/         # Migrations do TypeORM
    └── seeds/             # Seeds para popular o banco

```

## 🚀 Como Iniciar o Projeto

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar Serviços Docker
```bash
docker-compose up -d
```

Isso iniciará:
- PostgreSQL (porta 5432)
- Redis (porta 6379)
- RabbitMQ (porta 5672, interface web: 15672)

### 3. Criar e Executar Migrations

Primeiro, crie a primeira migration:
```bash
npm run migration:generate src/database/migrations/InitialSchema
```

Execute as migrations:
```bash
npm run migration:run
```

### 4. Executar Seeds (após criar)
```bash
npm run seed
```

### 5. Iniciar a Aplicação
```bash
npm run start:dev
```

A aplicação estará disponível em:
- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs

## 📝 Regras de Negócio Implementadas

### 1. Validação de CPF (AuthService)
- CPF deve ter 11 dígitos
- Validação de dígitos verificadores
- Rejeita CPFs com todos os dígitos iguais

### 2. Senha Forte (RegisterDto/CreateUserDto)
- Mínimo 8 caracteres
- Deve conter letras maiúsculas
- Deve conter letras minúsculas
- Deve conter números
- Deve conter caracteres especiais

### 3. Email Único (AuthService)
- Não permite cadastro de emails duplicados
- Validação de formato de email

### 4. CPF Único (AuthService)
- Não permite cadastro de CPFs duplicados

### 5. Controle de Acesso (Guards)
- Usuários inativos não podem fazer login
- Rotas protegidas por JWT
- Controle por roles (ADMIN, MANAGER, CUSTOMER)
- Controle por permissões granulares

## 🔨 Próximos Passos para Completar o Projeto

### Fase 1: Completar Módulos Básicos (Prioridade Alta)

#### 1. Módulo de Usuários
Criar:
- `src/modules/users/dto/update-user.dto.ts`
- `src/modules/users/dto/filter-user.dto.ts`
- `src/modules/users/users.service.ts`
- `src/modules/users/users.controller.ts`
- `src/modules/users/users.module.ts`

Endpoints necessários (10):
- GET /users (listar com paginação e filtros)
- GET /users/:id (buscar por ID)
- POST /users (criar usuário - admin)
- PATCH /users/:id (atualizar usuário)
- DELETE /users/:id (deletar usuário)
- GET /users/me (perfil do usuário logado)
- PATCH /users/me (atualizar perfil)
- PATCH /users/:id/activate (ativar usuário)
- PATCH /users/:id/deactivate (desativar usuário)
- GET /users/:id/orders (pedidos do usuário)

#### 2. Módulo de Produtos
Criar:
- DTOs (create, update, filter)
- Service com regras de negócio
- Controller com todos os endpoints
- Module

Endpoints necessários (12):
- GET /products (listar com paginação, filtros por categoria, preço, estoque)
- GET /products/:id (buscar por ID)
- GET /products/slug/:slug (buscar por slug)
- POST /products (criar produto - admin/manager)
- PATCH /products/:id (atualizar produto)
- DELETE /products/:id (deletar produto)
- GET /products/featured (produtos em destaque)
- GET /products/:id/reviews (avaliações do produto)
- POST /products/:id/images (adicionar imagens)
- DELETE /products/:id/images/:imageId (remover imagem)
- PATCH /products/:id/stock (atualizar estoque)
- GET /products/search (busca por nome/descrição)

Regras de Negócio:
- Slug único gerado automaticamente
- Preço deve ser maior que zero
- Estoque não pode ser negativo
- Produto com pedidos não pode ser deletado (apenas desativado)
- Atualizar média de avaliações ao adicionar review

#### 3. Módulo de Categorias
Endpoints necessários (6):
- GET /categories
- GET /categories/:id
- POST /categories
- PATCH /categories/:id
- DELETE /categories/:id
- GET /categories/:id/products

Regras de Negócio:
- Nome e slug únicos
- Categoria com produtos não pode ser deletada

#### 4. Módulo de Pedidos
Endpoints necessários (15):
- GET /orders (listar com filtros por status, data, usuário)
- GET /orders/:id (buscar por ID)
- POST /orders (criar pedido)
- PATCH /orders/:id/status (atualizar status)
- DELETE /orders/:id (cancelar pedido)
- GET /orders/my-orders (pedidos do usuário logado)
- POST /orders/:id/payment (processar pagamento)
- GET /orders/:id/payment-status (status do pagamento)
- POST /orders/:id/generate-pix (gerar QR Code PIX)
- PATCH /orders/:id/confirm-payment (confirmar pagamento)
- PATCH /orders/:id/ship (marcar como enviado)
- PATCH /orders/:id/deliver (marcar como entregue)
- POST /orders/:id/refund (solicitar reembolso)
- GET /orders/statistics (estatísticas de pedidos - admin)
- GET /orders/:id/invoice (gerar nota fiscal)

Regras de Negócio:
- Validar estoque antes de criar pedido
- Calcular subtotal, desconto, frete e total
- Gerar número único de pedido
- Validar cupom de desconto
- Atualizar estoque ao confirmar pagamento
- Não permitir cancelamento após envio
- Validar transições de status
- Aplicar desconto apenas se valor mínimo for atingido

#### 5. Módulo de Avaliações
Endpoints necessários (8):
- GET /reviews (listar com filtros)
- GET /reviews/:id
- POST /reviews (criar avaliação)
- PATCH /reviews/:id (atualizar avaliação)
- DELETE /reviews/:id (deletar avaliação)
- PATCH /reviews/:id/approve (aprovar avaliação - admin)
- PATCH /reviews/:id/reject (rejeitar avaliação - admin)
- GET /reviews/pending (avaliações pendentes - admin)

Regras de Negócio:
- Usuário só pode avaliar produtos que comprou
- Nota deve ser entre 1 e 5
- Usuário pode ter apenas uma avaliação por produto
- Atualizar média do produto ao aprovar/rejeitar

### Fase 2: Módulos Complementares

#### 6. Módulo de Endereços
Endpoints necessários (6):
- GET /addresses (endereços do usuário)
- GET /addresses/:id
- POST /addresses
- PATCH /addresses/:id
- DELETE /addresses/:id
- PATCH /addresses/:id/set-default

Regras de Negócio:
- Validar CEP
- Apenas um endereço padrão por usuário
- Ao definir novo padrão, remover padrão anterior

#### 7. Módulo de Descontos
Endpoints necessários (7):
- GET /discounts
- GET /discounts/:id
- POST /discounts
- PATCH /discounts/:id
- DELETE /discounts/:id
- POST /discounts/validate (validar cupom)
- GET /discounts/active (cupons ativos)

Regras de Negócio:
- Código único
- Validar datas de início e fim
- Validar limite de uso
- Validar valor mínimo de compra
- Cupom expirado não pode ser usado

#### 8. Módulo de Lista de Desejos
Endpoints necessários (5):
- GET /wishlists (lista do usuário)
- POST /wishlists (adicionar produto)
- DELETE /wishlists/:id (remover produto)
- DELETE /wishlists/clear (limpar lista)
- POST /wishlists/move-to-cart (mover para carrinho)

#### 9. Módulo de Permissões
Endpoints necessários (6):
- GET /permissions
- GET /permissions/:id
- POST /permissions
- PATCH /permissions/:id
- DELETE /permissions/:id
- POST /users/:id/permissions (atribuir permissões)

### Fase 3: Módulos Avançados

#### 10. Módulo de Relatórios
Endpoints necessários (8):
- GET /reports/sales (relatório de vendas)
- GET /reports/products (produtos mais vendidos)
- GET /reports/revenue (receita por período)
- GET /reports/customers (relatório de clientes)
- GET /reports/inventory (relatório de estoque)
- GET /reports/reviews (relatório de avaliações)
- GET /reports/dashboard (dashboard geral)
- GET /reports/export (exportar relatórios)

## 🎨 Padrão de Implementação

### Exemplo de Service Completo

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Regra de negócio: gerar slug único
    const slug = this.generateSlug(createProductDto.name);
    
    // Regra de negócio: validar preço
    if (createProductDto.price <= 0) {
      throw new BadRequestException('O preço deve ser maior que zero');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      slug,
    });

    return await this.productRepository.save(product);
  }

  async findAll(filterDto: FilterProductDto): Promise<PaginatedResponseDto<Product>> {
    const { page = 1, limit = 10, categoryId, minPrice, maxPrice, inStock } = filterDto;
    
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    // Aplicar filtros
    if (categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (minPrice) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (inStock) {
      query.andWhere('product.stockQuantity > 0');
    }

    // Paginação
    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return new PaginatedResponseDto(data, total, page, limit);
  }

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

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Regra de negócio: validar estoque
    if (updateProductDto.stockQuantity !== undefined && updateProductDto.stockQuantity < 0) {
      throw new BadRequestException('O estoque não pode ser negativo');
    }

    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    
    // Regra de negócio: verificar se tem pedidos
    const hasOrders = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.orderItems', 'orderItem')
      .where('product.id = :id', { id })
      .andWhere('orderItem.id IS NOT NULL')
      .getCount();

    if (hasOrders > 0) {
      throw new BadRequestException(
        'Produto não pode ser deletado pois possui pedidos associados. Desative o produto ao invés de deletá-lo.'
      );
    }

    await this.productRepository.remove(product);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
```

### Exemplo de Controller Completo

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { Permission } from '../../common/enums/permission.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Produtos')
@Controller('products')
@ApiBearerAuth('JWT-auth')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Permissions(Permission.CREATE_PRODUCT)
  @ApiOperation({ summary: 'Criar novo produto' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Public()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Listar produtos com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de produtos' })
  findAll(@Query() filterDto: FilterProductDto) {
    return this.productsService.findAll(filterDto);
  }

  @Get(':id')
  @Public()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiResponse({ status: 200, description: 'Produto encontrado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Permissions(Permission.UPDATE_PRODUCT)
  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiResponse({ status: 200, description: 'Produto atualizado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Permissions(Permission.DELETE_PRODUCT)
  @ApiOperation({ summary: 'Deletar produto' })
  @ApiResponse({ status: 200, description: 'Produto deletado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 400, description: 'Produto possui pedidos associados' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
```

## 📊 Contagem de Endpoints

- Auth: 2 endpoints ✅
- Users: 10 endpoints
- Products: 12 endpoints
- Categories: 6 endpoints
- Orders: 15 endpoints
- Reviews: 8 endpoints
- Addresses: 6 endpoints
- Discounts: 7 endpoints
- Wishlists: 5 endpoints
- Permissions: 6 endpoints
- Reports: 8 endpoints

**Total: 85 endpoints** (mais que os 60 necessários)

## 🔐 Sistema de Permissões

Já implementado no enum `Permission` com 48 permissões diferentes:
- CREATE_*, READ_*, UPDATE_*, DELETE_* para cada recurso
- Permissões especiais como MANAGE_ALL_ORDERS, MODERATE_REVIEWS, etc.

## 📦 Migrations e Seeds

### Criar Seeds

Criar arquivo `src/database/seeds/run-seeds.ts`:

```typescript
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { Permission } from '../../modules/users/entities/permission.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { Permission as PermissionEnum } from '../../common/enums/permission.enum';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['src/**/*.entity{.ts,.js}'],
});

async function seed() {
  await AppDataSource.initialize();

  // Criar permissões
  const permissionRepository = AppDataSource.getRepository(Permission);
  const permissions = Object.values(PermissionEnum).map((name) => ({
    name,
    description: `Permissão para ${name}`,
  }));
  await permissionRepository.save(permissions);

  // Criar usuário admin
  const userRepository = AppDataSource.getRepository(User);
  const allPermissions = await permissionRepository.find();
  
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = userRepository.create({
    email: 'admin@doceencanto.com',
    password: adminPassword,
    fullName: 'Administrador',
    role: UserRole.ADMIN,
    isActive: true,
    permissions: allPermissions,
  });
  await userRepository.save(admin);

  // Criar categorias
  const categoryRepository = AppDataSource.getRepository(Category);
  const categories = [
    { name: 'Velas Aromáticas', slug: 'velas-aromaticas', description: 'Velas artesanais com aromas naturais' },
    { name: 'Sabonetes Artesanais', slug: 'sabonetes-artesanais', description: 'Sabonetes personalizados' },
    { name: 'Kits Presente', slug: 'kits-presente', description: 'Kits especiais para presente' },
  ];
  await categoryRepository.save(categories);

  // Criar produtos de exemplo
  const productRepository = AppDataSource.getRepository(Product);
  const velaCategory = await categoryRepository.findOne({ where: { slug: 'velas-aromaticas' } });
  
  const products = [
    {
      name: 'Vela Aromática Lavanda',
      slug: 'vela-aromatica-lavanda',
      description: 'Vela artesanal com aroma de lavanda, perfeita para relaxamento',
      price: 45.90,
      stockQuantity: 50,
      categoryId: velaCategory?.id,
      isActive: true,
      isFeatured: true,
    },
    // Adicionar mais produtos...
  ];
  await productRepository.save(products);

  console.log('✅ Seeds executados com sucesso!');
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Erro ao executar seeds:', error);
  process.exit(1);
});
```

## 🧪 Testes

Para cada módulo, criar testes:
- Unit tests para services
- E2E tests para controllers

## 📄 Documento de Regras de Negócio (PDF)

Criar arquivo `REGRAS_DE_NEGOCIO.md` e depois converter para PDF com todas as regras implementadas.

## 🎓 Dicas para o Professor

1. **Commits Frequentes**: Faça commits pequenos e descritivos
2. **Branches**: Use branches para cada feature
3. **Code Review**: Peça para colegas revisarem seu código
4. **Documentação**: Mantenha o Swagger sempre atualizado
5. **Testes**: Escreva testes para as regras de negócio mais importantes

## 🚨 Problemas Comuns e Soluções

### Erro de conexão com PostgreSQL
```bash
docker-compose restart postgres
```

### Erro de conexão com Redis
```bash
docker-compose restart redis
```

### Migrations não executam
```bash
npm run migration:revert
npm run migration:run
```

## 📞 Suporte

Para dúvidas sobre o projeto, consulte:
- Documentação NestJS: https://docs.nestjs.com
- Documentação TypeORM: https://typeorm.io
- Documentação Swagger: https://swagger.io

---
