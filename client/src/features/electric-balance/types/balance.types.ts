export interface BalanceEntry {
  date: string;
  groupId: string;
  sourceId: string;
  sourceName: string;
  isTotal: boolean;
  valueMwh: number;
  percentage: number;
}