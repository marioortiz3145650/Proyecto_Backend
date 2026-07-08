import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters({
    catch(exception: any, host: any) {
      const status = exception.getStatus ? exception.getStatus() : 500;
      const message = exception.message || 'Error interno del servidor';
      const response = host.switchToHttp().getResponse();
      const details = exception.stack || message;
      console.error('Unhandled exception:', details);
      response.status(status).json({
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: details }),
      });
    },
  } as any);
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
