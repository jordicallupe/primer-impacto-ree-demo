import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBalanceQuery } from './features/electric-balance/api/useBalanceQuery';
import { BalanceChart } from './features/electric-balance/components/BalanceChart';
import { BalanceChartSkeleton } from './features/electric-balance/components/BalanceChartSkeleton';

const queryClient = new QueryClient();

function BalanceDashboard() {
  const [from, setFrom] = useState('2024-01-01');
  const [to, setTo] = useState('2024-01-07');

  const { data, isLoading, isError, refetch } = useBalanceQuery(from, to);

  return (
    <main className="mx-auto w-[min(1120px,calc(100%_-_2rem))] py-10 max-md:w-[calc(100%_-_1.5rem)] max-md:py-6">
      <header className="mb-7 grid grid-cols-[minmax(0,1fr)_minmax(280px,420px)] items-end gap-8 max-md:grid-cols-1 max-md:gap-3.5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            Red Eléctrica de España
          </p>
          <h1 className="m-0 text-5xl leading-none font-bold text-slate-950 max-md:text-4xl">
            Balance eléctrico
          </h1>
        </div>
        <p className="m-0 text-left leading-7 text-slate-600">
          Consulta el histórico agregado por tipo de generación para comparar
          la evolución diaria del sistema eléctrico español.
        </p>
      </header>

      <section
        className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border border-slate-300 bg-slate-50 p-4"
        aria-label="Rango de fechas"
      >
        <label className="grid min-w-[180px] gap-1.5 text-left text-sm font-bold text-slate-700 max-md:min-w-full">
          <span>Desde</span>
          <input
            className="h-[42px] rounded-md border border-slate-400 bg-white px-3 text-slate-950"
            type="date"
            value={from}
            max={to}
            onChange={e => setFrom(e.target.value)}
          />
        </label>
        <label className="grid min-w-[180px] gap-1.5 text-left text-sm font-bold text-slate-700 max-md:min-w-full">
          <span>Hasta</span>
          <input
            className="h-[42px] rounded-md border border-slate-400 bg-white px-3 text-slate-950"
            type="date"
            value={to}
            min={from}
            onChange={e => setTo(e.target.value)}
          />
        </label>
      </section>

      {isLoading && (
        <div data-testid="chart-skeleton">
          <BalanceChartSkeleton />
        </div>
      )}
      {isError && (
        <section className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-5 text-red-800 max-md:flex-col max-md:items-stretch">
          <p>Error al cargar los datos.</p>
          <button
            className="cursor-pointer rounded-md bg-emerald-800 px-3.5 py-2.5 font-bold text-white"
            onClick={() => refetch()}
          >
            Reintentar
          </button>
        </section>
      )}

      {data && data.length > 0 && (
        <section className="rounded-lg border border-slate-300 bg-white p-5">
          <BalanceChart data={data} />
        </section>
      )}
      {data && data.length === 0 && (
        <section className="rounded-lg border border-slate-300 bg-white p-5 text-slate-700">
          <p className="m-0">No hay datos para este rango de fechas.</p>
        </section>
      )}
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BalanceDashboard />
    </QueryClientProvider>
  );
}
