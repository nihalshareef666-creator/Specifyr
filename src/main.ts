import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS (Flutter / frontend can connect)
  app.enableCors({
    origin: '*', // allow all for now (safe for dev)
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // removes unwanted fields
      forbidNonWhitelisted: true, // throws error if extra fields
      transform: true, // auto transform types
    }),
  );

  // ENV CHECK (CRITICAL)
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY is missing in .env');
    process.exit(1); // stop app immediately
  }

  console.log(' OPENROUTER_API_KEY loaded');

  await app.listen(3000);
}
bootstrap();