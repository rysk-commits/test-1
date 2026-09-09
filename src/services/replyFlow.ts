import { prisma } from "../db";
import { getLineProfile, pushLineMessage } from "../line/client";
import { generateReplyCandidates, ConversationTurn } from "../ai/generateReplies";
import { slackApp } from "../slack/app";
import { config } from "../config";
import { buildIncomingMessageBlocks, buildSentSummaryBlocks } from "../slack/blocks";

const HISTORY_LIMIT = 10;

/**
 * LINEから新着メッセージを受信したときの一連の処理:
 * 保存 -> 会話履歴取得 -> Claudeで返信候補生成 -> Slackへ投稿
 */
export async function handleIncomingLineMessage(lineUserId: string, text: string): Promise<void> {
  await ensureLineUser(lineUserId);

  const message = await prisma.message.create({
    data: { lineUserId, direction: "INBOUND", text },
  });

  const historyRows = await prisma.message.findMany({
    where: { lineUserId },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  });
  const history: ConversationTurn[] = historyRows
    .reverse()
    .map((m) => ({ direction: m.direction as ConversationTurn["direction"], text: m.text }));

  const candidateTexts = await generateReplyCandidates(history);

  const candidates = await prisma.$transaction(
    candidateTexts.map((candidateText, index) =>
      prisma.replyCandidate.create({ data: { messageId: message.id, index, text: candidateText } }),
    ),
  );

  const lineUser = await prisma.lineUser.findUniqueOrThrow({ where: { id: lineUserId } });
  const displayName = lineUser.displayName ?? lineUserId;

  const posted = await slackApp.client.chat.postMessage({
    channel: config.slack.channelId,
    text: `${displayName} さんから新着メッセージ: ${text}`,
    blocks: buildIncomingMessageBlocks({
      displayName,
      text,
      candidates: candidates.map((c) => ({ id: c.id, text: c.text })),
      messageId: message.id,
    }),
  });

  if (posted.ts) {
    await prisma.slackThread.create({
      data: { messageId: message.id, channelId: config.slack.channelId, ts: posted.ts },
    });
  }
}

async function ensureLineUser(lineUserId: string): Promise<void> {
  const existing = await prisma.lineUser.findUnique({ where: { id: lineUserId } });
  if (existing) return;
  const profile = await getLineProfile(lineUserId);
  await prisma.lineUser.create({
    data: { id: lineUserId, displayName: profile?.displayName, pictureUrl: profile?.pictureUrl },
  });
}

/**
 * Slack上で候補が選択された、または編集後に送信されたときの一連の処理:
 * LINEへpush送信 -> 送信履歴を保存 -> Slackメッセージを「返信済み」に更新
 */
export async function sendReplyAndUpdateSlack(params: {
  messageId: string;
  text: string;
  sentBy?: string;
}): Promise<void> {
  const { messageId, text, sentBy } = params;

  const originalMessage = await prisma.message.findUniqueOrThrow({
    where: { id: messageId },
    include: { lineUser: true, slackThread: true },
  });

  await pushLineMessage(originalMessage.lineUserId, text);

  await prisma.message.create({
    data: { lineUserId: originalMessage.lineUserId, direction: "OUTBOUND", text },
  });

  if (!originalMessage.slackThread) return;

  await prisma.slackThread.update({
    where: { id: originalMessage.slackThread.id },
    data: { status: "REPLIED" },
  });

  await slackApp.client.chat.update({
    channel: originalMessage.slackThread.channelId,
    ts: originalMessage.slackThread.ts,
    text: `返信済み: ${text}`,
    blocks: buildSentSummaryBlocks({
      displayName: originalMessage.lineUser.displayName ?? originalMessage.lineUserId,
      originalText: originalMessage.text,
      sentText: text,
      sentBy,
    }),
  });
}
