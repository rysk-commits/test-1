import { Pool } from "pg";
import { randomUUID } from "crypto";
import type { Account, MonthlyMetric, MetricInput } from "./types";

export type { Account, MonthlyMetric, MetricInput } from "./types";

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
    global.__igSchemaReady = (async () => {
      const pool = getPool();

      await pool.query(`
        CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      // Migrate the legacy single-account schema (monthly_metrics without
      // account_id) into the multi-account shape, in place, without losing data.
      await pool.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.tables WHERE table_name = 'monthly_metrics'
          ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'monthly_metrics' AND column_name = 'account_id'
          ) THEN
            INSERT INTO accounts (id, name) VALUES ('default', 'メインアカウント')
              ON CONFLICT (id) DO NOTHING;
            ALTER TABLE monthly_metrics ADD COLUMN account_id TEXT;
            UPDATE monthly_metrics SET account_id = 'default' WHERE account_id IS NULL;
            ALTER TABLE monthly_metrics ALTER COLUMN account_id SET NOT NULL;
            ALTER TABLE monthly_metrics DROP CONSTRAINT IF EXISTS monthly_metrics_pkey;
            ALTER TABLE monthly_metrics ADD PRIMARY KEY (account_id, year_month);
            ALTER TABLE monthly_metrics
              ADD CONSTRAINT monthly_metrics_account_id_fkey
              FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS monthly_metrics (
          account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
          year_month TEXT NOT NULL,
          follower_count INTEGER,
          follower_net_increase INTEGER,
          reach INTEGER,
          pv INTEGER,
          follower_percent DOUBLE PRECISION,
          non_follower_percent DOUBLE PRECISION,
          influencer_count INTEGER,
          influencer_estimated_pv INTEGER,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          PRIMARY KEY (account_id, year_month)
        );
      `);
    })();
  }
  await global.__igSchemaReady;
}

interface AccountRow {
  id: string;
  name: string;
  created_at: string;
}

function rowToAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function listAccounts(): Promise<Account[]> {
  await ensureSchema();
  const { rows } = await getPool().query<AccountRow>(
    `SELECT * FROM accounts ORDER BY created_at ASC`
  );
  return rows.map(rowToAccount);
}

export async function getAccount(accountId: string): Promise<Account | null> {
  await ensureSchema();
  const { rows } = await getPool().query<AccountRow>(
    `SELECT * FROM accounts WHERE id = $1`,
    [accountId]
  );
  return rows[0] ? rowToAccount(rows[0]) : null;
}

export async function createAccount(name: string): Promise<Account> {
  await ensureSchema();
  const { rows } = await getPool().query<AccountRow>(
    `INSERT INTO accounts (id, name) VALUES ($1, $2) RETURNING *`,
    [randomUUID(), name]
  );
  return rowToAccount(rows[0]);
}

export async function createAccountsBulk(
  names: string[]
): Promise<{ created: Account[]; skipped: string[] }> {
  await ensureSchema();
  const existing = await listAccounts();
  const existingNames = new Set(existing.map((a) => a.name));

  const created: Account[] = [];
  const skipped: string[] = [];
  for (const name of names) {
    if (existingNames.has(name)) {
      skipped.push(name);
      continue;
    }
    const account = await createAccount(name);
    created.push(account);
    existingNames.add(name);
  }
  return { created, skipped };
}

export async function renameAccount(accountId: string, name: string): Promise<Account | null> {
  await ensureSchema();
  const { rows } = await getPool().query<AccountRow>(
    `UPDATE accounts SET name = $2 WHERE id = $1 RETURNING *`,
    [accountId, name]
  );
  return rows[0] ? rowToAccount(rows[0]) : null;
}

export async function deleteAccount(accountId: string): Promise<void> {
  await ensureSchema();
  await getPool().query(`DELETE FROM accounts WHERE id = $1`, [accountId]);
}

interface MonthlyMetricRow {
  account_id: string;
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
    accountId: row.account_id,
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

export async function listMetrics(accountId: string): Promise<MonthlyMetric[]> {
  await ensureSchema();
  const { rows } = await getPool().query<MonthlyMetricRow>(
    `SELECT * FROM monthly_metrics WHERE account_id = $1 ORDER BY year_month ASC`,
    [accountId]
  );
  return rows.map(rowToMetric);
}

export async function upsertMetric(input: MetricInput): Promise<MonthlyMetric> {
  await ensureSchema();
  const { rows } = await getPool().query<MonthlyMetricRow>(
    `
    INSERT INTO monthly_metrics (
      account_id, year_month, follower_count, follower_net_increase, reach, pv,
      follower_percent, non_follower_percent, influencer_count, influencer_estimated_pv, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
    ON CONFLICT (account_id, year_month) DO UPDATE SET
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
      input.accountId,
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

export async function deleteMetric(accountId: string, yearMonth: string): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `DELETE FROM monthly_metrics WHERE account_id = $1 AND year_month = $2`,
    [accountId, yearMonth]
  );
}
