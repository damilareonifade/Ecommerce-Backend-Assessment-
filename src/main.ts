import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const prefix = 'api';

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1', // Default to v1 if no version specified
    prefix: `${prefix}/v`, // Creates /api/v1, /api/v2, etc.
  });

  // Enable global validation
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

  const mainOptions = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Testing the waters')
    .setDescription('')
    .setVersion('1.0')
    .build();

  const mainDocument = SwaggerModule.createDocument(app, mainOptions);
  writeFileSync('./swagger.json', JSON.stringify(mainDocument, null, 2));
  SwaggerModule.setup(`${prefix}/docs`, app, mainDocument, {
    swaggerOptions: { url: `/${prefix}/docs-json` },
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
