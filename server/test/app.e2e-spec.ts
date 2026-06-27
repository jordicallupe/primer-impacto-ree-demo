import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { BalanceController } from '../src/infrastructure/http/balance.controller';
import { GetBalanceUseCase } from '../src/domain/use-cases/get-balance.use-case';
import { SyncFromREEUseCase } from '../src/domain/use-cases/sync-from-ree.use-case';
import { ElectricBalance } from '../src/domain/entities/electric-balance';

const getBalance = { execute: jest.fn() };
const syncUseCase = { execute: jest.fn() };

describe('Balance API (e2e)', () => {
  let app: INestApplication;
  let httpServer: App;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BalanceController],
      providers: [
        { provide: GetBalanceUseCase, useValue: getBalance },
        { provide: SyncFromREEUseCase, useValue: syncUseCase },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer() as App;
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /balance returns balance entries for a valid range', async () => {
    const entries = [
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
    getBalance.execute.mockResolvedValue(entries);

    await request(httpServer)
      .get('/balance')
      .query({ from: '2024-01-01', to: '2024-01-31' })
      .expect(200)
      .expect([
        {
          date: '2024-01-15',
          groupId: 'Renovable',
          sourceId: 'Renovable',
          sourceName: 'Generación renovable',
          isTotal: true,
          valueMwh: 296067.6,
          percentage: 1,
          timeTrunc: 'day',
          geoLimit: 'national',
          geoIds: 'all',
          sourceColor: null,
          magnitude: null,
        },
      ]);

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

  it('GET /balance rejects invalid dates', async () => {
    await request(httpServer)
      .get('/balance')
      .query({ from: '2024-99-01', to: '2024-01-31' })
      .expect(400);
  });

  it('GET /balance/sync reports upstream sync failures', async () => {
    syncUseCase.execute.mockResolvedValue({
      success: false,
      error: 'REE unavailable',
    });

    await request(httpServer)
      .get('/balance/sync')
      .query({ date: '2024-01-15' })
      .expect(503);
  });
});
