import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Doce Encanto API')
    .setDescription('API para loja de velas artesanais aromáticas e sabonetes personalizados')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Autenticação', 'Endpoints de autenticação e registro')
    .addTag('Usuários', 'Gerenciamento de usuários')
    .addTag('Produtos', 'Gerenciamento de produtos')
    .addTag('Categorias', 'Gerenciamento de categorias')
    .addTag('Pedidos', 'Gerenciamento de pedidos')
    .addTag('Avaliações', 'Gerenciamento de avaliações')
    .addTag('Endereços', 'Gerenciamento de endereços')
    .addTag('Descontos', 'Gerenciamento de cupons de desconto')
    .addTag('Lista de Desejos', 'Gerenciamento de lista de desejos')
    .addTag('Permissões', 'Gerenciamento de permissões')
    .addTag('Relatórios', 'Relatórios e estatísticas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  console.log(`📚 Documentação Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
