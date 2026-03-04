# アーキテクチャ

## Route Groups

- `src/app/(main)/` — 認証必須の保護ルート。`layout.tsx` に `AppNavigation` (ボトムナビ)
- `src/app/(auth)/` — 未認証ユーザー向け。認証済みなら `/` へリダイレクト
- `src/app/api/tmdb/` — TMDb APIプロキシ (TMDB_API_KEYをサーバー側で隠蔽)

## Auth Flow

Middleware (`src/lib/supabase/middleware.ts`) がリクエスト毎にセッションリフレッシュ。

- 未認証 → `/login` へリダイレクト
- 認証済みが auth ページにアクセス → `/` へリダイレクト
- Public routes: `/login`, `/signup`, `/forgot-password`, `/auth/callback`, `/offline`, `/api/`

## Data Fetching

| コンテキスト | 方法 |
|-------------|------|
| Server Components | `createClient()` (from `src/lib/supabase/server.ts`) で直接Supabase問い合わせ |
| Client Components | React Query + Supabase browser client。Query Key は `src/lib/watchlist/query-keys.ts` で一元管理 |
| TMDb | クライアントから `/api/tmdb/*` を fetch → サーバー側で TMDB_API_KEY 付与 |

## Key Libraries

| ディレクトリ | 責務 |
|---|---|
| `src/lib/supabase/` | client.ts (ブラウザ), server.ts (SSR), middleware.ts (セッション管理) |
| `src/lib/tmdb/` | client.ts, server.ts, mappers.ts (TMDbレスポンス → Content型変換) |
| `src/lib/watchlist/` | api.ts (CRUD, DI対応), mappers.ts, query-keys.ts |
| `src/context/` | AuthContext (signIn/signUp/signOut/resetPassword) |
| `src/hooks/` | use-watchlist, use-watchlist-mutations, use-tmdb-search, use-content-detail 等 |

## PWA (Serwist)

Service Worker: `src/app/sw.ts`

| リソース | キャッシュ戦略 |
|---------|--------------|
| TMDb画像 | CacheFirst (30日) |
| TMDb API | StaleWhileRevalidate (5分) |
| 認証ページ | NetworkFirst |
| メインページ / Supabase API | NetworkOnly |

オフラインフォールバック: `/~offline`
