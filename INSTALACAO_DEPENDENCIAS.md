# Guia de Instalação de Dependências - Doce Encanto API

## Dependências Já Instaladas

As seguintes dependências já estão configuradas no `package.json`:

```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "@nestjs/config": "^3.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/swagger": "^7.0.0",
  "@nestjs/cache-manager": "^2.0.0",
  "@nestjs/bullmq": "^10.0.0",
  "@nestjs/cqrs": "^10.0.0",
  "typeorm": "^0.3.17",
  "pg": "^8.11.0",
  "bcrypt": "^5.1.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1",
  "passport": "^0.6.0",
  "passport-jwt": "^4.0.1",
  "cache-manager-redis-yet": "^4.0.0",
  "bullmq": "^4.0.0"
}
```

---

## Dependências a Instalar

### 1. Upload de Arquivos (Multer)

Para habilitar o upload de imagens de produtos:

```bash
npm install --save @nestjs/platform-express multer
npm install --save-dev @types/multer
```

**Uso:**
```typescript
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
```

---

### 2. Processamento de Imagens (Sharp) - OPCIONAL

Para redimensionar e otimizar imagens:

```bash
npm install --save sharp
npm install --save-dev @types/sharp
```

**Uso:**
```typescript
import * as sharp from 'sharp';

// Redimensionar imagem
await sharp(file.path)
  .resize(800, 800, { fit: 'inside' })
  .jpeg({ quality: 80 })
  .toFile(outputPath);
```

---

### 3. Geração de PDFs (PDFKit) - OPCIONAL

Para gerar relatórios em PDF:

```bash
npm install --save pdfkit
npm install --save-dev @types/pdfkit
```

---

### 4. Geração de Excel (ExcelJS) - OPCIONAL

Para exportar relatórios em Excel:

```bash
npm install --save exceljs
```

---

### 5. Agendamento de Tarefas (Schedule)

Para relatórios automáticos e tarefas agendadas:

```bash
npm install --save @nestjs/schedule
```

**Uso:**
```typescript
import { ScheduleModule } from '@nestjs/schedule';
import { Cron, CronExpression } from '@nestjs/schedule';

// No módulo
imports: [ScheduleModule.forRoot()]

// No service
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async generateDailyReport() {
  // Lógica aqui
}
```

---

### 6. Validação de CPF

Já implementado manualmente no `auth.service.ts`, mas pode usar biblioteca:

```bash
npm install --save cpf-cnpj-validator
```

---

### 7. Envio de Emails (Nodemailer) - OPCIONAL

Para notificações por email:

```bash
npm install --save nodemailer
npm install --save-dev @types/nodemailer
```

---

### 8. Websockets (Socket.IO) - OPCIONAL

Para notificações em tempo real:

```bash
npm install --save @nestjs/websockets @nestjs/platform-socket.io
npm install --save socket.io
```

---

## Comandos de Instalação Completa

### Instalação Mínima (Necessária):
```bash
npm install --save @nestjs/platform-express multer @nestjs/schedule
npm install --save-dev @types/multer
```

### Instalação Recomendada:
```bash
npm install --save @nestjs/platform-express multer sharp @nestjs/schedule pdfkit exceljs
npm install --save-dev @types/multer @types/sharp @types/pdfkit
```

### Instalação Completa (com opcionais):
```bash
npm install --save @nestjs/platform-express multer sharp @nestjs/schedule pdfkit exceljs nodemailer @nestjs/websockets @nestjs/platform-socket.io socket.io cpf-cnpj-validator
npm install --save-dev @types/multer @types/sharp @types/pdfkit @types/nodemailer
```

---

## Configuração do Multer

Criar arquivo `src/config/multer.config.ts`:

```typescript
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/products',
    filename: (req, file, callback) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return callback(new Error('Apenas imagens são permitidas'), false);
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
```

---

## Configuração de Diretórios

Criar diretórios para uploads:

```bash
mkdir -p uploads/products
mkdir -p uploads/tickets
mkdir -p uploads/refunds
mkdir -p reports/generated
```

Adicionar ao `.gitignore`:

```
uploads/
reports/generated/
```

---

## Variáveis de Ambiente

Adicionar ao `.env`:

```env
# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Email (se usar Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# Relatórios
REPORTS_DIR=./reports/generated
```

---

## Configuração do Swagger para Upload

No controller de produtos:

```typescript
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

@Post(':id/images')
@UseInterceptors(FilesInterceptor('images', 5, multerConfig))
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      images: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary',
        },
      },
      isPrimary: {
        type: 'boolean',
      },
    },
  },
})
async uploadImages(
  @Param('id') id: string,
  @UploadedFiles() files: Express.Multer.File[],
  @Body('isPrimary') isPrimary: boolean,
) {
  return await this.productsService.uploadImages(id, files, isPrimary);
}
```

---

## Servir Arquivos Estáticos

No `main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Servir arquivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  await app.listen(3000);
}
```

---

## Verificação de Instalação

Após instalar as dependências, execute:

```bash
# Verificar se todas as dependências estão instaladas
npm list

# Compilar o projeto
npm run build

# Executar testes
npm run test

# Iniciar em modo desenvolvimento
npm run start:dev
```

---

## Troubleshooting

### Erro: Cannot find module 'multer'
```bash
npm install --save multer
npm install --save-dev @types/multer
```

### Erro: Sharp installation failed
```bash
npm rebuild sharp
```

### Erro: Permission denied ao criar diretórios
```bash
# Linux/Mac
sudo mkdir -p uploads/products
sudo chown -R $USER:$USER uploads/

# Windows (executar como administrador)
mkdir uploads\products
```

---

**Desenvolvido por:** Equipe Doce Encanto  
**Data:** Abril de 2026  
**Versão:** 1.0