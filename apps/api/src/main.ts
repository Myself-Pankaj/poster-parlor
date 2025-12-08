import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AppLogger } from '@poster-parlor-api/logger';
import { AppConfigService } from '@poster-parlor-api/config';
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

  const port = config.appConfig.port;
  await app.listen(port);

  logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
