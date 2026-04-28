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
  console.log('🌱 Iniciando seeds...\n');

  // 1. Criar permissões
  console.log('📝 Criando permissões...');
  const permissionRepository = AppDataSource.getRepository(Permission);
  const permissions = Object.values(PermissionEnum).map((name) => ({
    name,
    description: `Permissão para ${name.replace(/_/g, ' ').toLowerCase()}`,
  }));
  await permissionRepository.save(permissions);
  console.log('✅ 48 permissões criadas\n');

  // 2. Criar usuário admin
  console.log('👤 Criando usuários...');
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
  console.log('✅ Admin criado: admin@doceencanto.com');

  // 3. Criar usuário manager
  const managerPassword = await bcrypt.hash('Manager@123', 10);
  const managerPermissions = allPermissions.filter(p => 
    p.name.includes('PRODUCT') || 
    p.name.includes('CATEGORY') || 
    p.name.includes('ORDER') ||
    p.name.includes('INVENTORY') ||
    p.name.includes('REVIEW')
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
  console.log('✅ Manager criado: manager@doceencanto.com');

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
  console.log('✅ Cliente criado: cliente@example.com\n');

  // 5. Criar categorias
  console.log('📂 Criando categorias...');
  const categoryRepository = AppDataSource.getRepository(Category);
  const categories = [
    {
      name: 'Velas Aromáticas',
      slug: 'velas-aromaticas',
      description: 'Velas artesanais com aromas naturais para criar ambientes aconchegantes',
      isActive: true,
    },
    {
      name: 'Sabonetes Artesanais',
      slug: 'sabonetes-artesanais',
      description: 'Sabonetes personalizados feitos à mão com ingredientes naturais',
      isActive: true,
    },
    {
      name: 'Kits Presente',
      slug: 'kits-presente',
      description: 'Kits especiais combinando velas e sabonetes para presentear',
      isActive: true,
    },
    {
      name: 'Aromatizadores',
      slug: 'aromatizadores',
      description: 'Aromatizadores de ambiente com essências exclusivas',
      isActive: true,
    },
  ];
  await categoryRepository.save(categories);
  console.log('✅ 4 categorias criadas\n');

  // 6. Criar produtos de exemplo
  console.log('🕯️ Criando produtos...');
  const productRepository = AppDataSource.getRepository(Product);
  const velaCategory = await categoryRepository.findOne({ where: { slug: 'velas-aromaticas' } });
  const saboneteCategory = await categoryRepository.findOne({ where: { slug: 'sabonetes-artesanais' } });
  const kitCategory = await categoryRepository.findOne({ where: { slug: 'kits-presente' } });
  
  const products = [
    // Velas
    {
      name: 'Vela Aromática Lavanda',
      slug: 'vela-aromatica-lavanda',
      description: 'Vela artesanal com aroma de lavanda, perfeita para relaxamento e meditação. Feita com cera de soja natural.',
      price: 45.90,
      compareAtPrice: 59.90,
      stockQuantity: 50,
      categoryId: velaCategory?.id,
      isActive: true,
      isFeatured: true,
      tags: ['lavanda', 'relaxamento', 'natural'],
      weight: 200,
      sku: 'VEL-LAV-200',
    },
    {
      name: 'Vela Aromática Vanilla',
      slug: 'vela-aromatica-vanilla',
      description: 'Vela com aroma suave de baunilha, ideal para criar um ambiente acolhedor.',
      price: 42.90,
      stockQuantity: 45,
      categoryId: velaCategory?.id,
      isActive: true,
      isFeatured: true,
      tags: ['vanilla', 'aconchego', 'doce'],
      weight: 200,
      sku: 'VEL-VAN-200',
    },
    {
      name: 'Vela Aromática Eucalipto',
      slug: 'vela-aromatica-eucalipto',
      description: 'Vela refrescante com aroma de eucalipto, ótima para ambientes de trabalho.',
      price: 48.90,
      stockQuantity: 30,
      categoryId: velaCategory?.id,
      isActive: true,
      tags: ['eucalipto', 'refrescante', 'foco'],
      weight: 200,
      sku: 'VEL-EUC-200',
    },
    // Sabonetes
    {
      name: 'Sabonete Artesanal Mel e Aveia',
      slug: 'sabonete-artesanal-mel-aveia',
      description: 'Sabonete hidratante com mel e aveia, ideal para peles sensíveis.',
      price: 18.90,
      stockQuantity: 100,
      categoryId: saboneteCategory?.id,
      isActive: true,
      isFeatured: true,
      tags: ['mel', 'aveia', 'hidratante'],
      weight: 100,
      sku: 'SAB-MEL-100',
    },
    {
      name: 'Sabonete Artesanal Lavanda',
      slug: 'sabonete-artesanal-lavanda',
      description: 'Sabonete calmante com óleo essencial de lavanda.',
      price: 16.90,
      stockQuantity: 80,
      categoryId: saboneteCategory?.id,
      isActive: true,
      tags: ['lavanda', 'calmante', 'natural'],
      weight: 100,
      sku: 'SAB-LAV-100',
    },
    {
      name: 'Sabonete Artesanal Café',
      slug: 'sabonete-artesanal-cafe',
      description: 'Sabonete esfoliante com café, remove células mortas e revitaliza a pele.',
      price: 19.90,
      stockQuantity: 60,
      categoryId: saboneteCategory?.id,
      isActive: true,
      tags: ['café', 'esfoliante', 'revitalizante'],
      weight: 100,
      sku: 'SAB-CAF-100',
    },
    // Kits
    {
      name: 'Kit Relaxamento - Lavanda',
      slug: 'kit-relaxamento-lavanda',
      description: 'Kit completo com 1 vela e 2 sabonetes de lavanda. Perfeito para presente.',
      price: 75.90,
      compareAtPrice: 89.90,
      stockQuantity: 25,
      categoryId: kitCategory?.id,
      isActive: true,
      isFeatured: true,
      tags: ['kit', 'presente', 'lavanda', 'relaxamento'],
      weight: 400,
      sku: 'KIT-REL-LAV',
    },
    {
      name: 'Kit Bem-Estar',
      slug: 'kit-bem-estar',
      description: 'Kit com 2 velas aromáticas e 3 sabonetes variados.',
      price: 129.90,
      compareAtPrice: 159.90,
      stockQuantity: 15,
      categoryId: kitCategory?.id,
      isActive: true,
      isFeatured: true,
      tags: ['kit', 'presente', 'bem-estar', 'completo'],
      weight: 800,
      sku: 'KIT-BEM-EST',
    },
  ];
  
  await productRepository.save(products);
  console.log('✅ 8 produtos criados\n');

  console.log('🎉 Seeds executados com sucesso!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 CREDENCIAIS DE ACESSO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n👨‍💼 ADMIN (Acesso Total)');
  console.log('   Email: admin@doceencanto.com');
  console.log('   Senha: Admin@123');
  console.log('\n👔 MANAGER (Gerente)');
  console.log('   Email: manager@doceencanto.com');
  console.log('   Senha: Manager@123');
  console.log('\n👤 CLIENTE (Cliente)');
  console.log('   Email: cliente@example.com');
  console.log('   Senha: Customer@123');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 DADOS CRIADOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 48 Permissões');
  console.log('✅ 3 Usuários');
  console.log('✅ 4 Categorias');
  console.log('✅ 8 Produtos');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Erro ao executar seeds:', error);
  process.exit(1);
});

