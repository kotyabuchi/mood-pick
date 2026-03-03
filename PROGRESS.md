# PROGRESS.md

モックデータ → 実DB/API 移行の進捗管理。

## 現状

| レイヤー | 状態 |
|----------|------|
| 認証 (Auth) | Supabase SSR 実装済み |
| ウォッチリスト CRUD | Supabase `watchlist_items` 実装済み |
| 検索・詳細 | TMDb API proxy 実装済み |
| **フォロー** | **モック (`mockUsers`)** |
| **フィード** | **モック (`mockFeedItems`)** |
| **通知** | **モック (`mockNotifications`)** |
| **プロフィール** | **一部モック (`mockCurrentUser`)** — stats/recentWatched は実DB |
| **ユーザーページ** | **モック (`mockUsers`)** |
| **おすすめ送信** | **モック (`mockContents`, `mockUsers`)** — 送信ロジックなし |

## 既存DBテーブル

- `profiles` — id, name, handle, avatar_url, created_at, updated_at
- `watchlist_items` — id, user_id, tmdb_id, title, type, status, mood_tags, rating, review, memo, ...

## TODO

### Phase 1: フォロー機能

モック依存: `follows/page.tsx`, `user/[id]/page.tsx`, `recommend/[id]/page.tsx`

- [ ] `follows` テーブル作成 (follower_id, following_id, created_at / PK: composite / CHECK: self-follow禁止)
- [ ] RLS ポリシー (自分のフォロー関係のみ INSERT/DELETE、全ユーザー SELECT)
- [ ] `src/lib/follows/api.ts` — getFollowing, getFollowers, toggleFollow, getFollowCounts
- [ ] `src/lib/follows/mappers.ts` — Row → User 変換
- [ ] `src/hooks/use-follows.ts` — React Query hooks
- [ ] `src/hooks/use-follow-mutation.ts` — toggleFollow mutation
- [ ] `follows/page.tsx` 実装差し替え
- [ ] `user/[id]/page.tsx` 実装差し替え
- [ ] `profile/page.tsx` のフォロー数を実DBから取得
- [ ] `supabase gen types` で型再生成

### Phase 2: プロフィール完全実装

モック依存: `profile/page.tsx` の `mockCurrentUser`

- [ ] `profile/page.tsx` — ユーザー情報を `profiles` テーブルから取得
- [ ] 今月/今年の視聴数を `watchlist_items` の日付フィルタで算出
- [ ] プロフィール編集機能 (name, handle, avatar_url 更新)

### Phase 3: フィード (アクティビティ)

モック依存: `feed/page.tsx`

- [ ] `activity_log` テーブル作成 (user_id, tmdb_id, action_type, rating, review, message, recipient_id, created_at)
- [ ] RLS ポリシー (フォロー中ユーザーのアクティビティを SELECT 可)
- [ ] `watchlist_items` の status 変更時に `activity_log` へ自動挿入するトリガー
- [ ] `src/lib/activity/api.ts` — getFeed (フォロー中ユーザーのアクティビティ)
- [ ] `src/lib/activity/mappers.ts` — Row → FeedItem 変換 (profiles JOIN + TMDb情報)
- [ ] `src/hooks/use-feed.ts`
- [ ] `feed/page.tsx` 実装差し替え

### Phase 4: 通知

モック依存: `notifications/page.tsx`

- [ ] `notifications` テーブル作成 (user_id, type, title, target_id, service_name, is_read, created_at)
- [ ] RLS ポリシー (自分の通知のみ SELECT/UPDATE)
- [ ] 通知生成トリガー: フォローされた時、おすすめ受信時
- [ ] `src/lib/notifications/api.ts` — getNotifications, markAsRead, getUnreadCount
- [ ] `src/hooks/use-notifications.ts`
- [ ] `notifications/page.tsx` 実装差し替え
- [ ] ヘッダーの通知ベルに未読バッジ表示

### Phase 5: おすすめ送信

モック依存: `recommend/[id]/page.tsx`

- [ ] `recommendations` テーブル作成 (from_user_id, to_user_id, tmdb_id, message, created_at)、または `activity_log` に統合
- [ ] 送信ロジック実装 (複数ユーザー一括送信)
- [ ] 送信時に `notifications` へ自動挿入するトリガー
- [ ] `recommend/[id]/page.tsx` 実装差し替え — フォロー中ユーザー一覧を実DBから取得

### Phase 6: クリーンアップ

- [ ] `src/lib/mock-data.ts` 削除
- [ ] `src/__tests__/lib/mock-data.test.ts` 削除
- [ ] テストファイルのモックデータインライン化 or ファクトリ関数に移行

## 実装パターン (既存に倣う)

新機能は `src/lib/watchlist/` のパターンを踏襲:

```
src/lib/{feature}/
  api.ts        — createXxxApi(client) で DI 対応
  mappers.ts    — DB Row → ドメイン型
  query-keys.ts — React Query キー一元管理
src/hooks/
  use-{feature}.ts           — useQuery ラッパー
  use-{feature}-mutations.ts — useMutation ラッパー
```
