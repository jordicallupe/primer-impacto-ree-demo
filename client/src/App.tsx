import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBalanceQuery } from './features/electric-balance/api/useBalanceQuery';

const queryClient = new QueryClient();

function BalanceDashboard() {
  const [from, setFrom] = useState('2024-01-01');
  const [to, setTo]     = useState('2024-01-07');

  const { data, isLoading, isError, refetch } = useBalanceQuery(from, to);

  return (
    <div>
      <h1>Balance Eléctrico</h1>
      <div>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        <input type="date" value={to}   onChange={e => setTo(e.target.value)} />
      </div>

      {isLoading && <p>Cargando...</p>}
      {isError   && <button onClick={() => refetch()}>Reintentar</button>}
      {data      && <p>{data.length} registros cargados</p>}
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