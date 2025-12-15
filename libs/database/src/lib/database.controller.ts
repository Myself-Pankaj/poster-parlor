import { Controller, Get } from '@nestjs/common';
import { DatabseHealthService } from './database.service';
import { Public } from '@poster-parlor-api/auth';
@Controller('db-health')
export class DatabaseController {
  constructor(private readonly databaseHealthService: DatabseHealthService) {}

  @Get()
  @Public()
  async healthCheck() {
    const res = await this.databaseHealthService.checkHealth();
    return res;
  }
}
