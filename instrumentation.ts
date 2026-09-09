export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.SEED_HISTORICAL_DATA === "true") {
    const { seedHistoricalData } = await import("./lib/seed-historical-data");
    await seedHistoricalData().catch((err) => {
      console.error("[seed] failed", err);
    });
  }
}
