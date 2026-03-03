# PROGRESS.md

モックデータ → 実DB/API 移行の進捗管理。

## 現状

| レイヤー | 状態 |
|----------|------|
| 認証 (Auth) | Supabase SSR 実装済み |
| ウォッチリスト CRUD | Supabase `watchlist_items` 実装済み |
| 検索・詳細 | TMDb API proxy 実装済み |
| フォロー | Supabase `follows` 実装済み |
| **フィード** | **モック (`mockFeedItems`)** |
| **通知** | **モック (`mockNotifications`)** |
| **プロフィール** | **一部モック (`mockCurrentUser`)** — stats/recentWatched は実DB |
| ユーザーページ | Supabase `profiles` + `follows` 実装済み |
| **おすすめ送信** | **モック (`mockContents`, `mockUsers`)** — 送信ロジックなし |

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

- [ ] `profile/page.tsx` — ユーザー情報を `profiles` テーブルから取得
- [ ] 今月/今年の視聴数を `watchlist_items` の日付フィルタで算出
- [ ] プロフィール編集機能 (name, handle, avatar_url 更新)
- [ ] handle バリデーション: 英数字+アンダースコア、3-20文字、小文字正規化 (DB CHECK 制約 + アプリ側 Zod)

### Phase 3: フィード (アクティビティ)

モック依存: `feed/page.tsx`

- [ ] `activity_log` テーブル作成 (user_id, tmdb_id, action_type, rating, review, message, recipient_id, created_at)
- [ ] インデックス: `(created_at DESC, id DESC)` 複合インデックス (ページネーション対応)
- [ ] RLS ポリシー (フォロー中ユーザーのアクティビティを SELECT 可 — follows テーブルへのサブクエリ)
- [ ] `watchlist_items` の status 変更時に `activity_log` へ自動挿入するトリガー (`WHEN OLD.status IS DISTINCT FROM NEW.status` で冪等性確保)
- [ ] `src/lib/activity/api.ts` — getFeed (フォロー中ユーザーのアクティビティ)
- [ ] `src/lib/activity/mappers.ts` — Row → FeedItem 変換 (profiles JOIN + TMDb情報)
- [ ] `src/hooks/use-feed.ts`
- [ ] `feed/page.tsx` 実装差し替え

### Phase 4: 通知

モック依存: `notifications/page.tsx`

- [ ] `notifications` テーブル作成 (user_id, type, title, target_id, service_name, is_read, created_at)
- [ ] インデックス: `(created_at DESC, id DESC)` 複合インデックス (ページネーション対応)
- [ ] RLS ポリシー (自分の通知のみ SELECT/UPDATE)
- [ ] 通知生成トリガー: フォローされた時 (おすすめ通知は Phase 5 で追加)
- [ ] `src/lib/notifications/api.ts` — getNotifications, markAsRead, getUnreadCount
- [ ] `src/hooks/use-notifications.ts`
- [ ] `notifications/page.tsx` 実装差し替え
- [ ] ヘッダーの通知ベルに未読バッジ表示

### Phase 5: おすすめ送信

モック依存: `recommend/[id]/page.tsx`

- [ ] `recommendations` テーブル作成 (from_user_id, to_user_id, tmdb_id, message, created_at)
- [ ] RLS ポリシー (自分の送信/受信のみ SELECT、自分の送信のみ INSERT)
- [ ] 送信ロジック実装 (複数ユーザー一括送信)
- [ ] 送信時に `notifications` へ自動挿入するトリガー (おすすめ受信通知)
- [ ] `recommend/[id]/page.tsx` 実装差し替え — フォロー中ユーザー一覧を実DBから取得

### Phase 6: クリーンアップ

- [ ] `src/lib/mock-data.ts` 削除
- [ ] `src/__tests__/lib/mock-data.test.ts` 削除
- [ ] 残存するモックデータ依存がないことを最終確認
- [ ] RLS ポリシーの全体スモークテスト実施

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
