import { NextRequest, NextResponse } from "next/server";
import { deleteMetric } from "@/lib/db";
import { YEAR_MONTH_RE } from "@/lib/validation";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ yearMonth: string }> }
) {
  const { yearMonth } = await params;
  if (!YEAR_MONTH_RE.test(yearMonth)) {
    return NextResponse.json({ error: "年月は YYYY-MM 形式で指定してください" }, { status: 400 });
  }
  await deleteMetric(yearMonth);
  return NextResponse.json({ ok: true });
}
