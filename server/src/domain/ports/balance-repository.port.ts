import { ElectricBalance } from '../entities/electric-balance';

export interface BalanceFilters {
  timeTrunc?: string;
  geoLimit?: string;
  geoIds?: string;
}

export interface IBalanceRepository {
  upsertMany(entries: ElectricBalance[]): Promise<void>;
  findByDateRange(
    from: string,
    to: string,
    filters?: BalanceFilters,
  ): Promise<ElectricBalance[]>;
}

export const BALANCE_REPOSITORY = 'IBalanceRepository';
