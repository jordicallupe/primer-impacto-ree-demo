import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchBalance } from './balance.client';
import type { BalanceQueryParams } from './balance.client';

export function useBalanceQuery(params: BalanceQueryParams) {
  return useQuery({
    queryKey: ['balance', params],
    queryFn: () => fetchBalance(params),
    enabled: !!params.from && !!params.to,
    staleTime: 1000 * 60 * 5,
    retry: 3,
    placeholderData: keepPreviousData, // no parpadeo al cambiar fechas
  });
}
