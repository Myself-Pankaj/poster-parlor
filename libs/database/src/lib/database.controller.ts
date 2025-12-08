import { Controller, Get } from '@nestjs/common';
import { DatabseHealthService } from './database.service';

@Controller('db-health')
export class DatabaseController {
  constructor(private readonly databaseHealthService: DatabseHealthService) {}

  @Get()
  async healthCheck() {
    const res = await this.databaseHealthService.checkHealth();
    return res;
  }
}
