import crypto from "node:crypto";
import { config } from "../config";

const LINE_API_BASE = "https://api.line.me/v2/bot";

/**
 * LINEの署名検証。X-Line-Signature は「チャネルシークレットをキーにした
 * リクエストボディのHMAC-SHA256」をbase64化した値。
 * https://developers.line.biz/ja/reference/messaging-api/#signature-validation
 */
export function verifyLineSignature(rawBody: Buffer, signature: string | undefined): boolean {
  if (!signature) return false;
  const expected = crypto
    .createHmac("SHA256", config.line.channelSecret)
    .update(rawBody)
    .digest("base64");
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

async function callLineApi(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${LINE_API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.line.channelAccessToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LINE API呼び出しに失敗しました (${path}, ${res.status}): ${errText}`);
  }
}

/** 返信候補の生成やSlackでの選択には時間がかかるため replyToken ではなく push を使う */
export async function pushLineMessage(toUserId: string, text: string): Promise<void> {
  await callLineApi("/message/push", {
    to: toUserId,
    messages: [{ type: "text", text }],
  });
}

export interface LineProfile {
  displayName: string;
  pictureUrl?: string;
}

export async function getLineProfile(userId: string): Promise<LineProfile | null> {
  const res = await fetch(`${LINE_API_BASE}/profile/${userId}`, {
    headers: { Authorization: `Bearer ${config.line.channelAccessToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { displayName: string; pictureUrl?: string };
  return { displayName: data.displayName, pictureUrl: data.pictureUrl };
}
