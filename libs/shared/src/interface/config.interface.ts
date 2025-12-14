export interface AppConfig {
  nodeEnv: 'development' | 'production';
  port: number;
}
export interface DBConfig {
  dbname: string;
  dburl: string;
  poolsize: number;
}

export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  jwtAccessTokenSecret: string;
  jwtAccessTokenExpiry: number;
  jwtRefreshTokenSecret: string;
  jwtRefreshTokenExpiry: number;
}
