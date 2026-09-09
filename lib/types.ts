export interface MonthlyMetric {
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

export const EMPTY_METRIC_FIELDS: Omit<MetricInput, "yearMonth"> = {
  followerCount: null,
  followerNetIncrease: null,
  reach: null,
  pv: null,
  followerPercent: null,
  nonFollowerPercent: null,
  influencerCount: null,
  influencerEstimatedPv: null,
};
