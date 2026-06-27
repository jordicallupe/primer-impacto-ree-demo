import { GetBalanceUseCase } from './get-balance.use-case';
import { ElectricBalance } from '../entities/electric-balance';
import { BALANCE_REPOSITORY } from '../ports/balance-repository.port';
import { Test } from '@nestjs/testing';

const mockEntries = [
  new ElectricBalance(
    '2024-01-15',
    'Renovable',
    '10291',
    'Eólica',
    false,
    159629.9,
    0.539,
  ),
  new ElectricBalance(
    '2024-01-15',
    'Renovable',
    'Renovable',
    'Generación renovable',
    true,
    296067.6,
    1,
  ),
];

const mockRepo = { upsertMany: jest.fn(), findByDateRange: jest.fn() };

describe('GetBalanceUseCase', () => {
  let useCase: GetBalanceUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GetBalanceUseCase,
        { provide: BALANCE_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get(GetBalanceUseCase);
    jest.clearAllMocks();
  });

  it('devuelve los datos del repositorio para el rango dado', async () => {
    mockRepo.findByDateRange.mockResolvedValue(mockEntries);

    const result = await useCase.execute('2024-01-15', '2024-01-15');

    expect(mockRepo.findByDateRange).toHaveBeenCalledWith(
      '2024-01-15',
      '2024-01-15',
      undefined,
    );
    expect(result).toHaveLength(2);
  });

  it('devuelve array vacío si no hay datos', async () => {
    mockRepo.findByDateRange.mockResolvedValue([]);

    const result = await useCase.execute('2024-01-15', '2024-01-15');

    expect(result).toEqual([]);
  });
});
