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

  @Get('health')
  async health() {
    if (!this.dataSource.isInitialized) {
      return {
        status: 'db_error',
        db: false,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      return {
        status: 'db_error',
        db: false,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: 'ok',
      db: true,
      timestamp: new Date().toISOString(),
    };
  }
}
