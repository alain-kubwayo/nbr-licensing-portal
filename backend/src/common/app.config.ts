import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

export const applyGlobalAppConfiguration = (app: INestApplication) => {
  app.use(helmet());
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  configureSwagger(app);
  return app;
};

const configureSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('NBR Licensing API')
    .setDescription('API for managing NBR licenses')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
};
