import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncFromREEUseCase } from '../../domain/use-cases/sync-from-ree.use-case';
import { subDays, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class SyncCronJob {
  private readonly logger = new Logger(SyncCronJob.name);

  constructor(private readonly syncUseCase: SyncFromREEUseCase) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleSync() {
    const madridNow = toZonedTime(new Date(), 'Europe/Madrid');
    const yesterday = format(subDays(madridNow, 1), 'yyyy-MM-dd');

    this.logger.log(`Cron: syncing ${yesterday}`);
    await this.syncUseCase.execute(yesterday);
  }
}
