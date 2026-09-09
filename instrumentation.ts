export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.FIX_DUPLICATE_ACCOUNTS === "true") {
    const { fixDuplicateAccounts } = await import("./lib/fix-duplicate-accounts");
    await fixDuplicateAccounts().catch((err) => {
      console.error("[fix] failed", err);
    });
  }
}
