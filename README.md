# DevWatchTower Backend

DevWatchTower Backend は、開発者向けのブログやリポジトリの更新情報を一日数回自動的に取得し、データベース（Supabase）に保存。そしてそのデータをAPIを介して提供するためのバックエンドプロジェクトです。

## 🚀 主な機能

- **自動データ取得**: 外部ソース（GitHub リリース、技術ブログ等）からの情報取得。
- **データ正規化**: 多様なソースからのデータを統一されたフォーマット（Content型）に変換。
- **プラグインシステム**: 新しいデータソースを容易に追加可能な拡張性のある設計。
- **パブリック API**: 収集したデータをフロントエンドへ提供する読み取り専用 API。

## 🛠 技術スタック

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Route Handlers)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Documentation**: [OpenAPI (Swagger)](https://swagger.io/specification/)
- **Runtime**: [Node.js](https://nodejs.org/) + [tsx](https://tsx.is/) for scripts

## 📂 ディレクトリ構成

- `app/`: Next.js のアプリケーションディレクトリ（APIエンドポイントを含む）。
- `lib/`: 共有ユーティリティ、Supabase クライアント、型定義など。
- `plugins/`: データソースごとの取得ロジック（プラグインシステム）。
- `scripts/`: データ取得・同期を実行する実行用スクリプト。
- `supabase/`: データベースマイグレーションと設定。
- `docs/`: API ドキュメント (`api-doc.yaml`)。

## 🧩 開発ルール (AI エージェント含む)

- コメントは原則不要（冗長な説明コメントは追加しない）
- 詳細: [docs/ai-agent-guidelines.md](./docs/ai-agent-guidelines.md)

## 🏁 セットアップ

### 1. 環境変数の設定

`.env.example`（存在する場合）を参考に、`.env.local` を作成し、必要な情報を設定してください。

```env
# GitHub API (データ取得用)
GITHUB_TOKEN=your_github_token

# Supabase 設定
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 型定義の生成 (OpenAPI)

```bash
npm run generate:types
```

## 🛠 主要なコマンド

- `npm run dev`: 開発用サーバーの起動。
- `npm run fetch:releases`: プラグインを使用して GitHub から最新情報を取得するテスト（保存はしません）。
- `npm run sync:releases`: 情報を取得し、Supabase データベースへ同期（保存）します。
- `npm run build`: プロダクション用ビルド。

## 🔄 データ同期フロー

1. `npm run sync:releases` を実行。
2. `plugins/` 内の各プラグインが外部ソースからデータを取得。
3. 取得したデータを `lib/types/` で定義された統一フォーマットに変換。
4. Supabase の `contents` テーブルへ UPSERT。

## 📖 API 仕様

API の詳細は [docs/api-doc.yaml](./docs/api-doc.yaml) に定義されています。
ローカル開発時は Swagger UI などで参照してください。

- **GET /api/contents**: 公開コンテンツの一覧取得
- **GET /api/contents/{id}**: 特定コンテンツの詳細取得
