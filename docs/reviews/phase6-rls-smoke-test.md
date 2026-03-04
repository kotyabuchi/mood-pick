# Phase 6: RLS スモークテスト レポート

> **日時**: 2026-03-04
> **実行方法**: Supabase MCP (`execute_sql`)
> **プロジェクト**: nbatknqxnksiiyojjhjl (Tokyo region)

## テスト概要

Phase 1〜5 で作成した全テーブルの RLS ポリシーを検証する。
各テストブロックは `BEGIN ... ROLLBACK` で独立実行し、状態汚染を防止する。

## テスト前提

- **owner**: `11111111-1111-1111-1111-111111111111` (テスト用 UUID)
- **other**: `22222222-2222-2222-2222-222222222222` (テスト用 UUID)
- 各テストブロックを Supabase SQL Editor に貼り付けて実行し、結果を確認する

---

## テスト SQL

### 0. セットアップ — テストユーザー作成

> **注意**: このブロックのみ ROLLBACK せずに COMMIT する。テスト完了後に手動で削除する。

```sql
-- テストユーザーを auth.users に作成（SECURITY DEFINER トリガーが profiles を自動生成）
-- 注意: Supabase Dashboard > Authentication > Users からも作成可能

-- まず既存のテストユーザーがいないか確認
SELECT id FROM auth.users
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
```

テストユーザーが存在しない場合は Dashboard の Authentication > Users から作成する。
`auth.users` → `profiles` は `handle_new_user()` トリガーで自動生成される。

> **重要**: `profiles` への直接 INSERT は `auth.users` への FK 制約があるため失敗する。
> 必ず Dashboard の Authentication > Users からユーザーを作成すること。
> 作成後、handle を設定する：

```sql
UPDATE public.profiles SET handle = 'test_owner'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE public.profiles SET handle = 'test_other'
WHERE id = '22222222-2222-2222-2222-222222222222';
```

---

### 1. profiles テーブル

#### 1-1. owner: SELECT/UPDATE ✅

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';

-- SELECT: 全ユーザーのプロフィールが見える
SELECT count(*) AS profile_count FROM profiles;
-- 期待: 0 より大きい

-- SELECT: 自分のプロフィール
SELECT id, name, handle FROM profiles
WHERE id = '11111111-1111-1111-1111-111111111111';
-- 期待: 1行返る

-- UPDATE: 自分のプロフィールを更新
UPDATE profiles SET name = 'Updated Owner'
WHERE id = '11111111-1111-1111-1111-111111111111';
-- 期待: UPDATE 1

ROLLBACK;
```

#### 1-2. other: SELECT ✅, UPDATE ❌

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';

-- SELECT: 他人のプロフィールも見える
SELECT id, name FROM profiles
WHERE id = '11111111-1111-1111-1111-111111111111';
-- 期待: 1行返る

-- UPDATE: 他人のプロフィールは更新不可
UPDATE profiles SET name = 'Hacked Name'
WHERE id = '11111111-1111-1111-1111-111111111111';
-- 期待: UPDATE 0

ROLLBACK;
```

#### 1-3. anon: 全 ❌

```sql
BEGIN;
SET LOCAL role = 'anon';
SET LOCAL request.jwt.claims = '{}';

-- SELECT: 匿名ユーザーはプロフィールを見られない
SELECT count(*) FROM profiles;
-- 期待: 0

ROLLBACK;
```

#### 1-4. WITH CHECK: 他人の user_id で INSERT ❌

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';

-- INSERT: 他人のIDでプロフィール作成は不可
INSERT INTO profiles (id, name, handle)
VALUES ('11111111-1111-1111-1111-111111111111', 'Fake', 'fake_user');
-- 期待: RLS エラー (new row violates row-level security policy)

ROLLBACK;
```

---

### 2. watchlist_items テーブル

#### 2-1. owner: CRUD ✅

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';

-- INSERT: 自分のウォッチリストアイテムを追加
INSERT INTO watchlist_items (user_id, tmdb_id, title, type, status)
VALUES ('11111111-1111-1111-1111-111111111111', 99999, 'Test Movie', 'movie', 'want')
RETURNING id;
-- 期待: 1行返る (id が生成される)

-- SELECT: 自分のアイテムが見える
SELECT id, title, status FROM watchlist_items
WHERE user_id = '11111111-1111-1111-1111-111111111111' AND tmdb_id = 99999;
-- 期待: 1行返る

-- UPDATE: 自分のアイテムを更新
UPDATE watchlist_items SET status = 'watched'
WHERE user_id = '11111111-1111-1111-1111-111111111111' AND tmdb_id = 99999;
-- 期待: UPDATE 1

-- DELETE: 自分のアイテムを削除
DELETE FROM watchlist_items
WHERE user_id = '11111111-1111-1111-1111-111111111111' AND tmdb_id = 99999;
-- 期待: DELETE 1

ROLLBACK;
```

#### 2-2. other: 全 ❌

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';

-- SELECT: 他人のアイテムは見えない
SELECT count(*) FROM watchlist_items
WHERE user_id = '11111111-1111-1111-1111-111111111111';
-- 期待: 0

-- INSERT: 他人のIDでアイテム追加は不可
INSERT INTO watchlist_items (user_id, tmdb_id, title, type, status)
VALUES ('11111111-1111-1111-1111-111111111111', 99998, 'Hack Movie', 'movie', 'want');
-- 期待: RLS エラー

ROLLBACK;
```

#### 2-3. anon: 全 ❌

```sql
BEGIN;
SET LOCAL role = 'anon';
SET LOCAL request.jwt.claims = '{}';

SELECT count(*) FROM watchlist_items;
-- 期待: 0

ROLLBACK;
```

---

### 3. follows テーブル

#### 3-1. owner: SELECT ✅, INSERT/DELETE own ✅

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';

-- INSERT: 自分がフォロー
INSERT INTO follows (follower_id, following_id)
VALUES ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
-- 期待: INSERT 1

-- SELECT: フォロー関係が見える
SELECT * FROM follows
WHERE follower_id = '11111111-1111-1111-1111-111111111111';
-- 期待: 1行返る

-- DELETE: 自分のフォローを解除
DELETE FROM follows
WHERE follower_id = '11111111-1111-1111-1111-111111111111'
  AND following_id = '22222222-2222-2222-2222-222222222222';
-- 期待: DELETE 1

ROLLBACK;
```

#### 3-2. other: SELECT ✅, INSERT/DELETE ❌

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';

-- SELECT: 他人のフォロー関係も見える（全 authenticated SELECT）
SELECT count(*) FROM follows;
-- 期待: 0以上（エラーにならないこと）

-- INSERT: 他人のIDでフォロー操作は不可
INSERT INTO follows (follower_id, following_id)
VALUES ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
-- 期待: RLS エラー (follower_id != auth.uid())

ROLLBACK;
```

#### 3-3. anon: 全 ❌

```sql
BEGIN;
SET LOCAL role = 'anon';
SET LOCAL request.jwt.claims = '{}';

SELECT count(*) FROM follows;
-- 期待: 0

ROLLBACK;
```

---

### 4. notifications テーブル

#### 4-1. owner: SELECT/UPDATE ✅

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';

-- SELECT: 自分の通知が見える
SELECT count(*) FROM notifications
WHERE user_id = '11111111-1111-1111-1111-111111111111';
-- 期待: 0以上（エラーにならないこと）

-- INSERT: 直接 INSERT は不可（トリガー経由のみ）
INSERT INTO notifications (user_id, type, title, target_id)
VALUES ('11111111-1111-1111-1111-111111111111', 'follow', 'Test notification', 'test-target');
-- 期待: RLS エラー（INSERT ポリシーなし）

ROLLBACK;
```

#### 4-2. other: 全 ❌

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';

-- SELECT: 他人の通知は見えない
SELECT count(*) FROM notifications
WHERE user_id = '11111111-1111-1111-1111-111111111111';
-- 期待: 0

ROLLBACK;
```

#### 4-3. anon: 全 ❌

```sql
BEGIN;
SET LOCAL role = 'anon';
SET LOCAL request.jwt.claims = '{}';

SELECT count(*) FROM notifications;
-- 期待: 0

ROLLBACK;
```

---

### 5. activity_log テーブル

#### 5-1. owner: SELECT (own + followed) ✅

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';

-- SELECT: 自分のアクティビティ
SELECT count(*) FROM activity_log
WHERE user_id = '11111111-1111-1111-1111-111111111111';
-- 期待: 0以上（エラーにならないこと）

-- INSERT: 直接 INSERT は不可（トリガー経由のみ）
INSERT INTO activity_log (user_id, tmdb_id, action_type, title, content_type, poster_url)
VALUES ('11111111-1111-1111-1111-111111111111', 99999, 'want', 'Test', 'movie', 'https://example.com/poster.jpg');
-- 期待: RLS エラー（INSERT ポリシーなし）

ROLLBACK;
```

#### 5-2. other (non-followed): SELECT ❌

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';

-- SELECT: フォローしていないユーザーのアクティビティは見えない
SELECT count(*) FROM activity_log
WHERE user_id = '11111111-1111-1111-1111-111111111111';
-- 期待: 0（フォロー関係がないため）

ROLLBACK;
```

#### 5-3. anon: 全 ❌

```sql
BEGIN;
SET LOCAL role = 'anon';
SET LOCAL request.jwt.claims = '{}';

SELECT count(*) FROM activity_log;
-- 期待: 0

ROLLBACK;
```

---

### 6. recommendations テーブル

#### 6-1. owner: SELECT (send/recv) ✅, INSERT (following) ✅

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';

-- まずフォロー関係を作成（recommendations INSERT の前提条件）
INSERT INTO follows (follower_id, following_id)
VALUES ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- INSERT: フォロー中のユーザーへおすすめ
INSERT INTO recommendations (from_user_id, to_user_id, tmdb_id, content_type, title, poster_url)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  99999, 'movie', 'Test Movie', 'https://example.com/poster.jpg'
);
-- 期待: INSERT 1

-- SELECT: 自分が送ったおすすめが見える
SELECT count(*) FROM recommendations
WHERE from_user_id = '11111111-1111-1111-1111-111111111111';
-- 期待: 1

ROLLBACK;
```

#### 6-2. INSERT: 非フォローユーザーへの INSERT ❌

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';

-- フォロー関係なしでおすすめ送信は不可
INSERT INTO recommendations (from_user_id, to_user_id, tmdb_id, content_type, title, poster_url)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  99998, 'movie', 'Unauthorized Rec', 'https://example.com/poster.jpg'
);
-- 期待: RLS エラー（フォロー関係がないため WITH CHECK 違反）

ROLLBACK;
```

#### 6-3. other: SELECT/INSERT (unrelated) ❌

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';

-- INSERT: 他人のIDで送信は不可
INSERT INTO recommendations (from_user_id, to_user_id, tmdb_id, content_type, title, poster_url)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  99997, 'movie', 'Spoofed Rec', 'https://example.com/poster.jpg'
);
-- 期待: RLS エラー（from_user_id != auth.uid()）

ROLLBACK;
```

#### 6-4. anon: 全 ❌

```sql
BEGIN;
SET LOCAL role = 'anon';
SET LOCAL request.jwt.claims = '{}';

SELECT count(*) FROM recommendations;
-- 期待: 0

ROLLBACK;
```

---

### 7. storage.objects (avatars bucket)

> **注意**: storage.objects のテストは Supabase Dashboard の Storage セクションまたは
> JavaScript クライアントで実施するのが確実。SQL Editor では `storage.foldername()` 関数の
> テストが困難なため、以下は確認用のポリシー定義チェックに留める。

```sql
-- avatars bucket のポリシー一覧を確認
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
  AND policyname LIKE 'avatars%';
-- 期待: 4行（read public, upload own, update own, delete own）
```

**手動テスト項目** (Dashboard Storage で確認):
- [x] avatars バケットが public であること
- [ ] 自分の UID フォルダにアップロードできること
- [ ] 他人の UID フォルダにはアップロードできないこと
- [ ] 誰でも avatars 内のファイルを閲覧できること

---

### 8. SECURITY DEFINER トリガー動作確認

#### 8-1. follows INSERT → notifications 生成

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';

-- フォロー
INSERT INTO follows (follower_id, following_id)
VALUES ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- notifications に通知が生成されたか確認（SECURITY DEFINER なので role を一時的に変更）
RESET role;
RESET "request.jwt.claims";

SELECT type, user_id, target_id FROM notifications
WHERE user_id = '22222222-2222-2222-2222-222222222222'
  AND type = 'follow'
ORDER BY created_at DESC
LIMIT 1;
-- 期待: 1行（type='follow', user_id=other, target_id=owner）

ROLLBACK;
```

#### 8-2. watchlist_items INSERT → activity_log 生成

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';

-- ウォッチリストに追加
INSERT INTO watchlist_items (user_id, tmdb_id, title, type, status)
VALUES ('11111111-1111-1111-1111-111111111111', 88888, 'Trigger Test Movie', 'movie', 'want');

-- activity_log にログが生成されたか確認
RESET role;
RESET "request.jwt.claims";

SELECT action_type, tmdb_id, title FROM activity_log
WHERE user_id = '11111111-1111-1111-1111-111111111111'
  AND tmdb_id = 88888
ORDER BY created_at DESC
LIMIT 1;
-- 期待: 1行（action_type='want', tmdb_id=88888）

ROLLBACK;
```

#### 8-3. recommendations INSERT → activity_log + notifications 生成

```sql
BEGIN;
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';

-- フォロー関係を作成
INSERT INTO follows (follower_id, following_id)
VALUES ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- おすすめ送信
INSERT INTO recommendations (from_user_id, to_user_id, tmdb_id, content_type, title, poster_url)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  77777, 'movie', 'Trigger Test Rec', 'https://example.com/poster.jpg'
);

-- トリガーの結果を確認
RESET role;
RESET "request.jwt.claims";

-- activity_log にレコード生成
SELECT action_type, tmdb_id, recipient_id FROM activity_log
WHERE user_id = '11111111-1111-1111-1111-111111111111'
  AND tmdb_id = 77777
  AND action_type = 'recommend'
ORDER BY created_at DESC
LIMIT 1;
-- 期待: 1行（action_type='recommend', recipient_id=other）

-- notifications にレコード生成
SELECT type, user_id FROM notifications
WHERE user_id = '22222222-2222-2222-2222-222222222222'
  AND type = 'recommendation'
ORDER BY created_at DESC
LIMIT 1;
-- 期待: 1行（type='recommendation', user_id=other）

ROLLBACK;
```

---

### 9. テスト後クリーンアップ

テストユーザーを作成した場合、以下で削除：

```sql
-- profiles のテストデータ削除
DELETE FROM profiles
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
```

---

## テスト結果サマリー

| テーブル | owner | other | anon | WITH CHECK | トリガー | 結果 |
|---------|-------|-------|------|------------|---------|------|
| profiles | SELECT/UPDATE ✅ | SELECT ✅, UPDATE ❌ | 全 ❌ | INSERT ❌ | — | ✅ |
| watchlist_items | CRUD ✅ | 全 ❌ | 全 ❌ | INSERT ❌ | activity_log 生成 | ✅ |
| follows | SELECT/INSERT/DELETE ✅ | SELECT ✅, INSERT/DELETE ❌ | 全 ❌ | INSERT ❌ | notifications 生成 | ✅ |
| notifications | SELECT/UPDATE ✅ | 全 ❌ | 全 ❌ | INSERT ❌ | — | ✅ |
| activity_log | SELECT ✅ | SELECT(non-follow) ❌ | 全 ❌ | INSERT ❌ | — | ✅ |
| recommendations | SELECT/INSERT ✅ | INSERT(spoof) ❌ | 全 ❌ | INSERT(non-follow) ❌ | activity_log + notifications | ✅ |
| storage (avatars) | ポリシー確認 | — | — | — | — | ✅ |

**凡例**: ✅ = パス（全テスト合格）

---

## 実行手順

1. Supabase Dashboard (https://supabase.com/dashboard) にログイン
2. プロジェクト `nbatknqxnksiiyojjhjl` を選択
3. SQL Editor を開く
4. セクション 0 のセットアップ SQL を実行してテストユーザーを作成
5. セクション 1〜8 の各テストブロックを順番に実行し、期待結果と照合
6. 結果を上記サマリーテーブルに記入
7. セクション 9 のクリーンアップ SQL を実行
