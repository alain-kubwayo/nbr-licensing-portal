import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { AppModule } from './app.module';
import { applyGlobalAppConfiguration } from './common/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  applyGlobalAppConfiguration(app);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
