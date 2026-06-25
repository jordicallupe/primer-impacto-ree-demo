import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBalanceQuery } from './features/electric-balance/api/useBalanceQuery';
import { BalanceChart } from './features/electric-balance/components/BalanceChart';
import { BalanceChartSkeleton } from './features/electric-balance/components/BalanceChartSkeleton';

const queryClient = new QueryClient();

function BalanceDashboard() {
  const [from, setFrom] = useState('2024-01-01');                                      
  const [to, setTo]     = useState('2024-01-07');

  const { data, isLoading, isError, refetch } = useBalanceQuery(from, to);

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <h1>Balance Eléctrico España</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <label>
          Desde: <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </label>
        <label>
          Hasta: <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </label>
      </div>

      {isLoading && <BalanceChartSkeleton />}

      {isError && (
        <div>
          <p>Error al cargar los datos.</p>
          <button onClick={() => refetch()}>Reintentar</button>
        </div>
      )}

      {data && data.length > 0 && <BalanceChart data={data} />}
      {data && data.length === 0 && <p>No hay datos para este rango de fechas.</p>}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BalanceDashboard />
    </QueryClientProvider>
  );
}