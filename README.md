# Instagram Analytics Dashboard

Instagramの運用数値をブラウザで管理・分析するためのダッシュボードアプリです。

## 管理できる指標

月(年月)単位で以下を記録します。

- **フォロワー**: 純増数・フォロワー数
- **リーチ**: リーチ数
- **PV**: PV数
- **フォロワー内訳**: フォロワー%・非フォロワー%
- **インフルエンサー**: 起用人数・想定PV

## 公開URLで開けるようにする(Vercelへのデプロイ)

このアプリはPostgresデータベースにデータを保存するため、**Vercel + Vercel Postgres(またはNeon)** の組み合わせで、無料枠のまま常設のURLで公開できます。

1. [vercel.com](https://vercel.com) にアクセスし、GitHubアカウントでサインアップ/ログインする
2. 「Add New...」→「Project」から、このリポジトリ(`test-1`)を選択してインポートする
   - Branch は `claude/instagram-analytics-dashboard-tuy9m9` を指定(または main にマージ後にデプロイ)
3. インポート画面の「Environment Variables」はそのままで一旦「Deploy」してOK(初回はDB未接続でもビルドは通ります)
4. デプロイ後、プロジェクトの「Storage」タブから「Create Database」→「Postgres」(Neon)を選択して作成する
   - 作成すると `POSTGRES_URL` などの環境変数が自動でプロジェクトに追加されます
5. プロジェクトの「Deployments」から最新のデプロイを「Redeploy」する(環境変数を反映させるため)
6. 発行された `https://xxxx.vercel.app` のURLを開けば、どこからでもアクセスできます

初回アクセス時にテーブルが自動作成されるので、追加の初期設定は不要です。あとは `/data` ページから月次データを入力していくだけで、`/` のダッシュボードに反映されます。

## ローカルで動かす場合

Postgresデータベース(ローカルにインストールしたもの、または上記の Vercel Postgres / Neon の接続文字列)を用意し、`.env.local` を作成します。

```bash
cp .env.local.example .env.local
# .env.local の POSTGRES_URL を実際の接続文字列に書き換える
```

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開くとダッシュボードが表示されます。

- `/` : ダッシュボード(各指標の推移グラフ、前月比のサマリー)
- `/data` : データ管理(月次データの追加・編集・削除)

## 技術構成

- Next.js (App Router) + TypeScript
- PostgreSQL(`pg`)によるデータ永続化。`POSTGRES_URL` / `DATABASE_URL` 環境変数で接続先を指定
- Tailwind CSS
- 依存ライブラリなしの自前SVGチャート(ホバーツールチップ・クロスヘア対応、ライト/ダークモード対応)

## 本番ビルド

```bash
npm run build
npm run start
```
