import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { BalanceEntry } from '../types/balance.types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  data: BalanceEntry[];
  mode?: 'totals' | 'detail';
}

const COLORS: Record<string, string> = {
  'Renovable':      'rgba(47, 166, 136, 0.8)',
  'No-Renovable':   'rgba(224, 92, 92, 0.8)',
  'Almacenamiento': 'rgba(240, 165, 0, 0.8)',
  'Demanda':        'rgba(74, 144, 217, 0.8)',
};

function transformData(entries: BalanceEntry[], mode: 'totals' | 'detail') {
  const filtered =
    mode === 'totals' ? entries.filter(e => e.isTotal) : entries.filter(e => !e.isTotal);
  const dates  = [...new Set(filtered.map(e => e.date))].sort();
  const groups = [...new Set(filtered.map(e => mode === 'totals' ? e.groupId : e.sourceName))];

  const datasets = groups.map(group => ({
    label: group,
    data: dates.map(date => {
      return filtered
        .filter(e => e.date === date && (mode === 'totals' ? e.groupId : e.sourceName) === group)
        .reduce((sum, entry) => sum + Math.abs(entry.valueMwh) / 1000, 0);
    }),
    backgroundColor:
      filtered.find(e => (mode === 'totals' ? e.groupId : e.sourceName) === group)
        ?.sourceColor ?? COLORS[group] ?? 'rgba(136, 132, 216, 0.8)',
    stack: 'balance',
  }));

  return { labels: dates, datasets };
}

export function BalanceChart({ data, mode = 'totals' }: Props) {
  const chartData = transformData(data, mode);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: mode === 'totals' ? 'Balance Eléctrico (GWh)' : 'Detalle por tecnología (GWh)' },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) => {
            const value = ctx.parsed.y ?? 0;
            return `${ctx.dataset.label}: ${value.toFixed(1)} GWh`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        ticks: {
          callback: (v: number | string) => `${v} GWh`,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
