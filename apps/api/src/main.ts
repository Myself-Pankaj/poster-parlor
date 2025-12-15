import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AppLogger } from '@poster-parlor-api/logger';
import { AppConfigService } from '@poster-parlor-api/config';
import { ValidationPipe } from '@nestjs/common';
import {
  GlobalExceptionFilter,
  ResponseInterceptor,
} from '@poster-parlor-api/utils';
import cookieParser from 'cookie-parser';
import { JwtAuthGuard } from '@poster-parlor-api/auth';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  //Logger Configuration
  const logger = app.get(AppLogger);
  logger.setContext('Bootstrap');
  app.useLogger(logger);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const config = app.get(AppConfigService);

  app.use(cookieParser());

  app.enableCors({
    credential: true,
    origin: 'localhost',
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // // Global filters and interceptors (inject logger)
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useGlobalInterceptors(new ResponseInterceptor(logger));

  //GLobal gaurds
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  const port = config.appConfig.port;
  await app.listen(port);

  logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
