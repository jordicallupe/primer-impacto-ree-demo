import { apiClient } from '../../../shared/lib/axios';
import type { BalanceEntry } from '../types/balance.types';

export interface BalanceQueryParams {
  from: string;
  to: string;
  timeTrunc: string;
  geoLimit: string;
  geoIds: string;
}

export async function fetchBalance({
  from,
  to,
  timeTrunc,
  geoLimit,
  geoIds,
}: BalanceQueryParams): Promise<BalanceEntry[]> {
  const { data } = await apiClient.get<BalanceEntry[]>('/balance', {
    params: { from, to, timeTrunc, geoLimit, geoIds },
  });
  return data;
}
