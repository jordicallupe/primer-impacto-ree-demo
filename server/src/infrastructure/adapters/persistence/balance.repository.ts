import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IBalanceRepository } from '../../../domain/ports/balance-repository.port';
import type { BalanceFilters } from '../../../domain/ports/balance-repository.port';
import type { ElectricBalance } from '../../../domain/entities/electric-balance';
import { ElectricBalanceEntity } from './electric-balance.entity';

@Injectable()
export class BalanceTypeORMRepository implements IBalanceRepository {
  constructor(
    @InjectRepository(ElectricBalanceEntity)
    private readonly repo: Repository<ElectricBalanceEntity>,
  ) {}

  async upsertMany(entries: ElectricBalance[]): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(ElectricBalanceEntity)
      .values(entries)
      .orUpdate(
        [
          'value_mwh',
          'percentage',
          'is_total',
          'source_name',
          'source_color',
          'magnitude',
        ],
        ['datetime', 'source_id', 'time_trunc', 'geo_limit', 'geo_ids'],
      )
      .execute();
  }

  async findByDateRange(
    from: string,
    to: string,
    filters: BalanceFilters = {},
  ): Promise<ElectricBalance[]> {
    const fromBound = filters.timeTrunc === 'hour' ? `${from}T00:00` : from;
    const toBound = filters.timeTrunc === 'hour' ? `${to}T23:59:59` : to;
    const query = this.repo
      .createQueryBuilder('b')
      .where('b.date >= :from AND b.date <= :to', {
        from: fromBound,
        to: toBound,
      });

    if (filters.timeTrunc) {
      query.andWhere('b.timeTrunc = :timeTrunc', {
        timeTrunc: filters.timeTrunc,
      });
    }

    if (filters.geoLimit) {
      query.andWhere('b.geoLimit = :geoLimit', { geoLimit: filters.geoLimit });
    }

    if (filters.geoIds) {
      query.andWhere('b.geoIds = :geoIds', { geoIds: filters.geoIds });
    }

    return query.orderBy('b.date', 'ASC').getMany();
  }
}
