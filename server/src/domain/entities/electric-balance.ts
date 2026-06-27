export class ElectricBalance {
  constructor(
    public readonly date: string,
    public readonly groupId: string,
    public readonly sourceId: string,
    public readonly sourceName: string,
    public readonly isTotal: boolean,
    public readonly valueMwh: number,
    public readonly percentage: number,
    public readonly timeTrunc: string = 'day',
    public readonly geoLimit: string = 'national',
    public readonly geoIds: string = 'all',
    public readonly sourceColor: string | null = null,
    public readonly magnitude: string | null = null,
  ) {}
}
