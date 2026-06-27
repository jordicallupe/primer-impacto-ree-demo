import { Inject, Injectable } from '@nestjs/common';
import type { IBalanceRepository } from '../ports/balance-repository.port';
import type { BalanceFilters } from '../ports/balance-repository.port';
import { BALANCE_REPOSITORY } from '../ports/balance-repository.port';
import type { ElectricBalance } from '../entities/electric-balance';

@Injectable()
export class GetBalanceUseCase {
  constructor(
    @Inject(BALANCE_REPOSITORY) private readonly repo: IBalanceRepository,
  ) {}

  async execute(
    from: string,
    to: string,
    filters?: BalanceFilters,
  ): Promise<ElectricBalance[]> {
    return this.repo.findByDateRange(from, to, filters);
  }
}
