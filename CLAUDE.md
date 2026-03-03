# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MoodPick — 気分で映画・ドラマを選ぶウォッチリストPWA。React Native Expoから Next.js PWA に移行済み。

## Commands

```bash
pnpm dev              # 開発サーバー起動 (Turbopack)
pnpm build            # 本番ビルド (Serwist SW含む)
pnpm lint             # Biome lint
pnpm format           # Biome format (--write)
pnpm check            # Biome lint + format (--write)
pnpm test             # Vitest 全テスト実行
pnpm test:watch       # Vitest ウォッチモード
pnpm test:e2e         # Playwright E2E テスト
```

単一テスト実行: `pnpm vitest run src/__tests__/ファイル名.test.tsx`

### Supabase CLI

```bash
supabase db pull          # リモートスキーマをローカルにプル (マイグレーション生成)
supabase db push          # ローカルマイグレーションをリモートに適用
supabase db diff          # ローカルとリモートのスキーマ差分
supabase gen types typescript --linked > src/types/database.ts  # DB型自動生成
supabase migration new <name>  # 新規マイグレーションファイル作成
```

プロジェクトRef: `nbatknqxnksiiyojjhjl` (Tokyo region)。マイグレーション: `supabase/migrations/`。

## Tech Stack

- **Next.js 16** (App Router, Turbopack) / React 19 / TypeScript strict
- **Tailwind CSS v4** (CSS-first `@theme` in `globals.css`, PostCSS経由)
- **Supabase** (Auth SSR + DB) / **TMDb API** (映画データ、API Routeでプロキシ)
- **React Query** (クライアント側データ取得・キャッシュ)
- **Serwist** (PWA Service Worker)
- **Biome** (lint + format、ESLint/Prettier不使用)
- **Vitest** (単体テスト) / **Playwright** (E2E)
- **Radix UI** (アクセシブルUIプリミティブ) / **Lucide** (アイコン)

## Architecture

### Route Groups

- `src/app/(main)/` — 認証必須の保護ルート。`layout.tsx` に `AppNavigation` (ボトムナビ)
- `src/app/(auth)/` — 未認証ユーザー向け。認証済みなら `/` へリダイレクト
- `src/app/api/tmdb/` — TMDb APIプロキシ (TMDB_API_KEYをサーバー側で隠蔽)

### Auth Flow

Middleware (`src/lib/supabase/middleware.ts`) がリクエスト毎にセッションリフレッシュ。未認証は `/login` へ、認証済みが auth ページにアクセスすると `/` へリダイレクト。Public routes: `/login`, `/signup`, `/forgot-password`, `/auth/callback`, `/offline`, `/api/`。

### Data Fetching Pattern

- **Server Components**: `createClient()` (from `src/lib/supabase/server.ts`) で直接Supabase問い合わせ
- **Client Components**: React Query + Supabase browser client。Query Key は `src/lib/watchlist/query-keys.ts` で一元管理
- **TMDb**: クライアントから `/api/tmdb/*` を fetch → サーバー側で TMDB_API_KEY 付与

### Key Libraries

| ディレクトリ | 責務 |
|---|---|
| `src/lib/supabase/` | client.ts (ブラウザ), server.ts (SSR), middleware.ts (セッション管理) |
| `src/lib/tmdb/` | client.ts, server.ts, mappers.ts (TMDbレスポンス → Content型変換) |
| `src/lib/watchlist/` | api.ts (CRUD, DI対応), mappers.ts, query-keys.ts |
| `src/context/` | AuthContext (signIn/signUp/signOut/resetPassword) |
| `src/hooks/` | use-watchlist, use-watchlist-mutations, use-tmdb-search, use-content-detail 等 |

### PWA (Serwist)

Service Worker: `src/app/sw.ts`。TMDb画像はCacheFirst(30日)、TMDb APIはStaleWhileRevalidate(5分)、認証ページはNetworkFirst、メインページ/Supabase APIはNetworkOnly。オフラインフォールバック: `/~offline`。

## Conventions

### Theme (Dark Only)

Tailwind v4 `@theme` 変数を使用 (`src/app/globals.css`):
- Background: `background` (#0D0D0D), Surface: `surface` / `surface-light`
- Accent: `accent` (#FF6B00)
- Text: `text-primary`, `text-secondary`, `text-disabled`

### Biome Rules

- シングルクォート、スペースインデント、LF改行
- `noExplicitAny: error` — any禁止
- `noUnusedImports: error`
- Import順序: react → packages → lib → paths → relative → types (空行区切り)

### UI用語 (日本語)

- ステータス名: **見たい** / **視聴中** / **見た** (「観」は使わない)
- CTA: **「今すぐ見る」**
- 気分タグ5種: **興奮 / 切ない / 笑い / 思考 / まったり**
- アクション: **「見たいに追加」** (「ウォッチリスト」は使わない)

### Types

コア型は `src/types/index.ts` に集約。DB生成型は `src/types/database.ts`、TMDb型は `src/types/tmdb.ts`。

### Progress Tracking

実装の進捗は `PROGRESS.md` で管理。タスクの着手・完了時に更新すること。新機能は Phase 順に進め、既存の `src/lib/watchlist/` パターン (DI + React Query) を踏襲。

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL      # Supabase プロジェクトURL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase Anon Key
TMDB_API_KEY                  # TMDb APIキー (サーバー専用、NEXT_PUBLIC_ 不可)
```
