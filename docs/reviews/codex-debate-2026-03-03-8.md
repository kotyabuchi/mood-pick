# Codex Debate レビューレポート

> **日時**: 2026-03-03
> **対象**: Phase 3 フィード実装差分 (main..HEAD)
> **ラウンド数**: 2/5
> **採用指摘数**: 0 / 全6件 (3 Codex + 3 Claude)

## 対象ファイル

| ファイル | 行数 | 種別 |
|----------|------|------|
| `supabase/migrations/20260303223425_create_activity_log.sql` | 95 | 新規 |
| `src/lib/activity/api.ts` | 35 | 新規 |
| `src/lib/activity/mappers.ts` | 43 | 新規 |
| `src/lib/activity/query-keys.ts` | 4 | 新規 |
| `src/lib/activity/index.ts` | 3 | 新規 |
| `src/hooks/use-feed.ts` | 21 | 新規 |
| `src/app/(main)/feed/page.tsx` | 162 | 編集 |
| `src/__tests__/lib/activity-api.test.ts` | 178 | 新規 |
| `src/__tests__/hooks/use-feed.test.tsx` | 90 | 新規 |
| `src/__tests__/screens/feed-screen.test.tsx` | 175 | 編集 |

## Codex の指摘（3件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| C-1 | `src/hooks/use-feed.ts:17` | queryKey がユーザー非依存。アカウント切替時にキャッシュリーク | `feedKeys.list(user.id)` に変更 | 高 |
| C-2 | `src/lib/activity/mappers.ts:17` | JOIN 結果欠落時に name/handle が空文字フォールバック | activity_log に表示用ユーザー情報を非正規化 | 高 |
| C-3 | `supabase/migrations:39` | recipient_id 列があるのに SELECT ポリシーが recommend 未考慮 | recommend 条件を RLS に追加 | 中 |

## Claude の指摘（3件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| A-1 | `src/hooks/use-feed.ts:17` | C-1 と同一。ただし watchlistKeys も同パターン — プロジェクト横断課題 | auth 変更時に QueryClient.clear() の横断対応 | 低 |
| A-2 | `src/lib/activity/api.ts:24` | `as unknown as` キャスト | Supabase JOIN 型推論の制約上必要。CHECK 制約で安全 | 低 |
| A-3 | `src/lib/activity/mappers.ts:23` | `as FeedActionType` キャスト | activity_log CHECK 制約で安全 | 低 |

## 議論サマリー

### 合意点（初回で一致、即採用）

なし（全件議論対象）

### ラリーの記録

#### C-1: queryKey がユーザー非依存
- **R1 Codex**: queryKey に user.id を含めないとアカウント切替時にキャッシュリークする [高]
- **R1 Claude**: watchlistKeys も user.id を含まない同一パターン。feed だけ変更するとパターンの一貫性を破壊する。正しい修正は auth 変更時の QueryClient.clear() であり Phase 3 スコープ外
- **R2 Codex**: 【修正】同意。既存パターン全体の課題であり「横断改善バックログ」に格下げが妥当
- **結論**: 却下（Phase 3 スコープ外。横断改善として将来バックログに追加）

#### C-2: profile fallback to empty strings
- **R1 Codex**: profiles JOIN が null の場合に name/handle が空文字になる。非正規化を提案 [高]
- **R1 Claude**: profiles SELECT RLS は authenticated 全開放済み (`20260303103815`)。user_id は FK + ON DELETE CASCADE。JOIN null は理論的にありえない。空文字フォールバックは防御的コーディングとして許容
- **R2 Codex**: 【撤回】RLS と FK 制約を確認し、懸念が成立しないことに同意
- **結論**: 却下（profiles RLS 全開放により JOIN null は発生しない）

#### C-3: recipient_id RLS gap for recommend
- **R1 Codex**: recommend の recipient_id 条件が RLS にない [中]
- **R1 Claude**: Phase 5 への明示的延期済み。Phase 3 トリガーは watched/watching/want のみで recommend レコード未生成
- **R2 Codex**: 【修正】実害なし。Phase 5 確認事項として扱う
- **結論**: 却下（Phase 5 で対応予定。Phase 3 では実害なし）

### 議論を経て採用

なし

### 議論を経て却下

| 指摘 | 最終ラウンド | 却下理由 |
|------|:-----------:|---------|
| C-1 | R2 | プロジェクト横断課題。Phase 3 スコープ外 |
| C-2 | R2 | profiles RLS 全開放 + FK CASCADE で null 不発生 |
| C-3 | R2 | Phase 5 で対応予定。Phase 3 で recommend 未生成 |

## 実施した改善

なし（全件却下。コード品質に問題なしと判断）

## 検証結果

- lint/format: PASS (`pnpm check`)
- ビルド: PASS (`pnpm build`)
- テスト: PASS (281 tests, 33 files)
- react-doctor: 99/100 (既存 SettingsPage 警告のみ)

## 所見

Phase 3 の実装は既存パターン (watchlist, follows) との一貫性が保たれており、セキュリティ (RLS + SECURITY DEFINER trigger)、型安全性 (Supabase 生成型 + mapper)、テストカバレッジ (15 tests across 3 files) ともに十分な品質。

Codex が指摘した queryKey のユーザー非依存問題は、プロジェクト全体の横断課題として将来的に auth 変更時の QueryClient invalidation で対応すべき。
