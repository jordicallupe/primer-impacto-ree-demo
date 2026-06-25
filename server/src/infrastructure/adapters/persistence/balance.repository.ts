import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IBalanceRepository } from '../../../domain/ports/balance-repository.port';
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
        ['value_mwh', 'percentage', 'is_total', 'source_name'],
        ['date', 'source_id'],
      )
      .execute();
  }

  async findByDateRange(from: string, to: string): Promise<ElectricBalance[]> {
    return this.repo
      .createQueryBuilder('b')
      .where('b.date >= :from AND b.date <= :to', { from, to })
      .orderBy('b.date', 'ASC')
      .getMany();
  }
}
