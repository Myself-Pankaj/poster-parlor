export interface AppConfig {
  nodeEnv: 'development' | 'production';
  port: number;
}
export interface DBConfig {
  dbname: string;
  dburl: string;
  poolsize: number;
}
