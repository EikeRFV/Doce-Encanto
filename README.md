# 🕯️ Doce Encanto - API E-commerce

API completa para loja de velas artesanais aromáticas e sabonetes personalizados, desenvolvida com NestJS, PostgreSQL, Redis e implementando as melhores práticas de desenvolvimento.

## 📋 Sobre o Projeto

Sistema de e-commerce robusto e escalável para a loja **Doce Encanto**, permitindo que clientes naveguem, comprem produtos artesanais e gerenciem seus pedidos, enquanto administradores controlam estoque, pedidos e relatórios.

### ✨ Características Principais

- 🔐 **Autenticação JWT** com sistema completo de registro e login
- 👥 **Sistema RBAC** (Role-Based Access Control) com 3 níveis de acesso
- 🔑 **48 Permissões Granulares** para controle fino de acesso
- 📦 **85+ Endpoints** cobrindo todas as funcionalidades
- 📄 **Documentação Swagger** completa e interativa
- 🚀 **Cache com Redis** para alta performance
- 📊 **CQRS** para separação de comandos e queries
- 🔄 **Filas com BullMQ** para processamento assíncrono
- ✅ **15+ Regras de Negócio** complexas implementadas
- 🗃️ **Migrations e Seeds** para gerenciamento de banco de dados

## 🛠️ Tecnologias

- **Backend:** NestJS 11.x
- **Banco de Dados:** PostgreSQL 15
- **ORM:** TypeORM 0.3.x
- **Cache:** Redis 7
- **Filas:** BullMQ + RabbitMQ
- **Autenticação:** JWT (Passport)
- **Documentação:** Swagger/OpenAPI
- **Validação:** class-validator + class-transformer
- **Arquitetura:** CQRS

## 📁 Estrutura do Projeto

```
doce-encanto/
├── src/
│   ├── common/              # Recursos compartilhados
│   │   ├── decorators/      # Decorators customizados
│   │   ├── dto/            # DTOs comuns
│   │   ├── enums/          # Enumerações
│   │   └── guards/         # Guards de autenticação
│   ├── modules/            # Módulos da aplicação
│   │   ├── auth/          # Autenticação e registro
│   │   ├── users/         # Gerenciamento de usuários
│   │   ├── products/      # Catálogo de produtos
│   │   ├── categories/    # Categorias de produtos
│   │   ├── orders/        # Pedidos e checkout
│   │   ├── reviews/       # Avaliações de produtos
│   │   ├── addresses/     # Endereços de entrega
│   │   ├── discounts/     # Cupons de desconto
│   │   ├── wishlists/     # Lista de desejos
│   │   ├── permissions/   # Gerenciamento de permissões
│   │   └── reports/       # Relatórios e estatísticas
│   ├── database/
│   │   ├── migrations/    # Migrations do TypeORM
│   │   └── seeds/        # Seeds para popular o banco
│   ├── app.module.ts
│   └── main.ts
├── docker-compose.yml      # Serviços Docker
├── .env                   # Variáveis de ambiente
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ 
- Docker e Docker Compose
- Git

### 1. Clonar o Repositório

```bash
git clone https://github.com/[seu-usuario]/Doce-Encanto.git
cd Doce-Encanto
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

### 4. Iniciar Serviços Docker

```bash
docker-compose up -d
```

Isso iniciará:
- PostgreSQL (porta 5432)
- Redis (porta 6379)
- RabbitMQ (porta 5672, interface: 15672)

### 5. Executar Migrations

```bash
# Gerar migration inicial
npm run migration:generate src/database/migrations/InitialSchema

# Executar migrations
npm run migration:run
```

### 6. Executar Seeds (Opcional)

```bash
npm run seed
```

### 7. Iniciar a Aplicação

```bash
# Modo desenvolvimento
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

## 📚 Acessar Documentação

Após iniciar a aplicação, acesse:

- **API:** http://localhost:3000
- **Swagger:** http://localhost:3000/api/docs
- **RabbitMQ Management:** http://localhost:15672 (guest/guest)

## 🔑 Autenticação

### Registrar Novo Usuário

```bash
POST /auth/register
Content-Type: application/json

{
  "fullName": "João Silva",
  "email": "joao@example.com",
  "password": "Senha@123",
  "phone": "11987654321",
  "cpf": "12345678900"
}
```

### Fazer Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "Senha@123"
}
```

Resposta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "joao@example.com",
    "fullName": "João Silva",
    "role": "CUSTOMER"
  }
}
```

### Usar Token nas Requisições

```bash
GET /users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 👥 Níveis de Acesso

### CUSTOMER (Cliente)
- Navegar produtos
- Fazer pedidos
- Avaliar produtos
- Gerenciar perfil e endereços
- Ver próprios pedidos

### MANAGER (Gerente)
- Todas as permissões de CUSTOMER
- Gerenciar produtos e categorias
- Gerenciar estoque
- Ver todos os pedidos
- Moderar avaliações

### ADMIN (Administrador)
- Todas as permissões do sistema
- Gerenciar usuários
- Gerenciar permissões
- Acessar relatórios
- Configurações do sistema

## 📊 Principais Endpoints

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Fazer login

### Usuários
- `GET /users` - Listar usuários (admin)
- `GET /users/me` - Perfil do usuário logado
- `PATCH /users/me` - Atualizar perfil
- `GET /users/:id` - Buscar usuário por ID

### Produtos
- `GET /products` - Listar produtos (público)
- `GET /products/:id` - Detalhes do produto
- `POST /products` - Criar produto (admin/manager)
- `PATCH /products/:id` - Atualizar produto
- `DELETE /products/:id` - Deletar produto

### Categorias
- `GET /categories` - Listar categorias
- `POST /categories` - Criar categoria (admin)
- `GET /categories/:id/products` - Produtos da categoria

### Pedidos
- `GET /orders` - Listar pedidos
- `POST /orders` - Criar pedido
- `GET /orders/:id` - Detalhes do pedido
- `PATCH /orders/:id/status` - Atualizar status
- `POST /orders/:id/generate-pix` - Gerar QR Code PIX

### Avaliações
- `GET /reviews` - Listar avaliações
- `POST /reviews` - Criar avaliação
- `PATCH /reviews/:id/approve` - Aprovar avaliação (admin)

### Descontos
- `GET /discounts` - Listar cupons
- `POST /discounts/validate` - Validar cupom
- `POST /discounts` - Criar cupom (admin)

## 🔒 Regras de Negócio

O sistema implementa mais de 15 regras de negócio complexas, incluindo:

1. **Validação de Senha Forte** - Mínimo 8 caracteres com maiúsculas, minúsculas, números e caracteres especiais
2. **Validação de CPF** - Algoritmo completo de validação de CPF
3. **Unicidade de Email e CPF** - Não permite duplicatas
4. **Controle de Estoque** - Validação antes de criar pedidos
5. **Cálculo Automático de Valores** - Subtotal, desconto, frete e total
6. **Validação de Cupons** - Período, limite de uso e valor mínimo
7. **Proteção de Dados** - Produtos com pedidos não podem ser deletados
8. **Moderação de Avaliações** - Aprovação antes de exibir
9. **Restrição de Avaliação** - Apenas quem comprou pode avaliar
10. **Transições de Status** - Fluxo lógico de status de pedidos

📄 **Documento completo:** [REGRAS_DE_NEGOCIO.md](./REGRAS_DE_NEGOCIO.md)

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## 📦 Scripts Disponíveis

```bash
npm run start:dev          # Iniciar em modo desenvolvimento
npm run start:prod         # Iniciar em modo produção
npm run build             # Build da aplicação
npm run migration:generate # Gerar nova migration
npm run migration:run     # Executar migrations
npm run migration:revert  # Reverter última migration
npm run seed             # Executar seeds
npm run lint             # Verificar código
npm run format           # Formatar código
```

## 🐳 Docker

### Serviços Disponíveis

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Reiniciar serviço específico
docker-compose restart postgres
```

## 📈 Performance

- **Cache Redis:** Endpoints públicos cacheados por 60 segundos
- **Paginação:** Todos os endpoints de listagem suportam paginação
- **Índices:** Índices otimizados no banco de dados
- **CQRS:** Separação de leitura e escrita para melhor performance
- **Filas:** Processamento assíncrono de tarefas pesadas

## 🔐 Segurança

- Senhas hasheadas com bcrypt (10 rounds)
- JWT com expiração configurável
- Validação de entrada em todos os endpoints
- Guards de autenticação e autorização
- Proteção contra SQL Injection (TypeORM)
- CORS configurado
- Rate limiting (recomendado para produção)

## 📝 Documentação Adicional

- [Guia de Desenvolvimento](./DESENVOLVIMENTO.md) - Instruções detalhadas para continuar o desenvolvimento
- [Regras de Negócio](./REGRAS_DE_NEGOCIO.md) - Documentação completa das regras implementadas

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido como trabalho acadêmico.

## 👨‍💻 Autor

**[Seu Nome]**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- Email: seu-email@example.com

## 🙏 Agradecimentos

- Professor [Nome do Professor] pela orientação
- Colegas de turma pelo suporte
- Comunidade NestJS pela excelente documentação

---

⭐ Se este projeto te ajudou, considere dar uma estrela!
