import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectricBalanceEntity } from './adapters/persistence/electric-balance.entity';
import { BalanceTypeORMRepository } from './adapters/persistence/balance.repository';
import { REEApiClientImpl } from './adapters/ree/ree-api-client';
import { GetBalanceUseCase } from '../domain/use-cases/get-balance.use-case';
import { SyncFromREEUseCase } from '../domain/use-cases/sync-from-ree.use-case';
import { BALANCE_REPOSITORY } from '../domain/ports/balance-repository.port';
import { REE_API_CLIENT } from '../domain/ports/ree-api-client.port';
import { SyncCronJob } from './jobs/sync-cron.job';
import { BalanceController } from './http/balance.controller';

@Module({
  // qué necesito de fuera
  imports: [TypeOrmModule.forFeature([ElectricBalanceEntity])],
  // qué creo y gestiono aquí
  providers: [
    { provide: BALANCE_REPOSITORY, useClass: BalanceTypeORMRepository },
    { provide: REE_API_CLIENT, useClass: REEApiClientImpl },
    GetBalanceUseCase,
    SyncFromREEUseCase,
    SyncCronJob,
  ],
  // qué comparto con otros módulos
  exports: [GetBalanceUseCase, SyncFromREEUseCase],
  // qué rutas HTTP expongo
  controllers: [BalanceController],
})
export class BalanceModule {}
