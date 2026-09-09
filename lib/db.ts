import { Pool } from "pg";
import type { MonthlyMetric, MetricInput } from "./types";

export type { MonthlyMetric, MetricInput } from "./types";

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL;

declare global {
  // eslint-disable-next-line no-var
  var __igPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __igSchemaReady: Promise<void> | undefined;
}

function createPool(): Pool {
  if (!connectionString) {
    throw new Error(
      "データベース接続文字列が設定されていません。環境変数 POSTGRES_URL (または DATABASE_URL) を設定してください。"
    );
  }
  const needsSsl = !/localhost|127\.0\.0\.1/.test(connectionString);
  return new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  });
}

function getPool(): Pool {
  if (!global.__igPool) {
    global.__igPool = createPool();
  }
  return global.__igPool;
}

async function ensureSchema(): Promise<void> {
  if (!global.__igSchemaReady) {
    global.__igSchemaReady = getPool()
      .query(
        `
        CREATE TABLE IF NOT EXISTS monthly_metrics (
          year_month TEXT PRIMARY KEY,
          follower_count INTEGER,
          follower_net_increase INTEGER,
          reach INTEGER,
          pv INTEGER,
          follower_percent DOUBLE PRECISION,
          non_follower_percent DOUBLE PRECISION,
          influencer_count INTEGER,
          influencer_estimated_pv INTEGER,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `
      )
      .then(() => undefined);
  }
  await global.__igSchemaReady;
}

interface MonthlyMetricRow {
  year_month: string;
  follower_count: number | null;
  follower_net_increase: number | null;
  reach: number | null;
  pv: number | null;
  follower_percent: number | null;
  non_follower_percent: number | null;
  influencer_count: number | null;
  influencer_estimated_pv: number | null;
  updated_at: string;
}

function rowToMetric(row: MonthlyMetricRow): MonthlyMetric {
  return {
    yearMonth: row.year_month,
    followerCount: row.follower_count,
    followerNetIncrease: row.follower_net_increase,
    reach: row.reach,
    pv: row.pv,
    followerPercent: row.follower_percent,
    nonFollowerPercent: row.non_follower_percent,
    influencerCount: row.influencer_count,
    influencerEstimatedPv: row.influencer_estimated_pv,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function listMetrics(): Promise<MonthlyMetric[]> {
  await ensureSchema();
  const { rows } = await getPool().query<MonthlyMetricRow>(
    `SELECT * FROM monthly_metrics ORDER BY year_month ASC`
  );
  return rows.map(rowToMetric);
}

export async function upsertMetric(input: MetricInput): Promise<MonthlyMetric> {
  await ensureSchema();
  const { rows } = await getPool().query<MonthlyMetricRow>(
    `
    INSERT INTO monthly_metrics (
      year_month, follower_count, follower_net_increase, reach, pv,
      follower_percent, non_follower_percent, influencer_count, influencer_estimated_pv, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
    ON CONFLICT (year_month) DO UPDATE SET
      follower_count = excluded.follower_count,
      follower_net_increase = excluded.follower_net_increase,
      reach = excluded.reach,
      pv = excluded.pv,
      follower_percent = excluded.follower_percent,
      non_follower_percent = excluded.non_follower_percent,
      influencer_count = excluded.influencer_count,
      influencer_estimated_pv = excluded.influencer_estimated_pv,
      updated_at = now()
    RETURNING *
    `,
    [
      input.yearMonth,
      input.followerCount,
      input.followerNetIncrease,
      input.reach,
      input.pv,
      input.followerPercent,
      input.nonFollowerPercent,
      input.influencerCount,
      input.influencerEstimatedPv,
    ]
  );
  return rowToMetric(rows[0]);
}

export async function deleteMetric(yearMonth: string): Promise<void> {
  await ensureSchema();
  await getPool().query(`DELETE FROM monthly_metrics WHERE year_month = $1`, [yearMonth]);
}
