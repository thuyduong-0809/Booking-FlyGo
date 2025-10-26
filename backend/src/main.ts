import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable CORS
    app.enableCors({
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe());

    // Serve static files from public directory
    app.useStaticAssets(join(process.cwd(), 'public'), {
        prefix: '/',
        index: false,
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);

    console.log(`🚀 Backend is running on: http://localhost:${port}`);
}

bootstrap();

