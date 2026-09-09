import { NextRequest, NextResponse } from "next/server";
import { listMetrics, upsertMetric } from "@/lib/db";
import { parseMetricInput, ValidationError } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;
  const metrics = await listMetrics(accountId);
  return NextResponse.json({ metrics });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;
  try {
    const body = await request.json();
    const input = parseMetricInput(body);
    const metric = await upsertMetric({ ...input, accountId });
    return NextResponse.json({ metric }, { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
