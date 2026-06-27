import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('electric_balance')
@Unique(['date', 'sourceId', 'timeTrunc', 'geoLimit', 'geoIds'])
export class ElectricBalanceEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', name: 'datetime' })
  date!: string;

  @Column({ type: 'varchar', name: 'group_id' })
  groupId!: string;

  @Column({ type: 'varchar', name: 'source_id' })
  sourceId!: string;

  @Column({ type: 'varchar', name: 'source_name' })
  sourceName!: string;

  @Column({ name: 'is_total', default: false })
  isTotal!: boolean;

  @Column({ type: 'float', name: 'value_mwh' })
  valueMwh!: number;

  @Column({ type: 'float' })
  percentage!: number;

  @Column({ type: 'varchar', name: 'time_trunc', default: 'day' })
  timeTrunc!: string;

  @Column({ type: 'varchar', name: 'geo_limit', default: 'national' })
  geoLimit!: string;

  @Column({ type: 'varchar', name: 'geo_ids', default: 'all' })
  geoIds!: string;

  @Column({ type: 'varchar', name: 'source_color', nullable: true })
  sourceColor!: string | null;

  @Column({ type: 'varchar', nullable: true })
  magnitude!: string | null;
}
