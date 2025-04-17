import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}

// Call bootstrap and ensure we handle any errors
void bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
