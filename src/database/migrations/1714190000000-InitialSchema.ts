import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1714190000000 implements MigrationInterface {
  name = 'InitialSchema1714190000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar enum para user roles
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('ADMIN', 'MANAGER', 'FINANCIAL', 'SUPPORT', 'CUSTOMER')
    `);

    // Criar enum para order status
    await queryRunner.query(`
      CREATE TYPE "order_status_enum" AS ENUM (
        'PENDING', 'PAYMENT_PENDING', 'PAYMENT_CONFIRMED', 
        'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
      )
    `);

    // Criar enum para payment method
    await queryRunner.query(`
      CREATE TYPE "payment_method_enum" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'WALLET')
    `);

    // Criar enum para transaction type
    await queryRunner.query(`
      CREATE TYPE "transaction_type_enum" AS ENUM ('CREDIT', 'DEBIT', 'REFUND', 'VOUCHER', 'PURCHASE')
    `);

    // Criar enum para transaction status
    await queryRunner.query(`
      CREATE TYPE "transaction_status_enum" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')
    `);

    // Criar enum para ticket status
    await queryRunner.query(`
      CREATE TYPE "ticket_status_enum" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED')
    `);

    // Criar enum para ticket priority
    await queryRunner.query(`
      CREATE TYPE "ticket_priority_enum" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT')
    `);

    // Criar enum para ticket category
    await queryRunner.query(`
      CREATE TYPE "ticket_category_enum" AS ENUM (
        'GENERAL', 'ORDER', 'PAYMENT', 'PRODUCT', 'REFUND', 'TECHNICAL', 'ACCOUNT'
      )
    `);

    // Criar enum para refund status
    await queryRunner.query(`
      CREATE TYPE "refund_status_enum" AS ENUM (
        'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED'
      )
    `);

    // Criar enum para refund reason
    await queryRunner.query(`
      CREATE TYPE "refund_reason_enum" AS ENUM (
        'DEFECTIVE_PRODUCT', 'WRONG_PRODUCT', 'NOT_AS_DESCRIBED', 
        'DAMAGED_SHIPPING', 'LATE_DELIVERY', 'CHANGED_MIND', 'OTHER'
      )
    `);

    // Criar enum para stock movement type
    await queryRunner.query(`
      CREATE TYPE "stock_movement_type_enum" AS ENUM (
        'PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'LOSS'
      )
    `);

    // Criar enum para report type
    await queryRunner.query(`
      CREATE TYPE "report_type_enum" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM')
    `);

    // Criar enum para report status
    await queryRunner.query(`
      CREATE TYPE "report_status_enum" AS ENUM ('GENERATING', 'COMPLETED', 'FAILED')
    `);

    // Tabela: permissions
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL UNIQUE,
        "description" text,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // Tabela: users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar NOT NULL UNIQUE,
        "password" varchar NOT NULL,
        "fullName" varchar NOT NULL,
        "cpf" varchar(11) NOT NULL UNIQUE,
        "phone" varchar,
        "role" "user_role_enum" NOT NULL DEFAULT 'CUSTOMER',
        "isActive" boolean DEFAULT true,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // Tabela: user_permissions (many-to-many)
    await queryRunner.query(`
      CREATE TABLE "user_permissions" (
        "userId" uuid NOT NULL,
        "permissionId" uuid NOT NULL,
        PRIMARY KEY ("userId", "permissionId"),
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE
      )
    `);

    // Tabela: categories
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "slug" varchar NOT NULL UNIQUE,
        "description" text,
        "isActive" boolean DEFAULT true,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // Tabela: products
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "slug" varchar NOT NULL UNIQUE,
        "description" text NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "compareAtPrice" decimal(10,2),
        "stockQuantity" int DEFAULT 0,
        "sku" varchar,
        "weight" int,
        "categoryId" uuid NOT NULL,
        "isActive" boolean DEFAULT true,
        "isFeatured" boolean DEFAULT false,
        "tags" text[],
        "averageRating" decimal(3,2) DEFAULT 0,
        "reviewCount" int DEFAULT 0,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
      )
    `);

    // Tabela: product_images
    await queryRunner.query(`
      CREATE TABLE "product_images" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "url" varchar NOT NULL,
        "altText" varchar,
        "order" int DEFAULT 0,
        "isPrimary" boolean DEFAULT false,
        "createdAt" timestamp DEFAULT now(),
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    // Tabela: product_stock_history
    await queryRunner.query(`
      CREATE TABLE "product_stock_history" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "movementType" "stock_movement_type_enum" NOT NULL,
        "quantity" int NOT NULL,
        "previousStock" int NOT NULL,
        "newStock" int NOT NULL,
        "reason" text,
        "orderId" uuid,
        "userId" uuid,
        "createdAt" timestamp DEFAULT now(),
        FOREIGN KEY ("productId") REFERENCES "products"("id"),
        FOREIGN KEY ("userId") REFERENCES "users"("id")
      )
    `);

    // Tabela: addresses
    await queryRunner.query(`
      CREATE TABLE "addresses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "street" varchar NOT NULL,
        "number" varchar NOT NULL,
        "complement" varchar,
        "neighborhood" varchar NOT NULL,
        "city" varchar NOT NULL,
        "state" varchar(2) NOT NULL,
        "zipCode" varchar(8) NOT NULL,
        "isDefault" boolean DEFAULT false,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Tabela: orders
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderNumber" varchar NOT NULL UNIQUE,
        "userId" uuid NOT NULL,
        "status" "order_status_enum" DEFAULT 'PENDING',
        "subtotal" decimal(10,2) NOT NULL,
        "discount" decimal(10,2) DEFAULT 0,
        "shippingCost" decimal(10,2) DEFAULT 0,
        "total" decimal(10,2) NOT NULL,
        "paymentMethod" "payment_method_enum" NOT NULL,
        "shippingAddressId" uuid,
        "trackingCode" varchar,
        "notes" text,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        FOREIGN KEY ("userId") REFERENCES "users"("id"),
        FOREIGN KEY ("shippingAddressId") REFERENCES "addresses"("id")
      )
    `);

    // Tabela: order_items
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "quantity" int NOT NULL,
        "unitPrice" decimal(10,2) NOT NULL,
        "subtotal" decimal(10,2) NOT NULL,
        "createdAt" timestamp DEFAULT now(),
        FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
        FOREIGN KEY ("productId") REFERENCES "products"("id")
      )
    `);

    // Tabela: reviews
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "orderId" uuid,
        "rating" int NOT NULL CHECK (rating >= 1 AND rating <= 5),
        "title" varchar,
        "comment" text,
        "isVerifiedPurchase" boolean DEFAULT false,
        "isApproved" boolean DEFAULT false,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        FOREIGN KEY ("productId") REFERENCES "products"("id"),
        FOREIGN KEY ("userId") REFERENCES "users"("id"),
        FOREIGN KEY ("orderId") REFERENCES "orders"("id")
      )
    `);

    // Tabela: discounts
    await queryRunner.query(`
      CREATE TABLE "discounts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "code" varchar NOT NULL UNIQUE,
        "description" text,
        "discountType" varchar NOT NULL,
        "discountValue" decimal(10,2) NOT NULL,
        "minPurchaseAmount" decimal(10,2) DEFAULT 0,
        "usageLimit" int,
        "usageCount" int DEFAULT 0,
        "startDate" timestamp NOT NULL,
        "endDate" timestamp NOT NULL,
        "isActive" boolean DEFAULT true,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // Tabela: wishlists
    await queryRunner.query(`
      CREATE TABLE "wishlists" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "createdAt" timestamp DEFAULT now(),
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
        UNIQUE ("userId", "productId")
      )
    `);

    // Tabela: user_wallets
    await queryRunner.query(`
      CREATE TABLE "user_wallets" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL UNIQUE,
        "balance" decimal(10,2) DEFAULT 0,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Tabela: wallet_transactions
    await queryRunner.query(`
      CREATE TABLE "wallet_transactions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "walletId" uuid NOT NULL,
        "type" "transaction_type_enum" NOT NULL,
        "status" "transaction_status_enum" DEFAULT 'PENDING',
        "amount" decimal(10,2) NOT NULL,
        "previousBalance" decimal(10,2) NOT NULL,
        "newBalance" decimal(10,2) NOT NULL,
        "description" text,
        "orderId" uuid,
        "referenceId" varchar,
        "createdAt" timestamp DEFAULT now(),
        FOREIGN KEY ("walletId") REFERENCES "user_wallets"("id") ON DELETE CASCADE
      )
    `);

    // Tabela: vouchers
    await queryRunner.query(`
      CREATE TABLE "vouchers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "code" varchar NOT NULL UNIQUE,
        "amount" decimal(10,2) NOT NULL,
        "expiresAt" timestamp,
        "isUsed" boolean DEFAULT false,
        "usedAt" timestamp,
        "usedById" uuid,
        "createdAt" timestamp DEFAULT now(),
        FOREIGN KEY ("usedById") REFERENCES "users"("id")
      )
    `);

    // Tabela: payment_methods
    await queryRunner.query(`
      CREATE TABLE "payment_methods" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" "payment_method_enum" NOT NULL,
        "cardLastFourDigits" varchar,
        "cardBrand" varchar,
        "cardHolderName" varchar,
        "cardExpiryMonth" varchar,
        "cardExpiryYear" varchar,
        "cardToken" varchar,
        "isDefault" boolean DEFAULT false,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Tabela: support_tickets
    await queryRunner.query(`
      CREATE TABLE "support_tickets" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "ticketNumber" varchar NOT NULL UNIQUE,
        "userId" uuid NOT NULL,
        "assignedToId" uuid,
        "subject" varchar NOT NULL,
        "description" text NOT NULL,
        "status" "ticket_status_enum" DEFAULT 'OPEN',
        "priority" "ticket_priority_enum" DEFAULT 'MEDIUM',
        "category" "ticket_category_enum" DEFAULT 'GENERAL',
        "orderId" uuid,
        "resolvedAt" timestamp,
        "resolvedById" uuid,
        "resolutionNotes" text,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        FOREIGN KEY ("userId") REFERENCES "users"("id"),
        FOREIGN KEY ("assignedToId") REFERENCES "users"("id"),
        FOREIGN KEY ("resolvedById") REFERENCES "users"("id")
      )
    `);

    // Tabela: ticket_messages
    await queryRunner.query(`
      CREATE TABLE "ticket_messages" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "ticketId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "message" text NOT NULL,
        "isInternal" boolean DEFAULT false,
        "attachments" text[],
        "createdAt" timestamp DEFAULT now(),
        FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE,
        FOREIGN KEY ("userId") REFERENCES "users"("id")
      )
    `);

    // Tabela: refund_requests
    await queryRunner.query(`
      CREATE TABLE "refund_requests" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "refundNumber" varchar NOT NULL UNIQUE,
        "orderId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "reason" "refund_reason_enum" NOT NULL,
        "description" text NOT NULL,
        "requestedAmount" decimal(10,2) NOT NULL,
        "approvedAmount" decimal(10,2),
        "status" "refund_status_enum" DEFAULT 'PENDING',
        "attachments" text[],
        "reviewedById" uuid,
        "reviewedAt" timestamp,
        "reviewNotes" text,
        "approvedById" uuid,
        "approvedAt" timestamp,
        "approvalNotes" text,
        "processedById" uuid,
        "processedAt" timestamp,
        "processingNotes" text,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        FOREIGN KEY ("orderId") REFERENCES "orders"("id"),
        FOREIGN KEY ("userId") REFERENCES "users"("id"),
        FOREIGN KEY ("reviewedById") REFERENCES "users"("id"),
        FOREIGN KEY ("approvedById") REFERENCES "users"("id"),
        FOREIGN KEY ("processedById") REFERENCES "users"("id")
      )
    `);

    // Tabela: financial_reports
    await queryRunner.query(`
      CREATE TABLE "financial_reports" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "reportNumber" varchar NOT NULL UNIQUE,
        "type" "report_type_enum" NOT NULL,
        "startDate" date NOT NULL,
        "endDate" date NOT NULL,
        "totalRevenue" decimal(12,2) NOT NULL,
        "totalRefunds" decimal(12,2) NOT NULL,
        "netRevenue" decimal(12,2) NOT NULL,
        "totalOrders" int NOT NULL,
        "completedOrders" int NOT NULL,
        "cancelledOrders" int NOT NULL,
        "refundedOrders" int NOT NULL,
        "averageOrderValue" decimal(10,2) NOT NULL,
        "newCustomers" int NOT NULL,
        "returningCustomers" int NOT NULL,
        "totalDiscounts" decimal(12,2) NOT NULL,
        "totalShipping" decimal(12,2) NOT NULL,
        "walletCreditsUsed" decimal(12,2) NOT NULL,
        "walletCreditsAdded" decimal(12,2) NOT NULL,
        "topProducts" jsonb,
        "topCategories" jsonb,
        "paymentMethods" jsonb,
        "additionalMetrics" jsonb,
        "status" "report_status_enum" DEFAULT 'GENERATING',
        "generatedById" uuid,
        "filePath" varchar,
        "createdAt" timestamp DEFAULT now(),
        FOREIGN KEY ("generatedById") REFERENCES "users"("id")
      )
    `);

    // Criar índices para melhor performance
    await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users"("email")`);
    await queryRunner.query(`CREATE INDEX "idx_users_cpf" ON "users"("cpf")`);
    await queryRunner.query(`CREATE INDEX "idx_products_slug" ON "products"("slug")`);
    await queryRunner.query(`CREATE INDEX "idx_products_category" ON "products"("categoryId")`);
    await queryRunner.query(`CREATE INDEX "idx_orders_user" ON "orders"("userId")`);
    await queryRunner.query(`CREATE INDEX "idx_orders_status" ON "orders"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_reviews_product" ON "reviews"("productId")`);
    await queryRunner.query(`CREATE INDEX "idx_tickets_user" ON "support_tickets"("userId")`);
    await queryRunner.query(`CREATE INDEX "idx_tickets_status" ON "support_tickets"("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Dropar tabelas na ordem reversa (respeitando foreign keys)
    await queryRunner.query(`DROP TABLE IF EXISTS "financial_reports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refund_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ticket_messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "support_tickets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_methods"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vouchers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wallet_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_wallets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wishlists"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "discounts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "addresses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_stock_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_permissions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions"`);

    // Dropar enums
    await queryRunner.query(`DROP TYPE IF EXISTS "report_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "report_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "stock_movement_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "refund_reason_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "refund_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ticket_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ticket_priority_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ticket_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "order_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}

