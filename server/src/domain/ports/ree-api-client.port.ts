import { ElectricBalance } from '../entities/electric-balance';

export interface IREEApiClient {
  fetchDailyBalance(date: string): Promise<ElectricBalance[]>;
}

export const REE_API_CLIENT = 'IREEApiClient';
