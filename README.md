# Instagram Analytics Dashboard

Instagramの運用数値をブラウザで管理・分析するためのダッシュボードアプリです。

## 管理できる指標

月(年月)単位で以下を記録します。

- **フォロワー**: 純増数・フォロワー数
- **リーチ**: リーチ数
- **PV**: PV数
- **フォロワー内訳**: フォロワー%・非フォロワー%
- **インフルエンサー**: 起用人数・想定PV

## 使い方

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開くとダッシュボードが表示されます。

- `/` : ダッシュボード(各指標の推移グラフ、前月比のサマリー)
- `/data` : データ管理(月次データの追加・編集・削除)

初回は `/data` から月ごとの実績を入力してください。入力したデータはローカルのSQLiteデータベース(`data/instagram-analytics.db`)に保存され、ダッシュボードに自動反映されます。

## 技術構成

- Next.js (App Router) + TypeScript
- better-sqlite3 によるローカルDB永続化
- Tailwind CSS
- 依存ライブラリなしの自前SVGチャート(ホバーツールチップ・クロスヘア対応、ライト/ダークモード対応)

## 本番ビルド

```bash
npm run build
npm run start
```
