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

export interface SyncBalanceResult {
  synced: boolean;
  date: string;
  entries: number;
}

export async function syncBalance({
  from,
  timeTrunc,
  geoLimit,
  geoIds,
}: BalanceQueryParams): Promise<SyncBalanceResult> {
  const params: Record<string, string> = {
    date: from,
    timeTrunc,
  };

  if (geoLimit !== 'national') {
    params.geoLimit = geoLimit;
    params.geoIds = geoIds;
  }

  const { data } = await apiClient.get<SyncBalanceResult>('/balance/sync', {
    params,
  });
  return data;
}
