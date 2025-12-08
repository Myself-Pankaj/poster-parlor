import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from '@poster-parlor-api/logger';
import { AppConfigModule } from '@poster-parlor-api/config';
import { DatabaseModule } from '@poster-parlor-api/database';

@Module({
  imports: [LoggerModule, AppConfigModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
