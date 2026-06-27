export interface BalanceEntry {
  date: string;
  groupId: string;
  sourceId: string;
  sourceName: string;
  isTotal: boolean;
  valueMwh: number;
  percentage: number;
  timeTrunc?: string;
  geoLimit?: string;
  geoIds?: string;
  sourceColor?: string | null;
  magnitude?: string | null;
}
