import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  validateSync,
  ValidationError,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
}

class EnvironmentVaribale {
  @IsEnum(Environment, {
    message: 'NODE_ENV must be included from [production ,development]',
  })
  @IsNotEmpty({ message: 'NODE_ENV is required' })
  NODE_ENV!: Environment;

  @IsNumber({}, { message: 'PORT must be a valid number' })
  @Min(1000, { message: 'PORT must be atleat 1000' })
  @Max(65535, { message: 'PORT must be less than 65535' })
  @IsNotEmpty({ message: 'PORT is required' })
  PORT!: number;

  @IsString({ message: 'DATABASE_URL must be  valid string' })
  @IsNotEmpty({ message: 'DATABASE_URL is reuired' })
  DB_URL!: string;

  @IsString({ message: 'DATABASE_NAME must be  valid string' })
  @IsNotEmpty({ message: 'DATABASE_NAME is reuired' })
  DB_NAME!: string;

  @IsNumber({}, { message: 'POOL_SIZE must be a number' })
  @IsNotEmpty({ message: 'POOL_SIZE is required' })
  @Min(1, { message: 'POOL_SIZE must be atleat 1' })
  @Max(30, { message: 'POOL_SIZE must be less than 30' })
  POOL_SIZE!: number;
}

const logger = new Logger('ConfigValidation');

function formatValidationError(errors: ValidationError[]): string {
  return errors
    .map((err) => {
      const constraints = err.constraints || {};
      const msg = Object.values(constraints);

      return ` ✗ ${err.property} : ${msg.join(', ')} `;
    })
    .join('\n');
}
export function validateEnv(config: Record<string, unknown>) {
  logger.debug('Validating Environment varibale is in progress...');

  const cleanConfig = Object.entries(config).reduce((acc, [key, value]) => {
    acc[key] = value === '' ? undefined : value;
    return acc;
  }, {} as Record<string, unknown>);
  const validateConfig = plainToInstance(EnvironmentVaribale, cleanConfig, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validateConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const formattedErrors = formatValidationError(errors);

    logger.error('Environment Validation Failed');
    logger.error(formattedErrors);

    console.error(`\n ✗ Please fix the above env varibale in your .env file\n`);
    process.exit(1);
  }
  logger.log('✓ Environment varibale validated successfully');
}
