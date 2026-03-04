# Codex Debate レビューレポート

> **日時**: 2026-03-04
> **対象**: Phase 5 おすすめ送信機能（差分モード）
> **ラウンド数**: 2/5
> **採用指摘数**: 2 / 全5件

## 対象ファイル

| ファイル | 行数 | 種別 |
|----------|------|------|
| `supabase/migrations/20260304120000_create_recommendations.sql` | 110 | 新規 |
| `src/lib/recommendations/api.ts` | 46 | 新規 |
| `src/lib/recommendations/query-keys.ts` | 3 | 新規 |
| `src/lib/recommendations/index.ts` | 2 | 新規 |
| `src/hooks/use-recommendation-mutations.ts` | 42 | 新規 |
| `src/app/(main)/recommend/[id]/page.tsx` | 200 | 変更 |
| `src/types/database.ts` | +64 | 変更（再生成+エイリアス） |

## Codex の指摘（4件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| C-1 | api.ts:37 | 一括 insert で1件でも RLS 違反なら全件失敗 | Promise.allSettled で部分成功 | 中 |
| C-2 | page.tsx:74 | 送信失敗時のエラーハンドリングなし | onError でトースト/メッセージ表示 | 中 |
| C-3 | migration:61 | activity_log 追加ポリシーが recipient_id のみで広すぎる | action_type='recommend' を追加 | 中 |
| C-4 | database.ts:214 | content_type が string 型 | 型を 'movie'\|'tv' に制約 | 低 |

## Claude の指摘（1件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| A-1 | page.tsx | parsed=null 時に即エラーでなくロード→エラー遷移 | 早期 return | 低 |

## 議論サマリー

### 合意点（初回で一致、即採用）

- C-2: 送信失敗時のエラーハンドリング（両者とも必要と判断）

### ラリーの記録

#### C-1: 一括 insert の部分失敗

- **R1 Codex**: Promise.allSettled で部分送信を提案
- **R1 Claude**: all-or-nothing がトランザクション的に正しい。フォロー中ユーザーのみ表示されるため RLS 違反はレースコンディション限定。部分成功の UI コストが高い
- **R2 Codex**: 【撤回】insert は原子的で現設計は妥当
- **結論**: 却下（Codex 撤回。all-or-nothing が正しい設計）

#### C-3: activity_log ポリシー範囲

- **R1 Codex**: recipient_id のみで将来他の action_type が漏れるリスク
- **R1 Claude**: 現在 recipient_id!=null は recommend のみ。null レコードはマッチしない。将来拡張時に見直すべきでは？
- **R2 Codex**: 【修正】実害指摘は過大だが action_type 追加は低コスト予防策として有効
- **結論**: 採用（低コストの defensive coding として合理的）

#### C-4: database.ts の string 型

- **R1 Codex**: content_type を 'movie'\|'tv' に型制約すべき
- **R1 Claude**: 自動生成ファイルのため手動修正は再生成で上書きされる
- **R2 Codex**: 【修正】直接修正は不適切。DB enum 化 or アプリ層型で対応すべき
- **結論**: 却下（自動生成ファイル。アプリ層では api.ts の normalizeContentType で対応済み）

#### A-1: parsed=null の UX

- **結論**: 却下（content=null → エラー画面は既に動作。parsed=null は tmdbId=null → useContentDetail 無効 → content=null → エラー表示）

### 議論を経て採用

| 指摘 | 最終ラウンド | ラリー概要 | 結論 |
|------|:-----------:|-----------|------|
| C-2 | R1 | 即合意 | 採用: onError + sendError state で送信失敗メッセージ表示 |
| C-3 | R2 | 実害は限定的だが低コスト予防策 | 採用: action_type='recommend' をポリシーに追加 |

### 議論を経て却下

| 指摘 | 最終ラウンド | 却下理由 |
|------|:-----------:|---------|
| C-1 | R2 | 設計方針（all-or-nothing が正しい）。Codex も撤回 |
| C-4 | R2 | 自動生成ファイルの手動修正は再生成で消える |
| A-1 | R1 | 既存のエラーハンドリングフローで対応済み |

## 実施した改善

| # | ファイル | 改善内容 | 出典 |
|---|---------|---------|------|
| 1 | `src/app/(main)/recommend/[id]/page.tsx` | 送信失敗時のエラーメッセージ表示（sendError state + onError） | C-2 |
| 2 | `supabase/migrations/20260304120001_fix_activity_log_recipient_policy.sql` | ポリシーに action_type='recommend' 条件追加 | C-3 |

## 検証結果

- lint/format: PASS
- ビルド: PASS
- テスト: PASS（40ファイル, 321テスト全パス）

## 所見

Phase 5 の実装品質は良好。Codex の指摘4件中2件を採用し、エラーハンドリングとポリシー範囲の防御的改善を実施。一括 insert の部分失敗対応は設計判断として正しく却下された。
