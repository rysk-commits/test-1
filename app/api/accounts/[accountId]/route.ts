import { NextRequest, NextResponse } from "next/server";
import { getAccount, renameAccount, deleteAccount } from "@/lib/db";
import { parseAccountName, ValidationError } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;
  const account = await getAccount(accountId);
  if (!account) {
    return NextResponse.json({ error: "アカウントが見つかりません" }, { status: 404 });
  }
  return NextResponse.json({ account });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;
  try {
    const body = await request.json();
    const name = parseAccountName(body);
    const account = await renameAccount(accountId, name);
    if (!account) {
      return NextResponse.json({ error: "アカウントが見つかりません" }, { status: 404 });
    }
    return NextResponse.json({ account });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;
  await deleteAccount(accountId);
  return NextResponse.json({ ok: true });
}
