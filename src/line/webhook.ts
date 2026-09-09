import { Router } from "express";
import { verifyLineSignature } from "./client";
import { handleIncomingLineMessage } from "../services/replyFlow";

interface LineWebhookEvent {
  type: string;
  timestamp: number;
  source?: { type: string; userId?: string };
  message?: { id: string; type: string; text?: string };
}

interface LineWebhookBody {
  destination: string;
  events: LineWebhookEvent[];
}

export const lineWebhookRouter = Router();

// 署名検証には生のリクエストボディが必要なため、このルートだけ express.raw を使う
lineWebhookRouter.post(
  "/webhook/line",
  (req, res, next) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      (req as unknown as { rawBody: Buffer }).rawBody = Buffer.concat(chunks);
      next();
    });
  },
  async (req, res) => {
    const rawBody = (req as unknown as { rawBody: Buffer }).rawBody;
    const signature = req.header("x-line-signature");

    if (!verifyLineSignature(rawBody, signature)) {
      res.status(401).send("invalid signature");
      return;
    }

    // LINEプラットフォームには即座に200を返し、以降は非同期で処理する
    res.status(200).send("OK");

    let body: LineWebhookBody;
    try {
      body = JSON.parse(rawBody.toString("utf-8"));
    } catch {
      console.error("[line-webhook] JSONパースに失敗しました");
      return;
    }

    for (const event of body.events ?? []) {
      if (
        event.type === "message" &&
        event.message?.type === "text" &&
        event.source?.type === "user" &&
        event.source.userId &&
        event.message.text
      ) {
        const userId = event.source.userId;
        const text = event.message.text;
        handleIncomingLineMessage(userId, text).catch((err) => {
          console.error("[line-webhook] メッセージ処理中にエラーが発生しました", err);
        });
      }
    }
  },
);
