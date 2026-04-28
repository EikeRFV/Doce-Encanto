# Migração para Sequelize - Doce Encanto

## ✅ Status da Migração

A migração de TypeORM para Sequelize foi concluída com sucesso para os módulos principais:

- ✅ Configuração do Sequelize
- ✅ Modelos: Category, Product, ProductImage, OrderItem, Review
- ✅ Módulos atualizados: CategoriesModule, ProductsModule
- ✅ Migrations criadas
- ✅ Seeders com produtos especificados

## 📦 Produtos Criados no Seeder

### Categoria: Aroma e Flor
1. **Margarida de Sabonete** - R$ 6,50
2. **Mini Aromatizador 30ml** - R$ 12,00
3. **Vela Aromática Pequena** - R$ 20,00
4. **Vela Aromática Média** - R$ 35,00
5. **Vela Aromática Grande** - R$ 55,00

### Categoria: Pura Doçura
**Docinhos (100 unidades):**
- Brigadeiro - R$ 85,00
- Ninho - R$ 85,00
- Morango - R$ 85,00
- Paçoca - R$ 85,00
- Churros - R$ 90,00

**Trufas 20g (R$ 3,00 cada ou 2 por R$ 5,00):**
- Brigadeiro
- Ninho
- Maracujá
- Morango
- Limão
- Coco
- Paçoca

**Linhas Comemorativas:**
- Páscoa - R$ 120,00
- Dia dos Namorados - R$ 95,00
- Natal - R$ 150,00

### Categoria: Feitos com Amor
**Chaveiros de Tricotin - R$ 15,00:**
- Coração
- Estrela
- Flor

**Canetas de Tricotin - R$ 20,00:**
- Unicórnio
- Flores
- Personagens

**Canecas Personalizadas - R$ 40,00:**
- Com Nome
- Com Foto
- Com Frase

**Total: 32 produtos criados**

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

Certifique-se de que o arquivo `.env` está configurado:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=root
DATABASE_PASSWORD=rootpassword
DATABASE_NAME=doce_encanto
NODE_ENV=development
```

### 2. Executar Migrations

```bash
# Executar todas as migrations
npm run db:migrate

# Reverter última migration
npm run db:migrate:undo

# Reverter todas as migrations
npm run db:migrate:undo:all
```

### 3. Executar Seeders

```bash
# Executar todos os seeders (criar produtos)
npm run db:seed

# Reverter último seeder
npm run db:seed:undo

# Reverter todos os seeders
npm run db:seed:undo:all
```

### 4. Iniciar a Aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📝 Scripts Disponíveis

### Sequelize (Novo)
- `npm run sequelize` - CLI do Sequelize
- `npm run db:migrate` - Executar migrations
- `npm run db:migrate:undo` - Reverter última migration
- `npm run db:seed` - Executar seeders
- `npm run db:seed:undo` - Reverter último seeder

### TypeORM (Legado - manter por enquanto)
- `npm run typeorm:migration:run` - Executar migrations TypeORM
- `npm run typeorm:seed` - Executar seeds TypeORM

## 🔄 Próximos Passos

### Pendente de Migração:
1. **Services** - Atualizar sintaxe de queries:
   - `ProductsService` - Converter queries TypeORM para Sequelize
   - `CategoriesService` - Converter queries TypeORM para Sequelize
   
2. **Outros Módulos**:
   - Users
   - Orders
   - Reviews
   - Wallets
   - Addresses

3. **Testes**:
   - Testar todas as rotas da API
   - Verificar relacionamentos
   - Validar queries complexas

## 📚 Diferenças TypeORM vs Sequelize

### Buscar Todos
```typescript
// TypeORM
await this.repository.find({ where: { isActive: true } });

// Sequelize
await this.model.findAll({ where: { isActive: true } });
```

### Buscar Um
```typescript
// TypeORM
await this.repository.findOne({ where: { id } });

// Sequelize
await this.model.findOne({ where: { id } });
// ou
await this.model.findByPk(id);
```

### Criar
```typescript
// TypeORM
const entity = this.repository.create(data);
await this.repository.save(entity);

// Sequelize
await this.model.create(data);
```

### Atualizar
```typescript
// TypeORM
await this.repository.update(id, data);

// Sequelize
await this.model.update(data, { where: { id } });
// ou
const instance = await this.model.findByPk(id);
await instance.update(data);
```

### Deletar
```typescript
// TypeORM
await this.repository.delete(id);

// Sequelize
await this.model.destroy({ where: { id } });
```

### Relacionamentos
```typescript
// TypeORM
await this.repository.find({ relations: ['category', 'images'] });

// Sequelize
await this.model.findAll({ 
  include: [
    { model: Category, as: 'category' },
    { model: ProductImage, as: 'images' }
  ] 
});
```

## ⚠️ Notas Importantes

1. **Transações**: Sequelize usa transações de forma diferente
2. **Query Builder**: Sequelize não tem query builder como TypeORM
3. **Decorators**: Sequelize usa decorators diferentes
4. **Migrations**: Formato completamente diferente
5. **Sincronização**: `synchronize: false` em produção sempre!

## 🐛 Troubleshooting

### Erro: "relation does not exist"
Execute as migrations: `npm run db:migrate`

### Erro: "Cannot find module"
Instale as dependências: `npm install`

### Erro de conexão com banco
Verifique as variáveis de ambiente no `.env`

### Tabelas vazias
Execute os seeders: `npm run db:seed`

## 📞 Suporte

Para dúvidas sobre a migração, consulte:
- [Documentação Sequelize](https://sequelize.org/)
- [Documentação NestJS Sequelize](https://docs.nestjs.com/techniques/database#sequelize-integration)