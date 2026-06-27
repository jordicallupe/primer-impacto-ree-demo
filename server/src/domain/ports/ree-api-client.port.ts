import { ElectricBalance } from '../entities/electric-balance';

export type TimeTrunc = 'day' | 'month' | 'year';

export interface REEGeoParams {
  geoTrunc?: 'electric_system';
  geoLimit?: 'peninsular' | 'canarias' | 'baleares' | 'ceuta' | 'melilla';
  geoIds?: string;
}

export interface REEBalanceQuery extends REEGeoParams {
  timeTrunc?: TimeTrunc;
}

export interface IREEApiClient {
  fetchDailyBalance(
    date: string,
    query?: REEBalanceQuery,
  ): Promise<ElectricBalance[]>;
}

export const REE_API_CLIENT = 'IREEApiClient';
