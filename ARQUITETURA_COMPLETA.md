# 🏗️ Arquitetura Completa - Doce Encanto API

## ✅ Checklist de Implementação

### 1. Autenticação e Autorização

#### ✅ **Autenticação JWT Implementada**
- ✅ JWT com Passport
- ✅ Registro de usuários com bcrypt (10 rounds)
- ✅ Login com geração de token
- ✅ Estratégia JWT configurada
- ✅ Token expira em 7 dias (configurável)

#### ✅ **Autorização RBAC**
- ✅ 3 Roles: ADMIN, MANAGER, CUSTOMER
- ✅ 48 Permissões granulares
- ✅ Guards de Roles e Permissions
- ✅ Controle de acesso por endpoint

#### ⏳ **Recursos Avançados (A Implementar)**
- ⏳ OAuth2 (Google, Facebook)
- ⏳ MFA (Multi-Factor Authentication)
- ⏳ Single Sign-On (SSO)
- ⏳ Refresh Tokens
- ⏳ Blacklist de tokens

### 2. Camadas NestJS

#### ✅ **Fluxo de Requisição Implementado**

```
Request
  ↓
Middleware (CORS, Logger)
  ↓
Guard (JwtAuthGuard, RolesGuard, PermissionsGuard) ✅
  ↓
Interceptor (Antes) - Logging, Transform
  ↓
Pipe (ValidationPipe) ✅
  ↓
Controller ✅
  ↓
Service ✅
  ↓
Repository (TypeORM) ✅
  ↓
Database (PostgreSQL) ✅
  ↓
Service
  ↓
Interceptor (Depois) - Transform Response
  ↓
Exception Filter ✅
  ↓
Response
```

**Implementado:**
- ✅ Guards (JWT, Roles, Permissions)
- ✅ Pipes (ValidationPipe global)
- ✅ Controllers
- ✅ Services
- ✅ Exception Filters (automático do NestJS)
- ✅ Middleware (CORS)

**A Implementar:**
- ⏳ Interceptors customizados
- ⏳ Middleware de logging
- ⏳ Rate limiting

### 3. OpenAPI/Swagger

#### ✅ **Swagger Implementado**
- ✅ Documentação em `/api/docs`
- ✅ Bearer Auth configurado
- ✅ Tags organizadas
- ✅ DTOs documentados com @ApiProperty
- ✅ Responses documentadas

### 4. Task Scheduling

#### ⏳ **A Implementar**
- ⏳ @nestjs/schedule
- ⏳ Cron jobs para:
  - Limpar tokens expirados
  - Enviar emails de pedidos
  - Atualizar estatísticas
  - Verificar estoque baixo

### 5. CQRS (Command Query Responsibility Segregation)

#### ✅ **Módulo Importado**
- ✅ @nestjs/cqrs instalado
- ✅ CqrsModule importado no app.module

#### ⏳ **A Implementar**
- ⏳ Commands (CreateOrder, UpdateProduct)
- ⏳ Queries (GetProducts, GetOrders)
- ⏳ Event Handlers
- ⏳ Sagas

### 6. Eventos

#### ⏳ **A Implementar**
- ⏳ EventEmitter2
- ⏳ Eventos de domínio:
  - UserRegistered
  - OrderCreated
  - PaymentConfirmed
  - ProductOutOfStock

### 7. Queues (Filas)

#### ✅ **BullMQ Configurado**
- ✅ Redis configurado
- ✅ BullMQ instalado
- ✅ Módulo importado

#### ⏳ **Filas a Implementar**
- ⏳ Email Queue (envio de emails)
- ⏳ Image Processing Queue (redimensionar imagens)
- ⏳ Notification Queue (notificações)
- ⏳ Report Queue (geração de relatórios)

### 8. Caching

#### ✅ **Redis Cache Implementado**
- ✅ Redis configurado
- ✅ CacheModule global
- ✅ TTL: 60 segundos

#### ⏳ **Cache Strategy a Implementar**
- ⏳ Cache em endpoints públicos (produtos, categorias)
- ⏳ Cache invalidation
- ⏳ Cache warming

### 9. Threads/Workers

#### ⏳ **A Implementar**
- ⏳ Worker Threads para processamento pesado
- ⏳ Processamento de imagens
- ⏳ Geração de relatórios
- ⏳ Exportação de dados

---

## 🔐 Fluxo de Autenticação Detalhado

### 1. Registro de Usuário

```typescript
POST /auth/register
{
  "fullName": "João Silva",
  "email": "joao@example.com",
  "password": "Senha@123",
  "cpf": "12345678900"
}

// Fluxo:
1. ValidationPipe valida dados
2. AuthService.register()
3. Verifica email único
4. Verifica CPF único e válido
5. Hash da senha com bcrypt (10 rounds)
6. Salva usuário no banco
7. Retorna usuário (sem senha)
```

### 2. Login

```typescript
POST /auth/login
{
  "email": "joao@example.com",
  "password": "Senha@123"
}

// Fluxo:
1. ValidationPipe valida dados
2. AuthService.login()
3. Busca usuário por email
4. Verifica se usuário está ativo
5. Compara senha com bcrypt.compare()
6. Gera JWT token com payload:
   {
     sub: userId,
     email: email,
     role: role
   }
7. Atualiza lastLoginAt
8. Retorna { access_token, user }
```

### 3. Acesso a Rota Protegida

```typescript
GET /users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Fluxo:
1. JwtAuthGuard intercepta requisição
2. Extrai token do header Authorization
3. JwtStrategy valida token
4. Busca usuário no banco
5. Verifica se usuário está ativo
6. Adiciona user ao request
7. RolesGuard verifica role (se necessário)
8. PermissionsGuard verifica permissions (se necessário)
9. Controller executa
10. Retorna resposta
```

### 4. Logout (A Implementar)

```typescript
POST /auth/logout
Authorization: Bearer token

// Fluxo:
1. Adicionar token à blacklist (Redis)
2. Remover refresh token (se existir)
3. Limpar sessão
4. Retornar sucesso
```

---

## 📊 Banco de Dados - Estrutura Completa

### Tabelas Existentes (11)

1. ✅ **users** - Usuários
2. ✅ **permissions** - Permissões
3. ✅ **user_permissions** - Relação N:N
4. ✅ **categories** - Categorias
5. ✅ **products** - Produtos
6. ✅ **product_images** - Imagens
7. ✅ **orders** - Pedidos
8. ✅ **order_items** - Itens do pedido
9. ✅ **reviews** - Avaliações
10. ✅ **addresses** - Endereços
11. ✅ **discounts** - Cupons
12. ✅ **wishlists** - Lista de desejos

### Tabelas a Adicionar

13. ⏳ **user_wallets** - Carteira de créditos
14. ⏳ **wallet_transactions** - Transações da carteira
15. ⏳ **payment_methods** - Métodos de pagamento salvos
16. ⏳ **vouchers** - Vouchers de crédito
17. ⏳ **product_stock_history** - Histórico de estoque

---

## 💰 Sistema de Créditos da Plataforma

### Entidade: UserWallet

```typescript
@Entity('user_wallets')
export class UserWallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number; // Saldo em créditos

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarned: number; // Total ganho

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number; // Total gasto

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => WalletTransaction, (transaction) => transaction.wallet)
  transactions: WalletTransaction[];
}
```

### Entidade: WalletTransaction

```typescript
export enum TransactionType {
  CREDIT = 'CREDIT',      // Adicionar crédito
  DEBIT = 'DEBIT',        // Remover crédito
  REFUND = 'REFUND',      // Reembolso
  VOUCHER = 'VOUCHER',    // Voucher
  PURCHASE = 'PURCHASE',  // Compra
}

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balanceBefore: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balanceAfter: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  referenceId: string; // ID do pedido, voucher, etc

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => UserWallet, (wallet) => wallet.transactions)
  @JoinColumn({ name: 'walletId' })
  wallet: UserWallet;
}
```

### Entidade: Voucher

```typescript
@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number; // Valor em créditos

  @Column({ default: false })
  isUsed: boolean;

  @Column({ nullable: true })
  usedBy: string; // userId

  @Column({ nullable: true })
  usedAt: Date;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Regras de Negócio - Créditos

1. **Adicionar Créditos via Voucher**
   - Validar código do voucher
   - Verificar se não foi usado
   - Verificar validade
   - Adicionar créditos à carteira
   - Marcar voucher como usado
   - Registrar transação

2. **Usar Créditos em Compra**
   - Verificar saldo suficiente
   - Deduzir do saldo
   - Registrar transação
   - Atualizar pedido

3. **Reembolso**
   - Adicionar créditos à carteira
   - Registrar transação de reembolso
   - Atualizar status do pedido

---

## 💳 Sistema de Métodos de Pagamento

### Entidade: PaymentMethod

```typescript
export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  WALLET = 'WALLET', // Créditos da plataforma
}

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
  })
  type: PaymentMethodType;

  // Dados do cartão (criptografados)
  @Column({ nullable: true })
  cardLastFourDigits: string;

  @Column({ nullable: true })
  cardBrand: string; // Visa, Mastercard, etc

  @Column({ nullable: true })
  cardHolderName: string;

  @Column({ nullable: true })
  cardExpiryMonth: string;

  @Column({ nullable: true })
  cardExpiryYear: string;

  @Column({ nullable: true })
  cardToken: string; // Token do gateway de pagamento

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
```

**IMPORTANTE:** Nunca armazenar número completo do cartão ou CVV!

---

## 📸 Upload de Imagens de Produtos

### Estratégia de Upload

1. **Multer** para upload de arquivos
2. **Sharp** para processamento de imagens
3. **AWS S3** ou **Local Storage** para armazenamento

### Implementação

```typescript
// upload.service.ts
@Injectable()
export class UploadService {
  async uploadProductImage(
    file: Express.Multer.File,
    productId: string,
  ): Promise<ProductImage> {
    // 1. Validar arquivo (tipo, tamanho)
    this.validateImage(file);

    // 2. Processar imagem com Sharp
    const processedImage = await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside' })
      .jpeg({ quality: 90 })
      .toBuffer();

    // 3. Gerar nome único
    const filename = `${productId}-${Date.now()}.jpg`;

    // 4. Salvar (S3 ou local)
    const url = await this.saveImage(filename, processedImage);

    // 5. Criar registro no banco
    const image = this.productImageRepository.create({
      productId,
      url,
      altText: file.originalname,
    });

    return await this.productImageRepository.save(image);
  }

  private validateImage(file: Express.Multer.File) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de arquivo não permitido');
    }

    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande (máx 5MB)');
    }
  }
}
```

### Endpoint de Upload

```typescript
@Post(':id/images')
@UseInterceptors(FileInterceptor('image'))
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Permissions(Permission.CREATE_PRODUCT)
async uploadImage(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
) {
  return this.uploadService.uploadProductImage(file, id);
}
```

---

## 📦 Gerenciamento de Estoque

### Entidade: ProductStockHistory

```typescript
export enum StockMovementType {
  IN = 'IN',           // Entrada
  OUT = 'OUT',         // Saída
  ADJUSTMENT = 'ADJUSTMENT', // Ajuste
  RETURN = 'RETURN',   // Devolução
}

@Entity('product_stock_history')
export class ProductStockHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column({
    type: 'enum',
    enum: StockMovementType,
  })
  type: StockMovementType;

  @Column()
  quantity: number;

  @Column()
  stockBefore: number;

  @Column()
  stockAfter: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ nullable: true })
  userId: string; // Quem fez a movimentação

  @Column({ nullable: true })
  referenceId: string; // ID do pedido, etc

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
```

### Regras de Negócio - Estoque

1. **Adicionar Produto (Admin)**
   - Validar dados
   - Gerar slug único
   - Salvar produto
   - Registrar estoque inicial

2. **Atualizar Estoque**
   - Validar quantidade
   - Registrar movimentação
   - Atualizar produto
   - Notificar se estoque baixo

3. **Reservar Estoque (Pedido)**
   - Verificar disponibilidade
   - Reservar quantidade
   - Registrar movimentação
   - Confirmar ao pagar

4. **Alerta de Estoque Baixo**
   - Verificar threshold (ex: < 10)
   - Enviar notificação para admin
   - Marcar produto como "estoque baixo"

---

## 🎯 10+ Regras de Negócio Implementadas

### ✅ Implementadas (10)

1. ✅ **Validação de Senha Forte**
2. ✅ **Validação de CPF**
3. ✅ **Unicidade de Email**
4. ✅ **Unicidade de CPF**
5. ✅ **Bloqueio de Usuários Inativos**
6. ✅ **Geração Automática de Slug**
7. ✅ **Validação de Preço > 0**
8. ✅ **Estoque Não Negativo**
9. ✅ **Proteção de Produtos com Pedidos**
10. ✅ **Atualização de Média de Avaliações**

### ⏳ A Implementar (5+)

11. ⏳ **Validação de Saldo de Créditos**
12. ⏳ **Expiração de Vouchers**
13. ⏳ **Limite de Uso de Cupons**
14. ⏳ **Validação de Estoque ao Criar Pedido**
15. ⏳ **Cálculo Automático de Valores do Pedido**

---

## 🚀 Próximos Passos Prioritários

### 1. Adicionar Entidades Faltantes
- [ ] UserWallet
- [ ] WalletTransaction
- [ ] Voucher
- [ ] PaymentMethod
- [ ] ProductStockHistory

### 2. Implementar Upload de Imagens
- [ ] Instalar multer e sharp
- [ ] Criar UploadService
- [ ] Endpoint de upload
- [ ] Validações

### 3. Implementar Sistema de Créditos
- [ ] WalletService
- [ ] Endpoints de carteira
- [ ] Voucher system
- [ ] Integração com pedidos

### 4. Melhorar Autenticação
- [ ] Refresh tokens
- [ ] Blacklist de tokens
- [ ] Logout funcional
- [ ] Rate limiting

### 5. Adicionar Interceptors e Middleware
- [ ] Logging interceptor
- [ ] Transform interceptor
- [ ] Rate limiting middleware
- [ ] Request ID middleware

---

**Documentação criada para o projeto Doce Encanto**