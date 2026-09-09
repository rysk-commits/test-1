import { slackApp } from "./app";
import {
  SELECT_CANDIDATE_ACTION,
  EDIT_REPLY_ACTION,
  EDIT_REPLY_CALLBACK_ID,
  EDIT_REPLY_INPUT_BLOCK,
  EDIT_REPLY_INPUT_ACTION,
  buildEditReplyModal,
} from "./blocks";
import { sendReplyAndUpdateSlack } from "../services/replyFlow";
import { prisma } from "../db";

interface SelectCandidateValue {
  candidateId: string;
  messageId: string;
}

interface EditReplyValue {
  messageId: string;
  draft: string;
}

interface EditReplyPrivateMetadata {
  messageId: string;
  channelId: string;
  ts: string;
}

function resolveSentBy(user: { id: string; username?: string; name?: string } | undefined): string | undefined {
  return user?.username ?? user?.name ?? user?.id;
}

// 「この文で送信」ボタン: select_candidate_0, select_candidate_1, ... にマッチ
slackApp.action(new RegExp(`^${SELECT_CANDIDATE_ACTION}_\\d+$`), async ({ ack, action, body }) => {
  await ack();
  if (action.type !== "button" || !action.value) return;

  const { candidateId, messageId } = JSON.parse(action.value) as SelectCandidateValue;
  const candidate = await prisma.replyCandidate.findUnique({ where: { id: candidateId } });
  if (!candidate) {
    console.error(`[slack] 返信候補が見つかりません: ${candidateId}`);
    return;
  }

  const sentBy = resolveSentBy(body.user);
  await sendReplyAndUpdateSlack({ messageId, text: candidate.text, sentBy });
});

// 「編集して送信」ボタン: 編集モーダルを開く
slackApp.action(EDIT_REPLY_ACTION, async ({ ack, action, body, client }) => {
  await ack();
  if (action.type !== "button" || !action.value) return;

  const { messageId, draft } = JSON.parse(action.value) as EditReplyValue;
  const triggerId = (body as { trigger_id?: string }).trigger_id;
  const channelId = (body as { channel?: { id?: string } }).channel?.id;
  const ts = (body as { message?: { ts?: string } }).message?.ts;
  if (!triggerId || !channelId || !ts) return;

  await client.views.open({
    trigger_id: triggerId,
    view: buildEditReplyModal({ messageId, channelId, ts, draft }),
  });
});

// 編集モーダルの送信
slackApp.view(EDIT_REPLY_CALLBACK_ID, async ({ ack, view, body }) => {
  await ack();

  const { messageId } = JSON.parse(view.private_metadata) as EditReplyPrivateMetadata;
  const text = view.state.values[EDIT_REPLY_INPUT_BLOCK]?.[EDIT_REPLY_INPUT_ACTION]?.value?.trim();
  if (!text) return;

  const sentBy = resolveSentBy(body.user);
  await sendReplyAndUpdateSlack({ messageId, text, sentBy });
});
