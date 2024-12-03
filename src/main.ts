import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { PermissionGuard } from './guards/permission.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AwsIamExceptionFilter } from './exception-filters/aws-iam.exception.filter';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  app.useGlobalGuards(
    new JwtAuthGuard(reflector),
    new PermissionGuard(reflector),
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AwsIamExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('AWS Credential Manager')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
