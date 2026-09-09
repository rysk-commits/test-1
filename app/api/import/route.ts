import { NextRequest, NextResponse } from "next/server";
import { findOrCreateAccountByName, upsertMetric, listAccounts } from "@/lib/db";
import { parseMetricInput, ValidationError } from "@/lib/validation";

interface ImportRowResult {
  index: number;
  error: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rowsRaw = body?.rows;
    if (!Array.isArray(rowsRaw)) {
      return NextResponse.json({ error: "rows は配列で指定してください" }, { status: 400 });
    }

    const existingAccounts = await listAccounts();
    const existingNames = new Set(existingAccounts.map((a) => a.name));
    const createdAccountNames = new Set<string>();
    const errors: ImportRowResult[] = [];
    let metricsUpserted = 0;

    for (let i = 0; i < rowsRaw.length; i++) {
      const row = rowsRaw[i];
      if (typeof row !== "object" || row === null) {
        errors.push({ index: i, error: "行の形式が不正です" });
        continue;
      }
      const r = row as Record<string, unknown>;
      const accountName = typeof r.accountName === "string" ? r.accountName.trim() : "";
      if (!accountName) {
        errors.push({ index: i, error: "アカウント名がありません" });
        continue;
      }

      try {
        const input = parseMetricInput(r);
        const account = await findOrCreateAccountByName(accountName);
        if (!existingNames.has(accountName)) {
          createdAccountNames.add(accountName);
          existingNames.add(accountName);
        }
        await upsertMetric({ ...input, accountId: account.id });
        metricsUpserted++;
      } catch (error) {
        const message = error instanceof ValidationError ? error.message : "保存に失敗しました";
        errors.push({ index: i, error: `${accountName}: ${message}` });
      }
    }

    return NextResponse.json({
      accountsCreated: createdAccountNames.size,
      metricsUpserted,
      errors,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
