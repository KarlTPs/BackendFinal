import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true,
      transform: true,        // convierte payloads a las clases de los DTOs
    }),
  );

  // Aplica @Exclude() de class-transformer (oculta password del User)
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  app.enableCors();

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Book Reviews API')
    .setDescription(
      'API REST para gestión de libros y reseñas literarias con autenticación JWT',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        in: 'header',
      },
      'access-token', // nombre de referencia usado en @ApiBearerAuth()
    )
    .addTag('auth', 'Registro y autenticación')
    .addTag('users', 'Perfil y afinidad entre usuarios')
    .addTag('books', 'Catálogo de libros')
    .addTag('reviews', 'Reseñas de libros')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();