import { Pool } from "pg";

export async function fixDuplicateAccounts(): Promise<void> {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) return;
  const needsSsl = !/localhost|127\.0\.0\.1/.test(connectionString);
  const pool = new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  });

  const { rows: accounts } = await pool.query<{ id: string; name: string }>(
    `SELECT id, name FROM accounts ORDER BY name`
  );

  console.log(`[fix] found ${accounts.length} accounts:`);
  for (const a of accounts) {
    const { rows: cnt } = await pool.query<{ c: number }>(
      `SELECT count(*)::int AS c FROM monthly_metrics WHERE account_id = $1`,
      [a.id]
    );
    console.log(`[fix]  - "${a.name}" (${a.id}): ${cnt[0].c} metric rows`);
  }

  const byName = new Map(accounts.map((a) => [a.name, a]));
  let merged = 0;
  let renamed = 0;

  for (const a of accounts) {
    if (!a.name.startsWith("鳥周")) continue;
    const shortName = a.name.replace(/^鳥周\s*/, "").trim();
    if (!shortName || shortName === a.name) continue;

    const canonical = byName.get(shortName);
    if (canonical && canonical.id !== a.id) {
      await pool.query(
        `
        INSERT INTO monthly_metrics (
          account_id, year_month, follower_count, follower_net_increase, reach, pv,
          follower_percent, non_follower_percent, influencer_count, influencer_estimated_pv, updated_at
        )
        SELECT $1, year_month, follower_count, follower_net_increase, reach, pv,
               follower_percent, non_follower_percent, influencer_count, influencer_estimated_pv, updated_at
        FROM monthly_metrics
        WHERE account_id = $2
        ON CONFLICT (account_id, year_month) DO NOTHING
        `,
        [canonical.id, a.id]
      );
      await pool.query(`DELETE FROM accounts WHERE id = $1`, [a.id]);
      console.log(`[fix] merged duplicate "${a.name}" into "${shortName}" (deleted the duplicate)`);
      merged++;
    } else {
      await pool.query(`UPDATE accounts SET name = $1 WHERE id = $2`, [shortName, a.id]);
      console.log(`[fix] renamed "${a.name}" -> "${shortName}"`);
      renamed++;
    }
  }

  console.log(`[fix] done: merged ${merged}, renamed ${renamed}`);
  await pool.end();
}
