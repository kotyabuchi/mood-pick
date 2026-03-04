# PROGRESS.md

モックデータ → 実DB/API 移行の進捗管理。

## 現状

| レイヤー | 状態 |
|----------|------|
| 認証 (Auth) | Supabase SSR 実装済み |
| ウォッチリスト CRUD | Supabase `watchlist_items` 実装済み |
| 検索・詳細 | TMDb API proxy 実装済み |
| フォロー | Supabase `follows` 実装済み |
| フィード | Supabase `activity_log` 実装済み (トリガー自動生成 + RLS) |
| 通知 | Supabase `notifications` 実装済み — フォロートリガー + RLS + 未読バッジ |
| プロフィール | Supabase `profiles` 実装済み — 編集・アバター・handle バリデーション完了 |
| ユーザーページ | Supabase `profiles` + `follows` 実装済み |
| おすすめ送信 | Supabase `recommendations` 実装済み — 送信ロジック + トリガー (activity_log + notifications) |

## 既存DBテーブル

- `profiles` — id, name, handle, avatar_url, created_at, updated_at
- `watchlist_items` — id, user_id, tmdb_id, title, type, status, mood_tags, rating, review, memo, ...

## 全体ルール

- **後方互換マイグレーション**: DB変更は常に後方互換にする (expand/contract パターン)。カラム削除やリネームは2段階で行い、アプリデプロイとDBマイグレーションの順序に依存しないようにする
- **DOWN マイグレーション**: 各マイグレーションファイルにコメントでロールバック SQL を記載する
- **RLS スモークテスト**: 各 Phase のマイグレーション作成時、`psql` で owner/other/anon の許可・拒否を最低限確認する。将来的に CI 化を検討
- **ページネーション方針**: 初期実装は `LIMIT 50 + ORDER BY created_at DESC, id DESC` で全件取得。データ量増加時に cursor-based pagination へ移行。`activity_log` と `notifications` には `(created_at DESC, id DESC)` 複合インデックスを初期から作成
- **テスト移行**: 各 Phase でページ差し替え時にテストも同時移行する (Phase 6 は最終確認のみ)

## TODO

### Phase 0: 既存スキーマ修正

Phase 1 の前提条件。

- [x] `profiles` の SELECT RLS を全 authenticated ユーザーに開放 (現在は自分のみ → フォロー/ユーザー表示に必要)
- [x] `supabase gen types` で型再生成 (Phase 1 のテーブル作成後にまとめて実施)

### Phase 1: フォロー機能

モック依存: `follows/page.tsx`, `user/[id]/page.tsx`, `recommend/[id]/page.tsx`

- [x] `follows` テーブル作成 (follower_id, following_id, created_at / PK: composite / CHECK: self-follow禁止)
- [x] RLS ポリシー (自分のフォロー関係のみ INSERT/DELETE、全ユーザー SELECT)
- [x] `src/lib/follows/api.ts` — fetchFollowing, fetchFollowers, follow, unfollow, fetchFollowCounts, checkIsFollowing, fetchUserProfile
- [x] `src/lib/follows/mappers.ts` — ProfileRow → User 変換 (mapProfileRowToListUser / mapProfileRowToUser)
- [x] `src/lib/follows/query-keys.ts` — followKeys (all, following, followers, counts, isFollowing)
- [x] `src/hooks/use-follows.ts` — useFollowing, useFollowers, useFollowCounts, useIsFollowing
- [x] `src/hooks/use-follow-mutations.ts` — useToggleFollow (楽観的更新付き)
- [x] `src/hooks/use-user-profile.ts` — useUserProfile (profile + counts + isFollowing 並列取得)
- [x] `follows/page.tsx` 実装差し替え (ローディング・空状態対応)
- [x] `user/[id]/page.tsx` 実装差し替え (自分のプロフィールはフォローボタン非表示)
- [x] `profile/page.tsx` のフォロー数を実DBから取得
- [x] `supabase gen types` で型再生成
- [x] テスト: follows-api (11件), use-follows (4件), follows-screen (7件) — 全合格

### Phase 2: プロフィール完全実装

モック依存: `profile/page.tsx` の `mockCurrentUser`

- [x] `profile/page.tsx` — ユーザー情報を `profiles` テーブルから取得
- [x] 今月/今年の視聴数を `watchlist_items` の日付フィルタで算出
- [x] プロフィール編集機能 (name, handle, avatar_url 更新)
- [x] handle バリデーション: 英数字+アンダースコア、3-20文字、小文字正規化 (DB CHECK 制約 + アプリ側 Zod)
- [x] テスト: profile-api (8件), profile-validation (20件), watchlist-timed-stats (4件), use-profile (2件), use-timed-watch-stats (1件), profile-screen (6件), use-profile-mutations (3件), profile-edit-screen (4件) — 全合格
- [x] codex-debate レビュー: 3件採用 (migration UNIQUE 衝突防止, handle チェック race condition, handle クリア対応)

### Phase 3: フィード (アクティビティ)

モック依存: `feed/page.tsx`

- [x] `activity_log` テーブル作成 (user_id, tmdb_id, action_type, rating, review, message, recipient_id + 非正規化コンテンツ列)
- [x] インデックス: `(created_at DESC, id DESC)` 複合インデックス (ページネーション対応)
- [x] RLS ポリシー (フォロー中 + 自分のアクティビティを SELECT 可 — follows サブクエリ)
- [x] `watchlist_items` の INSERT/UPDATE 時に `activity_log` へ自動挿入するトリガー (SECURITY DEFINER, `WHEN OLD.status IS DISTINCT FROM NEW.status`)
- [x] 既存 `watchlist_items` からのバックフィル
- [x] `src/lib/activity/api.ts` — createActivityApi(client).fetchFeed() (profiles JOIN + DI パターン)
- [x] `src/lib/activity/mappers.ts` — mapActivityRowToFeedItem (Row + profile → FeedItem)
- [x] `src/lib/activity/query-keys.ts` — feedKeys (all, list)
- [x] `src/hooks/use-feed.ts` — useFeed (React Query + enabled: !!user)
- [x] `feed/page.tsx` 実装差し替え (ローディング/エラー/空状態対応)
- [x] テスト: activity-api (6件), use-feed (1件), feed-screen (8件) — 全合格
- [x] codex-debate レビュー: 0件採用 (3件全て Phase 3 スコープ外と判断)

### Phase 4: 通知

モック依存: `notifications/page.tsx`

- [x] `notifications` テーブル作成 (user_id, type, title, target_id, service_name, is_read, created_at)
- [x] インデックス: `(user_id, created_at DESC, id DESC)` 複合 + `(user_id) WHERE is_read = false` partial
- [x] RLS ポリシー (自分の通知のみ SELECT/UPDATE、INSERT はトリガー経由のみ)
- [x] 通知生成トリガー: フォローされた時 (`notify_on_follow` SECURITY DEFINER)
- [x] `src/lib/notifications/api.ts` — fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead
- [x] `src/hooks/use-notifications.ts` — useNotifications, useUnreadNotificationCount (60s refetch)
- [x] `src/hooks/use-notification-mutations.ts` — useMarkAsRead, useMarkAllAsRead (楽観的更新)
- [x] `notifications/page.tsx` 実装差し替え (ローディング/エラー/空状態、日付グループ表示)
- [x] ヘッダーの通知ベルに未読バッジ表示 (NotificationBadge コンポーネント)
- [x] テスト: notifications-api (11件), notifications-mappers (4件), use-notifications (2件), use-notification-mutations (2件), notification-badge (4件), notifications-screen (11件) — 全合格
- [x] codex-debate レビュー: 1件採用 (groupByDate に older セクション追加)

### Phase 5: おすすめ送信 ✅

- [x] `recommendations` テーブル作成 (from_user_id, to_user_id, tmdb_id, content_type, title, poster_url, message 等)
- [x] RLS ポリシー (送受信者 SELECT、フォロー中相手のみ INSERT)、no_self_recommend CHECK 制約
- [x] `activity_log` 追加ポリシー (recipient_id ベースの SELECT)
- [x] トリガー `on_recommendation_created()` — activity_log + notifications 自動生成
- [x] `lib/recommendations/api.ts` — `sendRecommendations()` (anime→tv 正規化、一括 INSERT)
- [x] `hooks/use-recommendation-mutations.ts` — `useSendRecommendations()`
- [x] `recommend/[id]/page.tsx` 全面書き換え — useContentDetail + useFollowing で実DB/API接続
- [x] テスト: recommendations-api (4件), recommend-screen (9件) — 全合格
- [x] codex-debate レビュー: 2件採用 (送信エラーハンドリング追加, activity_log ポリシー制約強化)
- [x] react-doctor: 100/100, pnpm check / build / test 全パス

### Phase 6: クリーンアップ

- [x] `src/lib/mock-data.ts` 削除
- [x] `src/__tests__/lib/mock-data.test.ts` 削除
- [x] 残存するモックデータ依存がないことを最終確認
- [x] RLS ポリシーの全体スモークテスト実施 (テスト SQL 作成: `docs/reviews/phase6-rls-smoke-test.md`)

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
