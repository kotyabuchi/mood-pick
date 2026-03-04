# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MoodPick — 気分で映画・ドラマを選ぶウォッチリストPWA。Next.js PWA。

## Commands

| コマンド | 用途 |
|---------|------|
| `pnpm dev` | 開発サーバー起動（Turbopack） |
| `pnpm build` | 本番ビルド（Serwist SW含む） |
| `pnpm check` | Biome lint + format 一括実行 |
| `pnpm test` | Vitest 全テスト実行 |
| `pnpm test:e2e` | Playwright E2E テスト |
| `supabase db push` | マイグレーションをリモートに適用 |
| `supabase gen types typescript --linked > src/types/database.ts` | DB型自動生成 |

単一テスト実行: `pnpm vitest run src/__tests__/ファイル名.test.tsx`

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack) / React 19 / TypeScript strict
- **Styling**: Tailwind CSS v4 (CSS-first `@theme`, PostCSS)
- **Database/Auth**: Supabase (Auth SSR + DB)
- **External API**: TMDb API (API Routeでプロキシ)
- **State**: React Query (クライアント側キャッシュ)
- **PWA**: Serwist (Service Worker)
- **Linter/Formatter**: Biome (ESLint/Prettier不使用)
- **Testing**: Vitest + Playwright
- **UI**: Radix UI + Lucide Icons

## Directory Structure

```
src/
├── app/
│   ├── (auth)/             # 未認証ユーザー向け
│   ├── (main)/             # 認証必須の保護ルート（ボトムナビ付き）
│   ├── api/tmdb/           # TMDb APIプロキシ
│   └── sw.ts               # Service Worker
├── components/             # 共通UIコンポーネント
├── constants/              # 定数
├── context/                # AuthContext
├── hooks/                  # カスタムフック
├── lib/
│   ├── supabase/           # client.ts, server.ts, middleware.ts
│   ├── tmdb/               # client.ts, server.ts, mappers.ts
│   └── watchlist/          # api.ts (DI対応), mappers.ts, query-keys.ts
├── test/                   # テストヘルパー
└── types/                  # index.ts, database.ts, tmdb.ts
```

## Key Patterns

| パターン | 概要 | 詳細参照 |
|---------|------|---------|
| DBアクセス | `createClient()` + Supabase生成型 | `architecture.md` |
| データ取得 | Server: Supabase直接 / Client: React Query | `architecture.md` |
| TMDbプロキシ | `/api/tmdb/*` 経由でAPIキー隠蔽 | `architecture.md` |
| Auth | Middleware でセッション管理 + リダイレクト | `architecture.md` |
| 型の導出 | Supabase生成型 / `z.infer` を Single Source of Truth | `typescript-rules.md` |
| 楽観的更新 | `useTransition` + `useOptimistic` | `react-form-patterns.md` |
| パスエイリアス | `@/*` → `src/*` | - |

## Rules Reference

| ルールファイル | 内容 |
|---------------|------|
| `architecture.md` | ルートグループ、Auth Flow、データ取得、PWA |
| `coding-standards.md` | Biome設定、テーマ、Import順序、Bash |
| `typescript-rules.md` | 型厳格さ、Single Source of Truth |
| `react-form-patterns.md` | useTransition + useOptimistic パターン |
| `quality-checks.md` | Batch完了時の必須チェック手順 |

すべてのルールファイルは `.claude/rules/` に配置。

## Skills Reference

| スキル | 用途 |
|--------|------|
| `/commit` | Conventional Commits形式でコミット |
| `/codex-debate` | Codex CLIとのクロスレビュー |
| `/resolve-issue` | GitHub Issue対応ワークフロー |
| `/idea` | GitHub Issueとしてアイディア起票 |
| `/tdd` | TDD（テスト駆動開発）で実装 |

## UI用語 (日本語)

- ステータス名: **見たい** / **視聴中** / **見た** (「観」は使わない)
- CTA: **「今すぐ見る」**
- 気分タグ5種: **興奮 / 切ない / 笑い / 思考 / まったり**
- アクション: **「見たいに追加」** (「ウォッチリスト」は使わない)

## Progress Management

実装の進捗は `PROGRESS.md` で管理。タスクの着手・完了時に更新。新機能は Phase 順に進め、既存の `src/lib/watchlist/` パターン (DI + React Query) を踏襲。

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL      # Supabase プロジェクトURL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase Anon Key
TMDB_API_KEY                  # TMDb APIキー (サーバー専用、NEXT_PUBLIC_ 不可)
```
