import { ElectricBalance } from '../entities/electric-balance';

export interface IBalanceRepository {
  upsertMany(entries: ElectricBalance[]): Promise<void>;
  findByDateRange(from: string, to: string): Promise<ElectricBalance[]>;
}

export const BALANCE_REPOSITORY = 'IBalanceRepository';
