import { Pool } from "pg";
import { randomUUID } from "crypto";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const needsSsl = !/localhost|127\.0\.0\.1/.test(connectionString);
const pool = new Pool({ connectionString, ssl: needsSsl ? { rejectUnauthorized: false } : undefined });

const NAME_ONLY_ACCOUNTS = ["杉田店", "行徳店", "だんちゃんラーメン", "あべの酒場", "ぶたもん天満店", "ぶたもん京橋本店"];

const METRICS = [
  { accountName: "江並店", yearMonth: "2025-12", followerCount: 184, followerNetIncrease: 87, reach: 1207, pv: 52709, followerPercent: 17.2, nonFollowerPercent: 82.8, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "江並店", yearMonth: "2026-01", followerCount: 199, followerNetIncrease: 15, reach: 328, pv: 12756, followerPercent: 33.7, nonFollowerPercent: 66.3, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "江並店", yearMonth: "2026-02", followerCount: 280, followerNetIncrease: 81, reach: 62145, pv: 104485, followerPercent: 7.8, nonFollowerPercent: 92.2, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "江並店", yearMonth: "2026-03", followerCount: 374, followerNetIncrease: 94, reach: 58352, pv: 121601, followerPercent: 12.0, nonFollowerPercent: 88.0, influencerCount: 9, influencerEstimatedPv: 21300 },
  { accountName: "江並店", yearMonth: "2026-04", followerCount: 435, followerNetIncrease: 61, reach: 57425, pv: 120920, followerPercent: 14.4, nonFollowerPercent: 85.6, influencerCount: 12, influencerEstimatedPv: 7800 },
  { accountName: "江並店", yearMonth: "2026-05", followerCount: 918, followerNetIncrease: 483, reach: 259656, pv: 442014, followerPercent: 5.9, nonFollowerPercent: 94.1, influencerCount: 4, influencerEstimatedPv: 4000 },
  { accountName: "江並店", yearMonth: "2026-06", followerCount: 1030, followerNetIncrease: 112, reach: 27682, pv: 87443, followerPercent: 33.2, nonFollowerPercent: 66.8, influencerCount: 8, influencerEstimatedPv: 10000 },
  { accountName: "江並店", yearMonth: "2026-07", followerCount: 1249, followerNetIncrease: 219, reach: 58505, pv: 144093, followerPercent: 23.8, nonFollowerPercent: 76.2, influencerCount: 6, influencerEstimatedPv: 17000 },
  { accountName: "江並店", yearMonth: "2026-08", followerCount: 1610, followerNetIncrease: 361, reach: 29956, pv: 158885, followerPercent: 26.7, nonFollowerPercent: 73.3, influencerCount: 6, influencerEstimatedPv: 17000 },
  { accountName: "神戸本多聞店", yearMonth: "2026-03", followerCount: 983, followerNetIncrease: 9, reach: 1969, pv: 23834, followerPercent: 53.2, nonFollowerPercent: 46.8, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "神戸本多聞店", yearMonth: "2026-04", followerCount: 1000, followerNetIncrease: 17, reach: 1845, pv: 15560, followerPercent: 55.2, nonFollowerPercent: 44.8, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "神戸本多聞店", yearMonth: "2026-05", followerCount: 1099, followerNetIncrease: 99, reach: 28406, pv: 86120, followerPercent: 31.0, nonFollowerPercent: 69.0, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "神戸本多聞店", yearMonth: "2026-06", followerCount: 1286, followerNetIncrease: 187, reach: 79934, pv: 179410, followerPercent: 12.8, nonFollowerPercent: 87.2, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "神戸本多聞店", yearMonth: "2026-07", followerCount: 1491, followerNetIncrease: 205, reach: 26481, pv: 170190, followerPercent: 15.1, nonFollowerPercent: 84.9, influencerCount: 6, influencerEstimatedPv: 94200 },
  { accountName: "神戸本多聞店", yearMonth: "2026-08", followerCount: 1706, followerNetIncrease: 215, reach: 76070, pv: 192335, followerPercent: 15.4, nonFollowerPercent: 84.6, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "松原店", yearMonth: "2026-03", followerCount: 45, followerNetIncrease: 9, reach: 177, pv: 617, followerPercent: 8.3, nonFollowerPercent: 91.7, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "松原店", yearMonth: "2026-04", followerCount: 99, followerNetIncrease: 54, reach: 872, pv: 6056, followerPercent: 26.9, nonFollowerPercent: 73.1, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "松原店", yearMonth: "2026-05", followerCount: 485, followerNetIncrease: 386, reach: 97627, pv: 185904, followerPercent: 6.5, nonFollowerPercent: 93.5, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "松原店", yearMonth: "2026-06", followerCount: 694, followerNetIncrease: 209, reach: 45084, pv: 145356, followerPercent: 15.2, nonFollowerPercent: 84.8, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "松原店", yearMonth: "2026-07", followerCount: 739, followerNetIncrease: 45, reach: 103659, pv: 229940, followerPercent: 7.6, nonFollowerPercent: 92.4, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "松原店", yearMonth: "2026-08", followerCount: 1206, followerNetIncrease: 467, reach: 205971, pv: 546495, followerPercent: 5.7, nonFollowerPercent: 94.3, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "仁川店", yearMonth: "2026-05", followerCount: 349, followerNetIncrease: 9, reach: 665, pv: 6767, followerPercent: 46.4, nonFollowerPercent: 53.6, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "仁川店", yearMonth: "2026-06", followerCount: 364, followerNetIncrease: 15, reach: 556, pv: 14260, followerPercent: 21.4, nonFollowerPercent: 78.6, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "仁川店", yearMonth: "2026-07", followerCount: 371, followerNetIncrease: 7, reach: 2959, pv: 19534, followerPercent: 52.5, nonFollowerPercent: 47.5, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "仁川店", yearMonth: "2026-08", followerCount: 389, followerNetIncrease: 18, reach: 7197, pv: 32896, followerPercent: 36.4, nonFollowerPercent: 63.6, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "西宮広田店", yearMonth: "2026-05", followerCount: 112, followerNetIncrease: 15, reach: 379, pv: 1573, followerPercent: 28.1, nonFollowerPercent: 71.9, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "西宮広田店", yearMonth: "2026-06", followerCount: 133, followerNetIncrease: 21, reach: 489, pv: 3893, followerPercent: 40.7, nonFollowerPercent: 59.3, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "西宮広田店", yearMonth: "2026-07", followerCount: 146, followerNetIncrease: 13, reach: 2504, pv: 8476, followerPercent: 41.3, nonFollowerPercent: 58.7, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "西宮広田店", yearMonth: "2026-08", followerCount: 181, followerNetIncrease: 35, reach: 3818, pv: 13364, followerPercent: 36.9, nonFollowerPercent: 63.1, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "防府新田店", yearMonth: "2026-05", followerCount: 446, followerNetIncrease: 274, reach: 5371, pv: 100992, followerPercent: 14.5, nonFollowerPercent: 85.5, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "防府新田店", yearMonth: "2026-06", followerCount: 613, followerNetIncrease: 167, reach: 2796, pv: 38163, followerPercent: 42.4, nonFollowerPercent: 57.6, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "防府新田店", yearMonth: "2026-07", followerCount: 898, followerNetIncrease: 285, reach: 15042, pv: 168044, followerPercent: 21.4, nonFollowerPercent: 78.6, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "防府新田店", yearMonth: "2026-08", followerCount: 1193, followerNetIncrease: 295, reach: 52280, pv: 164708, followerPercent: 22.8, nonFollowerPercent: 77.2, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "牟佐本店", yearMonth: "2026-05", followerCount: 870, followerNetIncrease: 26, reach: 642, pv: 5892, followerPercent: 12.8, nonFollowerPercent: 87.2, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "牟佐本店", yearMonth: "2026-06", followerCount: 958, followerNetIncrease: 88, reach: 837, pv: 8380, followerPercent: 13.9, nonFollowerPercent: 86.1, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "牟佐本店", yearMonth: "2026-07", followerCount: 975, followerNetIncrease: 17, reach: 14020, pv: 31881, followerPercent: 28.4, nonFollowerPercent: 71.6, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "牟佐本店", yearMonth: "2026-08", followerCount: 1035, followerNetIncrease: 60, reach: 22435, pv: 57515, followerPercent: 25.1, nonFollowerPercent: 74.9, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "御津店", yearMonth: "2026-05", followerCount: 54, followerNetIncrease: 0, reach: 69, pv: 291, followerPercent: 67.7, nonFollowerPercent: 32.3, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "御津店", yearMonth: "2026-06", followerCount: 54, followerNetIncrease: 0, reach: 57, pv: 334, followerPercent: 69.8, nonFollowerPercent: 30.2, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "御津店", yearMonth: "2026-07", followerCount: 54, followerNetIncrease: 0, reach: 6885, pv: 9475, followerPercent: 9.1, nonFollowerPercent: 90.9, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "御津店", yearMonth: "2026-08", followerCount: 108, followerNetIncrease: 54, reach: 18832, pv: 30925, followerPercent: 6.3, nonFollowerPercent: 93.7, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "出雲店", yearMonth: "2026-05", followerCount: 3521, followerNetIncrease: 131, reach: 3140, pv: 31865, followerPercent: 68.2, nonFollowerPercent: 31.8, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "出雲店", yearMonth: "2026-06", followerCount: 3645, followerNetIncrease: 124, reach: 4211, pv: 56398, followerPercent: 76.4, nonFollowerPercent: 23.6, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "出雲店", yearMonth: "2026-07", followerCount: 3763, followerNetIncrease: 118, reach: 86533, pv: 170526, followerPercent: 27.1, nonFollowerPercent: 72.9, influencerCount: 2, influencerEstimatedPv: null },
  { accountName: "出雲店", yearMonth: "2026-08", followerCount: 4228, followerNetIncrease: 465, reach: 123587, pv: 357119, followerPercent: 28.8, nonFollowerPercent: 71.2, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "豊中店", yearMonth: "2026-06", followerCount: 233, followerNetIncrease: -5, reach: 290, pv: 1547, followerPercent: 45.0, nonFollowerPercent: 55.0, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "豊中店", yearMonth: "2026-07", followerCount: 336, followerNetIncrease: 103, reach: 63141, pv: 96459, followerPercent: 4.9, nonFollowerPercent: 95.1, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "豊中店", yearMonth: "2026-08", followerCount: 494, followerNetIncrease: 158, reach: 82591, pv: 157329, followerPercent: 7.3, nonFollowerPercent: 92.7, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "庄内店", yearMonth: "2026-06", followerCount: 1054, followerNetIncrease: 10, reach: 887, pv: 3955, followerPercent: 60.7, nonFollowerPercent: 39.3, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "庄内店", yearMonth: "2026-07", followerCount: 1064, followerNetIncrease: 10, reach: 738, pv: 3761, followerPercent: 49.4, nonFollowerPercent: 50.6, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "庄内店", yearMonth: "2026-08", followerCount: 1073, followerNetIncrease: 9, reach: 3828, pv: 16181, followerPercent: 57.8, nonFollowerPercent: 42.2, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "三国店", yearMonth: "2026-08", followerCount: 21, followerNetIncrease: 21, reach: 2483, pv: 4007, followerPercent: 23.9, nonFollowerPercent: 76.1, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "石橋阪大前店", yearMonth: "2026-06", followerCount: 91, followerNetIncrease: 0, reach: 193, pv: 556, followerPercent: 34.5, nonFollowerPercent: 65.5, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "石橋阪大前店", yearMonth: "2026-07", followerCount: 91, followerNetIncrease: 0, reach: 91, pv: 706, followerPercent: 29.2, nonFollowerPercent: 70.8, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "石橋阪大前店", yearMonth: "2026-08", followerCount: 117, followerNetIncrease: 26, reach: 32061, pv: 47380, followerPercent: 7.1, nonFollowerPercent: 92.9, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "岡町店", yearMonth: "2026-06", followerCount: 42, followerNetIncrease: 0, reach: 24, pv: 25, followerPercent: 4.0, nonFollowerPercent: 96.0, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "岡町店", yearMonth: "2026-07", followerCount: 42, followerNetIncrease: 0, reach: 20, pv: 18, followerPercent: 30.0, nonFollowerPercent: 70.0, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "岡町店", yearMonth: "2026-08", followerCount: 44, followerNetIncrease: 2, reach: 1159, pv: 3482, followerPercent: 51.6, nonFollowerPercent: 48.4, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "茂原東郷店", yearMonth: "2026-06", followerCount: 161, followerNetIncrease: 22, reach: 789, pv: 9715, followerPercent: 46.0, nonFollowerPercent: 54.0, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "茂原東郷店", yearMonth: "2026-07", followerCount: 590, followerNetIncrease: 429, reach: 1939, pv: 37121, followerPercent: 25.0, nonFollowerPercent: 75.0, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "茂原東郷店", yearMonth: "2026-08", followerCount: 1511, followerNetIncrease: 921, reach: 146283, pv: 490854, followerPercent: 10.0, nonFollowerPercent: 90.0, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "中華そば黒波", yearMonth: "2026-07", followerCount: 848, followerNetIncrease: 225, reach: 178364, pv: 262047, followerPercent: 5.3, nonFollowerPercent: 94.6, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "中華そば黒波", yearMonth: "2026-08", followerCount: 959, followerNetIncrease: 111, reach: 15575, pv: 51451, followerPercent: 28.2, nonFollowerPercent: 71.8, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "ぶたもん長岡店", yearMonth: "2026-07", followerCount: 600, followerNetIncrease: 15, reach: 476, pv: 7924, followerPercent: 64.1, nonFollowerPercent: 35.9, influencerCount: null, influencerEstimatedPv: null },
  { accountName: "ぶたもん長岡店", yearMonth: "2026-08", followerCount: 621, followerNetIncrease: 21, reach: 5446, pv: 25472, followerPercent: 54.0, nonFollowerPercent: 46.0, influencerCount: null, influencerEstimatedPv: null },
];

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
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
}

async function findOrCreateAccount(name) {
  const { rows } = await pool.query(`SELECT * FROM accounts WHERE name = $1 LIMIT 1`, [name]);
  if (rows[0]) return rows[0];
  const { rows: inserted } = await pool.query(
    `INSERT INTO accounts (id, name) VALUES ($1, $2) RETURNING *`,
    [randomUUID(), name]
  );
  console.log("created account:", name);
  return inserted[0];
}

async function upsertMetric(accountId, m) {
  await pool.query(
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
    `,
    [
      accountId,
      m.yearMonth,
      m.followerCount,
      m.followerNetIncrease,
      m.reach,
      m.pv,
      m.followerPercent,
      m.nonFollowerPercent,
      m.influencerCount,
      m.influencerEstimatedPv,
    ]
  );
}

async function main() {
  await ensureSchema();

  for (const name of NAME_ONLY_ACCOUNTS) {
    await findOrCreateAccount(name);
  }

  let count = 0;
  for (const m of METRICS) {
    const account = await findOrCreateAccount(m.accountName);
    await upsertMetric(account.id, m);
    count++;
  }

  console.log(`done: upserted ${count} metric rows, ensured ${NAME_ONLY_ACCOUNTS.length} name-only accounts`);
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
