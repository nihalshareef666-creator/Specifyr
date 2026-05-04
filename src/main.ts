import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Serve static files from the 'uploads' directory
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Enable CORS (Critical for Flutter)
  app.enableCors({
    origin: '*', 
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ENV CHECK
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('Warning: OPENROUTER_API_KEY is missing in .env. AI features may fail.');
    // Optional: comment out process.exit(1) if you want the server to start anyway for testing
    // process.exit(1); 
  }

  // LISTEN ON 0.0.0.0
  await app.listen(3000, '0.0.0.0');

  // LOG THE URLS
  console.log('Server started successfully!');
  console.log('Local: http://localhost:3000');
  console.log('Network: http://192.168.1.6:3000'); 
}
bootstrap();