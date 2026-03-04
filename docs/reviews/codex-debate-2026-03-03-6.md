# Codex Debate レビューレポート

> **日時**: 2026-03-03
> **対象**: Phase 2 プロフィール完全実装 (差分モード)
> **ラウンド数**: 2/5
> **採用指摘数**: 3 / 全4件

## 対象ファイル

| ファイル | 行数 | 種別 |
|----------|------|------|
| `supabase/migrations/20260303123100_profile_handle_check.sql` | 11 | 新規 |
| `supabase/migrations/20260303123200_create_avatars_bucket.sql` | 16 | 新規 |
| `src/lib/profile/api.ts` | 62 | 新規 |
| `src/lib/profile/validation.ts` | 18 | 新規 |
| `src/lib/profile/query-keys.ts` | 4 | 新規 |
| `src/lib/profile/index.ts` | 5 | 新規 |
| `src/hooks/use-profile.ts` | 22 | 新規 |
| `src/hooks/use-timed-watch-stats.ts` | 20 | 新規 |
| `src/hooks/use-profile-mutations.ts` | 59 | 新規 |
| `src/app/(main)/profile/page.tsx` | 107 | 変更 |
| `src/app/(main)/profile/edit/page.tsx` | 251 | 新規 |
| `src/app/(main)/settings/page.tsx` | 175 | 変更 |
| `src/lib/watchlist/api.ts` | 166 | 変更 |
| `src/lib/watchlist/query-keys.ts` | 11 | 変更 |
| `src/components/ui/auth-input.tsx` | 69 | 変更 |
| `next.config.ts` | 25 | 変更 |
| `src/types/database.ts` | 338 | 変更 |

## Codex の指摘（4件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| C-1 | migrations:2 | handle 正規化で UNIQUE 衝突リスク | 重複検出・退避してから UPDATE | 高 |
| C-2 | profile/edit:69 | handle チェックのレスポンス競合 | ref で最終値を保持し stale 応答を無視 | 中 |
| C-3 | profile/edit:139 | handle を空にできない | 空入力は null で送信 | 中 |
| C-4 | query-keys:10 | timedStats key に userId なし | timedStats(userId) 形式に変更 | 低 |

## Claude の指摘（2件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| A-1 | profile/edit:69-77 | handle チェック race condition | C-2 と同一 | 中 |
| A-2 | profile/edit:139 | handle クリア不可 | C-3 と同一 | 中 |

## 議論サマリー

### 合意点（初回で一致、即採用）

- C-1: マイグレーションの UNIQUE 衝突リスク — profiles テーブルに `handle text unique` 制約あり。`lower(trim())` の一括正規化で衝突する可能性
- C-2/A-1: handle チェック race condition — デバウンス後の mutation 応答が stale になるケース
- C-3/A-2: handle クリア不可 — `handle || undefined` で空文字が無視される

### ラリーの記録

#### C-4: timedStats query key に userId がない
- **R1 Codex**: アカウント切替時に古いキャッシュが再利用されるリスク
- **R1 Claude**: `watchlistKeys.stats()` も userId なし。RLS でユーザー分離済み。profileKeys は他ユーザーページがあるため userId を入れたが、watchlist は自分データのみ。パターン一貫性を維持すべき
- **R2 Codex**: 【修正】RLS 観点の漏洩指摘は撤回。UX/整合性として低優先度で維持。auth 変更時 invalidate で吸収可能
- **R2 Claude**: auth 変更時の全キャッシュクリアが一般的対応。個々のキーに userId を入れる必要なし
- **結論**: 却下（既存パターンとの一貫性優先、auth 変更時 invalidate で対応）

### 議論を経て採用

| 指摘 | 最終ラウンド | ラリー概要 | 結論 |
|------|:-----------:|-----------|------|
| C-1 | R1 | 即合意 | 採用 |
| C-2/A-1 | R1 | 即合意 | 採用 |
| C-3/A-2 | R1 | 即合意 | 採用 |

### 議論を経て却下

| 指摘 | 最終ラウンド | 却下理由 |
|------|:-----------:|---------|
| C-4 | R2 | 既存パターンとの一貫性。RLS でデータ分離済み。auth 変更時 invalidate で対応 |

## 実施した改善

| # | ファイル | 改善内容 | 出典 |
|---|---------|---------|------|
| 1 | `supabase/migrations/20260303123100_profile_handle_check.sql` | 正規化前に重複検出、衝突行は NULL に退避 | C-1 |
| 2 | `src/app/(main)/profile/edit/page.tsx` | `lastCheckedHandle` ref で stale 応答を無視 | C-2/A-1 |
| 3 | `src/lib/profile/api.ts` + `src/app/(main)/profile/edit/page.tsx` + `src/hooks/use-profile-mutations.ts` | handle に `null` を許容、空文字 → null で DB クリア | C-3/A-2 |

## 検証結果

- lint/format: PASS
- ビルド: PASS
- テスト: PASS (31 files, 273 tests)

## 所見

Phase 2 の実装は全体的に堅実。既存の DI + React Query パターンを正確に踏襲しており、mockCurrentUser の完全除去が達成された。Codex が指摘した migration の UNIQUE 衝突リスクは本番データで発生しうる重要な問題で、早期発見できた価値が高い。handle チェックの race condition と空文字処理も、UX に直結する実用的な改善。
