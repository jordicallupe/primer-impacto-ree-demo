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
}

const COLORS: Record<string, string> = {
  'Renovable':      'rgba(47, 166, 136, 0.8)',
  'No-Renovable':   'rgba(224, 92, 92, 0.8)',
  'Almacenamiento': 'rgba(240, 165, 0, 0.8)',
  'Demanda':        'rgba(74, 144, 217, 0.8)',
};

function transformData(entries: BalanceEntry[]) {
  const totals = entries.filter(e => e.isTotal);
  const dates  = [...new Set(totals.map(e => e.date))].sort();
  const groups = [...new Set(totals.map(e => e.groupId))];

  const datasets = groups.map(group => ({
    label: group,
    data: dates.map(date => {
      const entry = totals.find(e => e.date === date && e.groupId === group);
      return entry ? Math.abs(entry.valueMwh) / 1000 : 0;
    }),
    backgroundColor: COLORS[group] ?? 'rgba(136, 132, 216, 0.8)',
    stack: 'balance',
  }));

  return { labels: dates, datasets };
}

export function BalanceChart({ data }: Props) {
  const chartData = transformData(data);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Balance Eléctrico (GWh)' },
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