import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type { MonthlyMetric, MetricInput } from "./types";

export type { MonthlyMetric, MetricInput } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "instagram-analytics.db");

declare global {
  // eslint-disable-next-line no-var
  var __igDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS monthly_metrics (
      year_month TEXT PRIMARY KEY,
      follower_count INTEGER,
      follower_net_increase INTEGER,
      reach INTEGER,
      pv INTEGER,
      follower_percent REAL,
      non_follower_percent REAL,
      influencer_count INTEGER,
      influencer_estimated_pv INTEGER,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return db;
}

export function getDb(): Database.Database {
  if (!global.__igDb) {
    global.__igDb = createConnection();
  }
  return global.__igDb;
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
    updatedAt: row.updated_at,
  };
}

export function listMetrics(): MonthlyMetric[] {
  const rows = getDb()
    .prepare(`SELECT * FROM monthly_metrics ORDER BY year_month ASC`)
    .all() as MonthlyMetricRow[];
  return rows.map(rowToMetric);
}

export function upsertMetric(input: MetricInput): MonthlyMetric {
  getDb()
    .prepare(
      `INSERT INTO monthly_metrics (
        year_month, follower_count, follower_net_increase, reach, pv,
        follower_percent, non_follower_percent, influencer_count, influencer_estimated_pv, updated_at
      ) VALUES (@yearMonth, @followerCount, @followerNetIncrease, @reach, @pv,
        @followerPercent, @nonFollowerPercent, @influencerCount, @influencerEstimatedPv, datetime('now'))
      ON CONFLICT(year_month) DO UPDATE SET
        follower_count = excluded.follower_count,
        follower_net_increase = excluded.follower_net_increase,
        reach = excluded.reach,
        pv = excluded.pv,
        follower_percent = excluded.follower_percent,
        non_follower_percent = excluded.non_follower_percent,
        influencer_count = excluded.influencer_count,
        influencer_estimated_pv = excluded.influencer_estimated_pv,
        updated_at = datetime('now')
      `
    )
    .run(input);

  const row = getDb()
    .prepare(`SELECT * FROM monthly_metrics WHERE year_month = ?`)
    .get(input.yearMonth) as MonthlyMetricRow;
  return rowToMetric(row);
}

export function deleteMetric(yearMonth: string): void {
  getDb().prepare(`DELETE FROM monthly_metrics WHERE year_month = ?`).run(yearMonth);
}
