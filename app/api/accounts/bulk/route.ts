import { NextRequest, NextResponse } from "next/server";
import { createAccountsBulk } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const namesRaw = body?.names;
    if (!Array.isArray(namesRaw)) {
      return NextResponse.json({ error: "names は配列で指定してください" }, { status: 400 });
    }

    const names = Array.from(
      new Set(
        namesRaw
          .map((n) => (typeof n === "string" ? n.trim() : ""))
          .filter((n) => n.length > 0 && n.length <= 100)
      )
    );

    if (names.length === 0) {
      return NextResponse.json({ error: "有効なアカウント名がありません" }, { status: 400 });
    }

    const { created, skipped } = await createAccountsBulk(names);
    return NextResponse.json({ created, skipped });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
