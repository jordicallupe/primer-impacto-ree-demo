import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchBalance } from './balance.client';

export function useBalanceQuery(from: string, to: string) {
  return useQuery({
    queryKey: ['balance', from, to],
    queryFn: () => fetchBalance(from, to),
    enabled: !!from && !!to,       // no ejecuta si faltan fechas
    staleTime: 1000 * 60 * 5,      // 5 min en caché
    retry: 3,                       // 3 reintentos automáticos
    placeholderData: keepPreviousData, // no parpadeo al cambiar fechas
  });
}