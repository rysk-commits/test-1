import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config";

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

export interface ConversationTurn {
  direction: "INBOUND" | "OUTBOUND";
  text: string;
}

const PROPOSE_REPLIES_TOOL = {
  name: "propose_replies",
  description: "LINEでの返信文候補を提案する",
  input_schema: {
    type: "object" as const,
    properties: {
      candidates: {
        type: "array" as const,
        description: "返信文候補のリスト。それぞれ文体や踏み込み度合いを変えること。",
        items: { type: "string" as const },
      },
    },
    required: ["candidates"],
  },
};

/**
 * 直近の会話履歴をもとに、LINE宛の返信文候補を複数生成する。
 * Slack上のオペレーターがそのまま選ぶか、編集してから送る前提の「たたき台」。
 */
export async function generateReplyCandidates(
  history: ConversationTurn[],
  count: number = config.replyCandidateCount,
): Promise<string[]> {
  const transcript = history
    .map((turn) => `${turn.direction === "INBOUND" ? "顧客" : "スタッフ"}: ${turn.text}`)
    .join("\n");

  const message = await anthropic.messages.create({
    model: config.anthropic.model,
    max_tokens: 1024,
    system:
      "あなたはLINE公式アカウントの問い合わせ対応を支援するアシスタントです。" +
      "会話履歴を踏まえて、スタッフがそのまま送信するか編集してから送信できる返信文の候補を提案してください。" +
      "各候補は丁寧語で簡潔にし、絵文字は多用しないこと。事実が不明な場合は断定せず確認を促す文にすること。",
    messages: [
      {
        role: "user",
        content:
          `これまでの会話:\n${transcript}\n\n` +
          `上記の最新の顧客メッセージへの返信文候補を${count}件、propose_repliesツールで提案してください。`,
      },
    ],
    tools: [PROPOSE_REPLIES_TOOL],
    tool_choice: { type: "tool", name: "propose_replies" },
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );
  const candidates = (toolUse?.input as { candidates?: unknown })?.candidates;

  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error("Claudeから返信候補を取得できませんでした");
  }

  return candidates.filter((c): c is string => typeof c === "string").slice(0, count);
}
