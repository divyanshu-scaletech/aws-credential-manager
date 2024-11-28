import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './interceptors/transform.incerceptor';
import { PermissionGuard } from './guards/permission.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  app.useGlobalGuards(
    new JwtAuthGuard(reflector),
    new PermissionGuard(reflector),
  );
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('AWS Credential Manager')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT);
}
bootstrap();
