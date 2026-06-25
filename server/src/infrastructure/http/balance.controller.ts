import { Controller, Get, Query } from '@nestjs/common';
import { GetBalanceUseCase } from '../../domain/use-cases/get-balance.use-case';
import { SyncFromREEUseCase } from 'src/domain/use-cases/sync-from-ree.use-case';
import { format, toZonedTime } from 'date-fns-tz';
import { subDays } from 'date-fns';

@Controller('balance')
export class BalanceController {
  constructor(
    private readonly getBalance: GetBalanceUseCase,
    private readonly syncUseCase: SyncFromREEUseCase,
  ) {}

  @Get()
  async getRange(@Query('from') from: string, @Query('to') to: string) {
    return this.getBalance.execute(from, to);
  }

  @Get('sync')
  async syncToday(@Query('date') date?: string) {
    const madrid = toZonedTime(new Date(), 'Europe/Madrid');
    const target = date ?? format(subDays(madrid, 1), 'yyyy-MM-dd');
    await this.syncUseCase.execute(target);
    return { synced: target };
  }
}
