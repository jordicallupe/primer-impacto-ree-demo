import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // en el endpoint:
  @Get('health')
  health() {
    return {
      status: this.dataSource.isInitialized ? 'ok' : 'db_error',
      db: this.dataSource.isInitialized,
      timestamp: new Date().toISOString(),
    };
  }
}
