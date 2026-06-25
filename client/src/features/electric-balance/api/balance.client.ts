import { apiClient } from '../../../shared/lib/axios';
import type { BalanceEntry } from '../types/balance.types';

export async function fetchBalance(from: string, to: string): Promise<BalanceEntry[]> {
  const { data } = await apiClient.get<BalanceEntry[]>('/balance', {
    params: { from, to },
  });
  return data;
}