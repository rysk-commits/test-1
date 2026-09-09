import { NextRequest, NextResponse } from "next/server";
import { listAccounts, createAccount } from "@/lib/db";
import { parseAccountName, ValidationError } from "@/lib/validation";

export async function GET() {
  const accounts = await listAccounts();
  return NextResponse.json({ accounts });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = parseAccountName(body);
    const account = await createAccount(name);
    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
