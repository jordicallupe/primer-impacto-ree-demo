import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBalanceQuery } from './features/electric-balance/api/useBalanceQuery';
import { BalanceChart } from './features/electric-balance/components/BalanceChart';
import { BalanceChartSkeleton } from './features/electric-balance/components/BalanceChartSkeleton';
import type { BalanceEntry } from './features/electric-balance/types/balance.types';

const queryClient = new QueryClient();

const GEO_OPTIONS = [
  { label: 'Nacional', geoLimit: 'national', geoIds: 'all' },
  { label: 'Peninsular', geoLimit: 'peninsular', geoIds: '8741' },
  { label: 'Canarias', geoLimit: 'canarias', geoIds: '8742' },
  { label: 'Baleares', geoLimit: 'baleares', geoIds: '8743' },
  { label: 'Ceuta', geoLimit: 'ceuta', geoIds: '8744' },
  { label: 'Melilla', geoLimit: 'melilla', geoIds: '8745' },
];

function formatGwh(valueMwh: number) {
  return `${(Math.abs(valueMwh) / 1000).toLocaleString('es-ES', {
    maximumFractionDigits: 1,
  })} GWh`;
}

function sumBy(entries: BalanceEntry[], predicate: (entry: BalanceEntry) => boolean) {
  return entries.filter(predicate).reduce((sum, entry) => sum + Math.abs(entry.valueMwh), 0);
}

function getKpis(entries: BalanceEntry[]) {
  const totals = entries.filter(entry => entry.isTotal);
  const renewable = sumBy(totals, entry => entry.groupId === 'Renovable');
  const nonRenewable = sumBy(totals, entry => entry.groupId === 'No-Renovable');
  const demand = sumBy(totals, entry => entry.groupId === 'Demanda');
  const renewableShare = renewable + nonRenewable > 0
    ? (renewable / (renewable + nonRenewable)) * 100
    : 0;
  const peak = totals.reduce<BalanceEntry | undefined>((current, entry) => {
    if (!current) return entry;
    return Math.abs(entry.valueMwh) > Math.abs(current.valueMwh) ? entry : current;
  }, undefined);

  return [
    { label: 'Renovable', value: formatGwh(renewable) },
    { label: 'No renovable', value: formatGwh(nonRenewable) },
    { label: 'Peso renovable', value: `${renewableShare.toFixed(1)}%` },
    { label: 'Demanda', value: demand > 0 ? formatGwh(demand) : peak ? formatGwh(peak.valueMwh) : '0 GWh' },
  ];
}

function getTechnologyRows(entries: BalanceEntry[]) {
  const rows = new Map<string, { groupId: string; sourceName: string; valueMwh: number }>();

  for (const entry of entries.filter(item => !item.isTotal)) {
    const current = rows.get(entry.sourceId) ?? {
      groupId: entry.groupId,
      sourceName: entry.sourceName,
      valueMwh: 0,
    };
    current.valueMwh += Math.abs(entry.valueMwh);
    rows.set(entry.sourceId, current);
  }

  return [...rows.values()].sort((a, b) => b.valueMwh - a.valueMwh);
}

function BalanceDashboard() {
  const [from, setFrom] = useState('2026-01-01');
  const [to, setTo] = useState('2026-12-31');
  const [timeTrunc, setTimeTrunc] = useState('day');
  const [geoKey, setGeoKey] = useState('national');
  const [chartMode, setChartMode] = useState<'totals' | 'detail'>('totals');

  const geo = GEO_OPTIONS.find(option => option.geoLimit === geoKey) ?? GEO_OPTIONS[0];
  const { data, isLoading, isError, refetch } = useBalanceQuery({
    from,
    to,
    timeTrunc,
    geoLimit: geo.geoLimit,
    geoIds: geo.geoIds,
  });
  const kpis = getKpis(data ?? []);
  const technologyRows = getTechnologyRows(data ?? []);
  const hasDetailRows = technologyRows.length > 0;

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
        className="mb-6 grid grid-cols-[repeat(5,minmax(150px,1fr))] items-end gap-4 rounded-lg border border-slate-300 bg-slate-50 p-4 max-lg:grid-cols-2 max-sm:grid-cols-1"
        aria-label="Rango de fechas"
      >
        <label className="grid gap-1.5 text-left text-sm font-bold text-slate-700">
          <span>Desde</span>
          <input
            className="h-[42px] rounded-md border border-slate-400 bg-white px-3 text-slate-950"
            type="date"
            value={from}
            max={to}
            onChange={e => setFrom(e.target.value)}
          />
        </label>
        <label className="grid gap-1.5 text-left text-sm font-bold text-slate-700">
          <span>Hasta</span>
          <input
            className="h-[42px] rounded-md border border-slate-400 bg-white px-3 text-slate-950"
            type="date"
            value={to}
            min={from}
            onChange={e => setTo(e.target.value)}
          />
        </label>
        <label className="grid gap-1.5 text-left text-sm font-bold text-slate-700">
          <span>Agregación</span>
          <select
            className="h-[42px] rounded-md border border-slate-400 bg-white px-3 text-slate-950"
            value={timeTrunc}
            onChange={event => setTimeTrunc(event.target.value)}
          >
            <option value="day">Diaria</option>
            <option value="month">Mensual</option>
            <option value="year">Anual</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-left text-sm font-bold text-slate-700">
          <span>Ámbito</span>
          <select
            className="h-[42px] rounded-md border border-slate-400 bg-white px-3 text-slate-950"
            value={geoKey}
            onChange={event => setGeoKey(event.target.value)}
          >
            {GEO_OPTIONS.map(option => (
              <option key={option.geoLimit} value={option.geoLimit}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-1.5 text-left text-sm font-bold text-slate-700">
          <span>Vista</span>
          <div className="grid grid-cols-2 rounded-md border border-slate-400 bg-white p-1">
            <button
              className={`rounded px-3 py-2 text-sm ${chartMode === 'totals' ? 'bg-emerald-800 text-white' : 'text-slate-700'}`}
              type="button"
              onClick={() => setChartMode('totals')}
            >
              Totales
            </button>
            <button
              className={`rounded px-3 py-2 text-sm ${chartMode === 'detail' ? 'bg-emerald-800 text-white' : 'text-slate-700'}`}
              type="button"
              onClick={() => setChartMode('detail')}
            >
              Detalle
            </button>
          </div>
        </div>
      </section>

      <p className="mb-6 text-left text-sm text-slate-600">
        Los filtros consultan datos ya sincronizados en la base de datos. El
        proceso automático carga cada hora el día anterior en ámbito nacional y
        agregación diaria.
      </p>

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
        <>
          <section className="mb-6 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {kpis.map(kpi => (
              <article key={kpi.label} className="rounded-lg border border-slate-300 bg-white p-4 text-left">
                <p className="m-0 text-sm font-bold text-slate-500">{kpi.label}</p>
                <p className="mt-2 mb-0 text-2xl font-bold text-slate-950">{kpi.value}</p>
              </article>
            ))}
          </section>
          <section className="mb-6 rounded-lg border border-slate-300 bg-white p-5">
            <BalanceChart data={data} mode={chartMode} />
          </section>
          {hasDetailRows && (
            <section className="overflow-hidden rounded-lg border border-slate-300 bg-white">
              <div className="border-b border-slate-200 px-5 py-4 text-left">
                <h2 className="m-0 text-lg font-bold text-slate-950">Detalle por tecnología</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-5 py-3">Tecnología</th>
                      <th className="px-5 py-3">Grupo</th>
                      <th className="px-5 py-3 text-right">Energía</th>
                    </tr>
                  </thead>
                  <tbody>
                    {technologyRows.map(row => (
                      <tr key={`${row.groupId}-${row.sourceName}`} className="border-t border-slate-100">
                        <td className="px-5 py-3 font-medium text-slate-900">{row.sourceName}</td>
                        <td className="px-5 py-3 text-slate-600">{row.groupId}</td>
                        <td className="px-5 py-3 text-right font-semibold text-slate-900">
                          {formatGwh(row.valueMwh)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
      {data && data.length === 0 && (
        <section className="rounded-lg border border-slate-300 bg-white p-5 text-left text-slate-700">
          <p className="m-0 font-semibold text-slate-900">No hay datos para esta combinación.</p>
          <p className="mt-2 mb-0">
            Sincroniza primero ese rango, agregación y ámbito desde el endpoint
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5">/balance/sync</code>.
          </p>
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
