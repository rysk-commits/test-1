export interface Account {
  id: string;
  name: string;
  createdAt: string;
}

export interface MonthlyMetric {
  accountId: string;
  yearMonth: string;
  followerCount: number | null;
  followerNetIncrease: number | null;
  reach: number | null;
  pv: number | null;
  followerPercent: number | null;
  nonFollowerPercent: number | null;
  influencerCount: number | null;
  influencerEstimatedPv: number | null;
  updatedAt: string;
}

export type MetricInput = Omit<MonthlyMetric, "updatedAt">;
