import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Auth } from '@poster-parlor-api/auth';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Auth()
  getData() {
    return this.appService.getData();
  }
}
