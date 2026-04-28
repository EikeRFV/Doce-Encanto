# 🗄️ Configuração do Banco de Dados PostgreSQL

## Visão Geral

O projeto **Doce Encanto** utiliza **PostgreSQL 15** como banco de dados relacional, gerenciado através do **TypeORM** com sistema de **migrations** para controle de versão do schema.

## 📦 Configuração do PostgreSQL

### Docker Compose

O PostgreSQL está configurado no `docker-compose.yml`:

```yaml
postgres:
  image: postgres:15-alpine
  container_name: doce_encanto_postgres
  environment:
    POSTGRES_USER: root
    POSTGRES_PASSWORD: rootpassword
    POSTGRES_DB: doce_encanto
  ports:
    - '5432:5432'
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

**Credenciais:**
- Host: localhost
- Porta: 5432
- Usuário: root
- Senha: rootpassword
- Database: doce_encanto

### Variáveis de Ambiente (.env)

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=root
DATABASE_PASSWORD=rootpassword
DATABASE_NAME=doce_encanto
```

## 🔧 TypeORM Configuration

### app.module.ts

O TypeORM está configurado no módulo principal:

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    port: configService.get('DATABASE_PORT'),
    username: configService.get('DATABASE_USER'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false, // IMPORTANTE: false em produção
    logging: configService.get('NODE_ENV') === 'development',
  }),
  inject: [ConfigService],
})
```

### ormconfig.ts

Arquivo de configuração para migrations:

```typescript
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || 'rootpassword',
  database: process.env.DATABASE_NAME || 'doce_encanto',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});
```

## 📋 Sistema de Migrations

### O que são Migrations?

Migrations são arquivos que descrevem mudanças no schema do banco de dados de forma versionada e controlada. Cada migration tem dois métodos:
- `up()`: Aplica as mudanças
- `down()`: Reverte as mudanças

### Scripts Disponíveis

```bash
# Gerar migration automaticamente baseada nas entidades
npm run migration:generate src/database/migrations/NomeDaMigration

# Criar migration vazia
npm run migration:create src/database/migrations/NomeDaMigration

# Executar migrations pendentes
npm run migration:run

# Reverter última migration
npm run migration:revert
```

## 🗂️ Estrutura de Tabelas

### Tabelas Principais

1. **users** - Usuários do sistema
2. **permissions** - Permissões disponíveis
3. **user_permissions** - Relação N:N entre users e permissions
4. **categories** - Categorias de produtos
5. **products** - Produtos (velas e sabonetes)
6. **product_images** - Imagens dos produtos
7. **orders** - Pedidos
8. **order_items** - Itens dos pedidos
9. **reviews** - Avaliações de produtos
10. **addresses** - Endereços de entrega
11. **discounts** - Cupons de desconto
12. **wishlists** - Lista de desejos

### Diagrama de Relacionamentos

```
users (1) ----< (N) orders
users (1) ----< (N) reviews
users (1) ----< (N) addresses
users (N) ----< (N) permissions (user_permissions)

categories (1) ----< (N) products
products (1) ----< (N) product_images
products (1) ----< (N) order_items
products (1) ----< (N) reviews

orders (1) ----< (N) order_items
```

## 🚀 Como Usar

### 1. Iniciar PostgreSQL

```bash
docker-compose up -d postgres
```

Verificar se está rodando:
```bash
docker ps
```

### 2. Gerar Migration Inicial

```bash
npm run migration:generate src/database/migrations/InitialSchema
```

Isso criará um arquivo em `src/database/migrations/` com todas as tabelas baseadas nas entidades.

### 3. Executar Migrations

```bash
npm run migration:run
```

Saída esperada:
```
query: SELECT * FROM "information_schema"."tables" WHERE "table_schema" = current_schema() AND "table_name" = 'migrations'
query: CREATE TABLE "migrations" (...)
query: SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC
Migration InitialSchema1234567890123 has been executed successfully.
```

### 4. Verificar Tabelas Criadas

Conectar ao PostgreSQL:
```bash
docker exec -it doce_encanto_postgres psql -U root -d doce_encanto
```

Listar tabelas:
```sql
\dt
```

Descrever uma tabela:
```sql
\d users
```

Sair:
```sql
\q
```

## 📝 Exemplo de Migration

### Migration Gerada Automaticamente

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1714190000000 implements MigrationInterface {
    name = 'InitialSchema1714190000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_permissions_name" UNIQUE ("name"),
                CONSTRAINT "PK_permissions" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "fullName" character varying NOT NULL,
                "phone" character varying,
                "cpf" character varying,
                "role" character varying NOT NULL DEFAULT 'CUSTOMER',
                "isActive" boolean NOT NULL DEFAULT true,
                "emailVerifiedAt" TIMESTAMP,
                "lastLoginAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "UQ_users_cpf" UNIQUE ("cpf"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

        // ... outras tabelas ...
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        // ... outras tabelas ...
    }
}
```

### Migration Manual (Exemplo)

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexToProductsName1714190000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_products_name" ON "products" ("name")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "IDX_products_name"
        `);
    }
}
```

## 🌱 Seeds (Popular Banco)

### Criar Seeds

Arquivo: `src/database/seeds/run-seeds.ts`

```typescript
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { Permission } from '../../modules/users/entities/permission.entity';
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
  console.log('🌱 Iniciando seeds...');

  // 1. Criar permissões
  const permissionRepository = AppDataSource.getRepository(Permission);
  const permissions = Object.values(PermissionEnum).map((name) => ({
    name,
    description: `Permissão para ${name.replace(/_/g, ' ').toLowerCase()}`,
  }));
  await permissionRepository.save(permissions);
  console.log('✅ Permissões criadas');

  // 2. Criar usuário admin
  const userRepository = AppDataSource.getRepository(User);
  const allPermissions = await permissionRepository.find();
  
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = userRepository.create({
    email: 'admin@doceencanto.com',
    password: adminPassword,
    fullName: 'Administrador do Sistema',
    role: UserRole.ADMIN,
    isActive: true,
    emailVerifiedAt: new Date(),
    permissions: allPermissions,
  });
  await userRepository.save(admin);
  console.log('✅ Usuário admin criado');

  // 3. Criar usuário manager
  const managerPassword = await bcrypt.hash('Manager@123', 10);
  const managerPermissions = allPermissions.filter(p => 
    p.name.includes('PRODUCT') || 
    p.name.includes('CATEGORY') || 
    p.name.includes('ORDER') ||
    p.name.includes('INVENTORY')
  );
  
  const manager = userRepository.create({
    email: 'manager@doceencanto.com',
    password: managerPassword,
    fullName: 'Gerente da Loja',
    role: UserRole.MANAGER,
    isActive: true,
    emailVerifiedAt: new Date(),
    permissions: managerPermissions,
  });
  await userRepository.save(manager);
  console.log('✅ Usuário manager criado');

  // 4. Criar usuário cliente
  const customerPassword = await bcrypt.hash('Customer@123', 10);
  const customer = userRepository.create({
    email: 'cliente@example.com',
    password: customerPassword,
    fullName: 'Cliente Teste',
    cpf: '12345678900',
    phone: '11987654321',
    role: UserRole.CUSTOMER,
    isActive: true,
    emailVerifiedAt: new Date(),
  });
  await userRepository.save(customer);
  console.log('✅ Usuário cliente criado');

  console.log('\n🎉 Seeds executados com sucesso!');
  console.log('\n📋 Usuários criados:');
  console.log('Admin: admin@doceencanto.com / Admin@123');
  console.log('Manager: manager@doceencanto.com / Manager@123');
  console.log('Cliente: cliente@example.com / Customer@123');

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Erro ao executar seeds:', error);
  process.exit(1);
});
```

### Executar Seeds

```bash
npm run seed
```

## 🔍 Comandos Úteis

### Conectar ao PostgreSQL

```bash
# Via Docker
docker exec -it doce_encanto_postgres psql -U root -d doce_encanto

# Via psql local (se instalado)
psql -h localhost -U root -d doce_encanto
```

### Comandos SQL Úteis

```sql
-- Listar todas as tabelas
\dt

-- Descrever estrutura de uma tabela
\d users

-- Ver dados de uma tabela
SELECT * FROM users;

-- Contar registros
SELECT COUNT(*) FROM users;

-- Ver migrations executadas
SELECT * FROM migrations;

-- Limpar uma tabela
TRUNCATE TABLE users CASCADE;

-- Deletar banco (cuidado!)
DROP DATABASE doce_encanto;
```

### Backup e Restore

```bash
# Backup
docker exec doce_encanto_postgres pg_dump -U root doce_encanto > backup.sql

# Restore
docker exec -i doce_encanto_postgres psql -U root doce_encanto < backup.sql
```

## ⚠️ Boas Práticas

### 1. Nunca use `synchronize: true` em produção
- Pode causar perda de dados
- Use sempre migrations

### 2. Sempre teste migrations
```bash
# Executar
npm run migration:run

# Reverter se houver problema
npm run migration:revert
```

### 3. Nomeie migrations descritivamente
```bash
# Bom
npm run migration:generate src/database/migrations/AddEmailIndexToUsers

# Ruim
npm run migration:generate src/database/migrations/Update
```

### 4. Faça backup antes de migrations importantes
```bash
docker exec doce_encanto_postgres pg_dump -U root doce_encanto > backup_$(date +%Y%m%d).sql
```

### 5. Use transações em seeds
```typescript
await AppDataSource.transaction(async (manager) => {
  // Operações aqui
});
```

## 🐛 Troubleshooting

### Erro: "relation does not exist"
```bash
# Executar migrations
npm run migration:run
```

### Erro: "database does not exist"
```bash
# Recriar container
docker-compose down
docker-compose up -d postgres
```

### Erro: "password authentication failed"
```bash
# Verificar .env
cat .env | grep DATABASE

# Verificar docker-compose.yml
docker-compose config
```

### Limpar tudo e recomeçar
```bash
# Parar containers
docker-compose down

# Remover volumes (CUIDADO: apaga dados!)
docker-compose down -v

# Recriar
docker-compose up -d
npm run migration:run
npm run seed
```

## 📚 Referências

- [TypeORM Migrations](https://typeorm.io/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker PostgreSQL](https://hub.docker.com/_/postgres)

---

**Desenvolvido para o projeto Doce Encanto**