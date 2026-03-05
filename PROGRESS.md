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

### Phase 7: 気分タグ自動判定

仕様書: 登録系「気分タグ自動判定（ジャンル→気分マッピング）」

- [x] ジャンル→気分タグのマッピングルール定義 (TMDb genre_id → 興奮/切ない/笑い/思考/まったり)
- [x] `src/lib/tmdb/mood-mapping.ts` — マッピングロジック実装
- [x] AddToWatchlistDialog で気分タグを自動プリセット (手動変更可能は維持)
- [x] UI テキスト「気分タグ（自動判定）」+「※ タップで変更できます」表示
- [x] `useState(isSubmitting)` → `useTransition + useOptimistic` パターンへリファクタ
- [x] テスト: マッピングロジックの単体テスト
- [x] codex-debate レビュー: 1件採用 (useEffect エラーリセット条件改善)

### Phase 8: リスト並び替え

仕様書: 管理系「並び替え（追加日/タイトル/終了日/視聴日）」

- [ ] リスト画面に並び替えUI追加 (追加日/タイトル/視聴日)
- [ ] Supabase クエリに ORDER BY パラメータ追加
- [ ] `use-watchlist` に sortBy オプション追加
- [ ] テスト: 並び替え動作確認

### Phase 9: 配信情報連携 (Streaming Availability API)

仕様書: 通知系「配信終了アラート」、作品詳細「配信サービス一覧」

- [ ] Streaming Availability API 調査・API キー取得
- [ ] `src/app/api/streaming/` — API プロキシ作成
- [ ] `src/lib/streaming/` — api.ts, mappers.ts
- [ ] `streaming_availability` テーブル作成 (tmdb_id, service, expires_at, updated_at)
- [ ] 作品詳細画面に配信サービス一覧・終了予定日を表示
- [ ] AddToWatchlistDialog に配信情報表示
- [ ] ホーム画面「配信終了まもなく」セクション追加
- [ ] 配信終了アラート通知生成 (7日前/3日前/前日) — cron or Edge Function
- [ ] テスト

### Phase 10: ソーシャル機能拡張

仕様書: ソーシャル系の未実装分

- [ ] 招待リンク生成・共有機能
- [ ] 招待リンクからの登録 → 自動フォロー確認
- [ ] リスト公開スコープ設定 (非公開/フォロワーのみ/全体公開) — `profiles` にカラム追加 + RLS 条件分岐
- [ ] 他人のリスト閲覧 (公開設定に応じた表示)
- [ ] 設定画面のプライバシーセクション実装

### Phase 11: フィード・通知の強化

仕様書: フィード「コメント機能」、設定「通知設定」

- [ ] フィードのコメント機能 (`comments` テーブル + UI)
- [ ] 通知設定の細かい ON/OFF (配信終了/フォロー/おすすめ 個別切り替え) — `profiles` or `notification_settings` テーブル

## Fix

### テキスト検索結果の既登録状態が反映されない

**現象**: `search/page.tsx` の TextSearch モードで、既にウォッチリストに登録済みの作品にも「追加」ボタンが同じ見た目で表示され、押すと再度 AddToWatchlistDialog が開く。

**原因**: TextSearch は `useTmdbSearch` で TMDb API の結果をそのまま `ContentCard` に `showAddButton=true` で渡しており、`watchlist_items` との突合をしていない。

**対比**: 詳細ページ (`detail-client.tsx`) では `useWatchlistItem(tmdbId)` で登録状態を取得し、未登録時のみ「見たいに追加」ボタンを表示している。

**関連ファイル**:
- `src/app/(main)/search/page.tsx` — 検索結果の表示ロジック
- `src/components/ui/content-card.tsx` — `showAddButton` の表示制御
- `src/components/ui/add-to-watchlist-dialog.tsx` — Dialog 側にも重複チェックなし
- `src/hooks/use-watchlist.ts` — `useWatchlistItem(tmdbId)` が既に利用可能

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
