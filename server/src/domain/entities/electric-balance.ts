export class ElectricBalance {
  constructor(
    public readonly date: string,
    public readonly groupId: string,
    public readonly sourceId: string,
    public readonly sourceName: string,
    public readonly isTotal: boolean,
    public readonly valueMwh: number,
    public readonly percentage: number,
  ) {}
}
