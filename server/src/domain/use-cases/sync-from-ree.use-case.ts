import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IBalanceRepository } from '../ports/balance-repository.port';
import { BALANCE_REPOSITORY } from '../ports/balance-repository.port';
import type { IREEApiClient } from '../ports/ree-api-client.port';
import { REE_API_CLIENT } from '../ports/ree-api-client.port';

@Injectable()
export class SyncFromREEUseCase {
  private readonly logger = new Logger(SyncFromREEUseCase.name);

  constructor(
    @Inject(REE_API_CLIENT) private readonly reeClient: IREEApiClient,
    @Inject(BALANCE_REPOSITORY) private readonly repo: IBalanceRepository,
  ) {}

  async execute(date: string): Promise<void> {
    try {
      const entries = await this.reeClient.fetchDailyBalance(date);
      await this.repo.upsertMany(entries);
      this.logger.log(`Synced ${entries.length} entries for ${date}`);
    } catch (err) {
      this.logger.warn(
        `REE sync failed for ${date}: ${(err as Error).message}`,
      );
    }
  }
}
