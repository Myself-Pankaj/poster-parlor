import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig, DBConfig } from '@poster-parlor-api/shared';
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get appConfig(): AppConfig {
    return {
      nodeEnv: this.configService.getOrThrow<'development' | 'production'>(
        'NODE_ENV'
      ),
      port: this.configService.getOrThrow<number>('PORT'),
    };
  }
  get dbConfig(): DBConfig {
    return {
      dbname: this.configService.getOrThrow<string>('DB_NAME'),
      dburl: this.configService.getOrThrow<string>('DB_URL'),
      poolsize: this.configService.getOrThrow<number>('POOL_SIZE'),
    };
  }
  get isDevelopment(): boolean {
    return this.appConfig.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.appConfig.nodeEnv === 'production';
  }
}
