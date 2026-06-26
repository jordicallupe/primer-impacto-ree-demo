import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UseQueryResult } from '@tanstack/react-query';
import App from './App';
import type { BalanceEntry } from './features/electric-balance/types/balance.types';

vi.mock('./features/electric-balance/api/useBalanceQuery', () => ({
    useBalanceQuery: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
    Bar: () => <canvas data-testid="balance-chart" />,
}));

import { useBalanceQuery } from './features/electric-balance/api/useBalanceQuery';
const mockUseBalanceQuery = vi.mocked(useBalanceQuery);

function makeQueryResult(
    overrides: Partial<UseQueryResult<BalanceEntry[]>>,
): UseQueryResult<BalanceEntry[]> {
    return {
        data: undefined,
        isLoading: false,
        isError: false,
        isPending: false,
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        isLoadingError: false,
        isRefetchError: false,
        isPlaceholderData: false,
        isStale: false,
        isPaused: false,
        status: 'pending',
        fetchStatus: 'idle',
        error: null,
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        refetch: vi.fn(),
        ...overrides,
    } as UseQueryResult<BalanceEntry[]>;
}

describe('App', () => {
    it('muestra el skeleton mientras carga', () => {
        mockUseBalanceQuery.mockReturnValue(makeQueryResult({ isLoading: true, isPending: true, status: 'pending' }));
        render(<App />);
        expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();
    });

    it('muestra el botón de reintento en caso de error', () => {
        mockUseBalanceQuery.mockReturnValue(makeQueryResult({ isError: true, status: 'error', error: new Error('fail') }));
        render(<App />);
        expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });

    it('el botón de reintento llama a refetch', async () => {
        const mockRefetch = vi.fn();
        mockUseBalanceQuery.mockReturnValue(makeQueryResult({ isError: true, status: 'error', error: new Error('fail'), refetch: mockRefetch }));
        render(<App />);
        await userEvent.click(screen.getByText('Reintentar'));
        expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('muestra el gráfico cuando hay datos', () => {
        const data: BalanceEntry[] = [
            { date: '2024-01-15', groupId: 'Renovable', sourceId: 'Renovable', sourceName: 'Generación renovable', isTotal: true, valueMwh: 296067, percentage: 1 },
        ];
        mockUseBalanceQuery.mockReturnValue(makeQueryResult({ data, isSuccess: true, status: 'success' }));
        render(<App />);
        expect(screen.getByTestId('balance-chart')).toBeInTheDocument();
    });
});