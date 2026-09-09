import type { MetricInput } from "./types";

const YEAR_MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export class ValidationError extends Error {}

function toNullableNumber(value: unknown, field: string): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) {
    throw new ValidationError(`${field} は数値で入力してください`);
  }
  return num;
}

export function parseMetricInput(body: unknown): MetricInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("リクエストボディが不正です");
  }
  const b = body as Record<string, unknown>;

  const yearMonth = b.yearMonth;
  if (typeof yearMonth !== "string" || !YEAR_MONTH_RE.test(yearMonth)) {
    throw new ValidationError("年月は YYYY-MM 形式で入力してください");
  }

  return {
    yearMonth,
    followerCount: toNullableNumber(b.followerCount, "フォロワー数"),
    followerNetIncrease: toNullableNumber(b.followerNetIncrease, "純増"),
    reach: toNullableNumber(b.reach, "リーチ数"),
    pv: toNullableNumber(b.pv, "PV数"),
    followerPercent: toNullableNumber(b.followerPercent, "フォロワー%"),
    nonFollowerPercent: toNullableNumber(b.nonFollowerPercent, "非フォロワー%"),
    influencerCount: toNullableNumber(b.influencerCount, "インフルエンサー人数"),
    influencerEstimatedPv: toNullableNumber(b.influencerEstimatedPv, "想定PV"),
  };
}

export { YEAR_MONTH_RE };
