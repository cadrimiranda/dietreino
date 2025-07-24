import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurando CORS para permitir requisições do frontend
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5050',
      'http://localhost:3000',
      'https://dietreino.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders:
      'Content-Type,Accept,Authorization,apollo-require-preflight',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
