import { render } from '@testing-library/react';
import { BalanceChart } from './BalanceChart';
import type { BalanceEntry } from '../types/balance.types';

// Chart.js necesita canvas — jsdom no lo implementa, lo mockeamos
vi.mock('react-chartjs-2', () => ({
  Bar: () => <canvas data-testid="balance-chart" />,
}));

const mockData: BalanceEntry[] = [
  { date: '2024-01-15', groupId: 'Renovable',    sourceId: 'Renovable',    sourceName: 'Generación renovable',    isTotal: true,  valueMwh: 296067, percentage: 1 },
  { date: '2024-01-15', groupId: 'No-Renovable', sourceId: 'No-Renovable', sourceName: 'Generación no renovable', isTotal: true,  valueMwh: 303928, percentage: 1 },
  { date: '2024-01-15', groupId: 'Renovable',    sourceId: '10291',        sourceName: 'Eólica',                  isTotal: false, valueMwh: 159629, percentage: 0.539 },
];

describe('BalanceChart', () => {
  it('renderiza el gráfico con datos', () => {
    const { getByTestId } = render(<BalanceChart data={mockData} />);
    expect(getByTestId('balance-chart')).toBeInTheDocument();
  });

  it('renderiza sin errores con array vacío', () => {
    expect(() => render(<BalanceChart data={[]} />)).not.toThrow();
  });
});