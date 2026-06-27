import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GetBalanceUseCase } from '../../domain/use-cases/get-balance.use-case';
import { SyncFromREEUseCase } from '../../domain/use-cases/sync-from-ree.use-case';
import { BalanceController } from './balance.controller';

const getBalance = { execute: jest.fn() };
const syncUseCase = { execute: jest.fn() };

describe('BalanceController', () => {
  let controller: BalanceController;

  beforeEach(() => {
    controller = new BalanceController(
      getBalance as unknown as GetBalanceUseCase,
      syncUseCase as unknown as SyncFromREEUseCase,
    );
    jest.clearAllMocks();
  });

  it('valida fechas y consulta el rango solicitado', async () => {
    getBalance.execute.mockResolvedValue([]);

    await controller.getRange('2024-01-01', '2024-01-31');

    expect(getBalance.execute).toHaveBeenCalledWith(
      '2024-01-01',
      '2024-01-31',
      {
        timeTrunc: 'day',
        geoLimit: 'national',
        geoIds: 'all',
      },
    );
  });

  it('rechaza fechas con formato incorrecto', async () => {
    await expect(
      controller.getRange('2024/01/01', '2024-01-31'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza rangos invertidos', async () => {
    await expect(
      controller.getRange('2024-02-01', '2024-01-31'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('informa error si la sincronización manual falla', async () => {
    syncUseCase.execute.mockResolvedValue({
      success: false,
      error: 'REE down',
    });

    await expect(controller.syncToday('2024-01-15')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
