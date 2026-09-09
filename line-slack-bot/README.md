# LINE × Slack AI返信アシスタント

LINE公式アカウントに届いたメッセージを受信すると、Claudeが返信文の候補を複数生成してSlackに投稿します。
担当者はSlack上で候補ボタンをクリックしてそのまま送信するか、「編集して送信」からモーダルで文面を編集してから送信できます。

## 全体の流れ

1. LINEユーザーからメッセージが届く → `POST /webhook/line`
2. メッセージと会話履歴をDBに保存
3. 直近の会話履歴を渡してClaude APIに返信候補（デフォルト3件）を生成させる
4. 生成した候補をSlackの指定チャンネルに投稿（各候補に「この文で送信」ボタン、末尾に「編集して送信」ボタン）
5. 担当者がボタンを押す
   - 候補をそのまま選択 → 確認ダイアログ後、その文面でLINEにpush送信
   - 「編集して送信」→ モーダルが開き、候補文をベースに自由編集してから送信
6. 送信するとSlackの元メッセージが「返信済み」表示に更新され、DBにも送信履歴が残る

## 技術スタック

- Node.js / TypeScript / Express
- LINE Messaging API（REST APIを直接呼び出し。署名検証も自前実装）
- Slack Bolt for JavaScript（Block Kitのボタン・モーダルで選択/編集UIを構築）
- Anthropic Claude API（返信文候補の生成）
- Prisma + SQLite（開発用。本番はPostgres推奨）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を開き、以下を設定してください。

| 変数名 | 取得場所 |
|---|---|
| `LINE_CHANNEL_SECRET` | LINE Developers コンソール > チャネル基本設定 |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Developers コンソール > Messaging API設定（チャネルアクセストークン発行） |
| `SLACK_BOT_TOKEN` | Slack App管理画面 > OAuth & Permissions（`xoxb-`から始まるBot User OAuth Token） |
| `SLACK_SIGNING_SECRET` | Slack App管理画面 > Basic Information > App Credentials |
| `SLACK_CHANNEL_ID` | 返信候補を投稿するSlackチャンネルのID |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/ |

### 3. LINE公式アカウントの設定

1. [LINE Developers コンソール](https://developers.line.biz/)でMessaging APIチャネルを作成
2. Webhook URLに `https://<デプロイ先のホスト>/webhook/line` を設定し、Webhookを有効化
3. 応答メッセージ（Bot Response）はオフにしておく（自動応答と競合しないように）

### 4. Slack Appの設定

1. https://api.slack.com/apps で新規Appを作成（manifestまたは手動設定）
2. **OAuth & Permissions** で以下のBot Token Scopesを追加し、ワークスペースにインストール
   - `chat:write`
   - `chat:write.public`（配信先チャンネルにBotを招待しない運用の場合）
3. **Interactivity & Shortcuts** をONにし、Request URLに `https://<デプロイ先のホスト>/webhook/slack/events` を設定
4. 発行された Bot Token / Signing Secret を `.env` に設定
5. 返信候補を投稿したいチャンネルにBotを招待し、そのチャンネルIDを `SLACK_CHANNEL_ID` に設定

### 5. データベースのマイグレーション

```bash
npx prisma migrate deploy
```

（初回セットアップ時、開発環境で新たにマイグレーションを作成する場合は `npx prisma migrate dev`）

### 6. 起動

```bash
# 開発時（ホットリロード）
npm run dev

# 本番
npm run build
npm start
```

デフォルトでは `PORT`（既定3000）で以下のエンドポイントが立ち上がります。

- `POST /webhook/line` — LINE Webhook受信
- `POST /webhook/slack/events` — Slackのボタン操作・モーダル送信を受信
- `GET /health` — ヘルスチェック

ローカル開発でLINE/SlackからWebhookを受け取るには、ngrokなどでトンネリングしたURLをそれぞれのWebhook URLに設定してください。

## データモデル（Prisma）

- `LineUser` — LINEの利用者（userId, 表示名, アイコンURL）
- `Message` — 受信/送信メッセージ履歴（`direction`: `INBOUND` / `OUTBOUND`）
- `ReplyCandidate` — Claudeが生成した返信候補（1受信メッセージにつき複数件）
- `SlackThread` — 投稿したSlackメッセージ（channel/ts）と対応状況（`PENDING` / `REPLIED`）

## 本番運用時の注意

- SQLiteはシングルインスタンス・開発向けです。本番はPostgresに切り替えることを推奨します（`prisma/schema.prisma` の `datasource` を `provider = "postgresql"` に変更し、`DATABASE_URL` をPostgres接続文字列に設定）。
- LINEのreplyTokenは有効期限が短く、AI生成とSlackでの人手の確認を挟むフローとは相性が悪いため、本実装ではpush APIを使用しています（LINE公式アカウントのメッセージ通数上限にpush送信分がカウントされる点に注意してください）。
- `REPLY_CANDIDATE_COUNT` で1件の受信メッセージあたりに生成する候補数を調整できます。
