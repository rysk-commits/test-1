import type { KnownBlock, View } from "@slack/types";

export interface CandidateForBlocks {
  id: string;
  text: string;
}

export const SELECT_CANDIDATE_ACTION = "select_candidate";
export const EDIT_REPLY_ACTION = "edit_reply";
export const EDIT_REPLY_CALLBACK_ID = "edit_reply_submit";
export const EDIT_REPLY_INPUT_BLOCK = "reply_text_block";
export const EDIT_REPLY_INPUT_ACTION = "reply_text_input";

/** 新着LINEメッセージ + AI生成の返信候補をSlackに投稿するためのBlock Kit */
export function buildIncomingMessageBlocks(params: {
  displayName: string;
  text: string;
  candidates: CandidateForBlocks[];
  messageId: string;
}): KnownBlock[] {
  const { displayName, text, candidates, messageId } = params;

  const blocks: KnownBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${escapeMrkdwn(displayName)}* さんから新着メッセージです\n> ${escapeMrkdwn(text).replace(/\n/g, "\n> ")}`,
      },
    },
    { type: "divider" },
  ];

  candidates.forEach((candidate, i) => {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*候補${i + 1}*\n${escapeMrkdwn(candidate.text)}` },
      accessory: {
        type: "button",
        text: { type: "plain_text", text: "この文で送信" },
        style: "primary",
        action_id: `${SELECT_CANDIDATE_ACTION}_${i}`,
        value: JSON.stringify({ candidateId: candidate.id, messageId }),
        confirm: {
          title: { type: "plain_text", text: "送信確認" },
          text: { type: "plain_text", text: `候補${i + 1}の内容でLINEに送信します。よろしいですか？` },
          confirm: { type: "plain_text", text: "送信する" },
          deny: { type: "plain_text", text: "キャンセル" },
        },
      },
    });
  });

  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: { type: "plain_text", text: "編集して送信" },
        action_id: EDIT_REPLY_ACTION,
        value: JSON.stringify({ messageId, draft: candidates[0]?.text ?? "" }),
      },
    ],
  });

  return blocks;
}

export function buildSentSummaryBlocks(params: {
  displayName: string;
  originalText: string;
  sentText: string;
  sentBy?: string;
}): KnownBlock[] {
  const { displayName, originalText, sentText, sentBy } = params;
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${escapeMrkdwn(displayName)}* さんから新着メッセージ\n> ${escapeMrkdwn(originalText).replace(/\n/g, "\n> ")}`,
      },
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:white_check_mark: 返信済み${sentBy ? ` (${escapeMrkdwn(sentBy)})` : ""}\n> ${escapeMrkdwn(sentText).replace(/\n/g, "\n> ")}`,
      },
    },
  ];
}

export function buildEditReplyModal(params: {
  messageId: string;
  channelId: string;
  ts: string;
  draft: string;
}): View {
  const { messageId, channelId, ts, draft } = params;
  return {
    type: "modal",
    callback_id: EDIT_REPLY_CALLBACK_ID,
    private_metadata: JSON.stringify({ messageId, channelId, ts }),
    title: { type: "plain_text", text: "返信を編集" },
    submit: { type: "plain_text", text: "送信" },
    close: { type: "plain_text", text: "キャンセル" },
    blocks: [
      {
        type: "input",
        block_id: EDIT_REPLY_INPUT_BLOCK,
        label: { type: "plain_text", text: "LINEへ送信する内容" },
        element: {
          type: "plain_text_input",
          action_id: EDIT_REPLY_INPUT_ACTION,
          multiline: true,
          initial_value: draft,
        },
      },
    ],
  };
}

function escapeMrkdwn(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
