import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('electric_balance')
@Unique(['date', 'sourceId'])
export class ElectricBalanceEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  date!: string;

  @Column({ name: 'group_id' })
  groupId!: string;

  @Column({ name: 'source_id' })
  sourceId!: string;

  @Column({ name: 'source_name' })
  sourceName!: string;

  @Column({ name: 'is_total', default: false })
  isTotal!: boolean;

  @Column({ type: 'float', name: 'value_mwh' })
  valueMwh!: number;

  @Column({ type: 'float' })
  percentage!: number;
}
