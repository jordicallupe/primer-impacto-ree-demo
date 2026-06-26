import { SyncFromREEUseCase } from './sync-from-ree.use-case';
import { ElectricBalance } from '../entities/electric-balance';
import { BALANCE_REPOSITORY } from '../ports/balance-repository.port';
import { REE_API_CLIENT } from '../ports/ree-api-client.port';
import { Test } from '@nestjs/testing';

const mockEntry = new ElectricBalance(
  '2024-01-15',
  'Renovable',
  '10291',
  'Eólica',
  false,
  159629.9,
  0.539,
);

const mockREEClient = { fetchDailyBalance: jest.fn() };
const mockRepo = { upsertMany: jest.fn(), findByDateRange: jest.fn() };

describe('SyncFromREEUseCase', () => {
  let useCase: SyncFromREEUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SyncFromREEUseCase,
        { provide: REE_API_CLIENT, useValue: mockREEClient },
        { provide: BALANCE_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get(SyncFromREEUseCase);
    jest.clearAllMocks();
  });

  it('llama a REE con la fecha correcta y guarda los datos', async () => {
    mockREEClient.fetchDailyBalance.mockResolvedValue([mockEntry]);
    mockRepo.upsertMany.mockResolvedValue(undefined);

    await useCase.execute('2024-01-15');

    expect(mockREEClient.fetchDailyBalance).toHaveBeenCalledWith('2024-01-15');
    expect(mockRepo.upsertMany).toHaveBeenCalledWith([mockEntry]);
  });

  it('no lanza excepción si REE falla (graceful degradation)', async () => {
    mockREEClient.fetchDailyBalance.mockRejectedValue(new Error('REE down'));

    await expect(useCase.execute('2024-01-15')).resolves.not.toThrow();
    expect(mockRepo.upsertMany).not.toHaveBeenCalled();
  });

  it('no lanza excepción si el repositorio falla', async () => {
    mockREEClient.fetchDailyBalance.mockResolvedValue([mockEntry]);
    mockRepo.upsertMany.mockRejectedValue(new Error('DB error'));

    await expect(useCase.execute('2024-01-15')).resolves.not.toThrow();
  });
});
