# Codex Debate レビューレポート

> **日時**: 2026-03-04
> **対象**: Phase 4 通知機能（差分モード）
> **ラウンド数**: 2/5
> **採用指摘数**: 1 / 全4件

## 対象ファイル

| ファイル | 種別 |
|----------|------|
| `supabase/migrations/20260303143131_create_notifications.sql` | 新規 |
| `src/lib/notifications/api.ts` | 新規 |
| `src/lib/notifications/mappers.ts` | 新規 |
| `src/lib/notifications/query-keys.ts` | 新規 |
| `src/hooks/use-notifications.ts` | 新規 |
| `src/hooks/use-notification-mutations.ts` | 新規 |
| `src/components/ui/notification-badge.tsx` | 新規 |
| `src/components/ui/screen-header.tsx` | 変更 |
| `src/app/(main)/notifications/page.tsx` | 変更 |
| `src/app/(main)/page.tsx` | 変更 |

## Codex の指摘（4件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| C-1 | query-keys.ts:2 | クエリキーがユーザーID非依存 | userId をキーに含める | 高 |
| C-2 | notifications/page.tsx:37 | groupByDate で1週間超の通知が非表示 | older セクション追加 | 中 |
| C-3 | migration:39 | UPDATE ポリシーに列制限なし | GRANT UPDATE (is_read) のみ | 中 |
| C-4 | screen-header.tsx:47 | rightAction でテキストが w-10 に収まらない | 可変幅へ変更 | 低 |

## Claude の指摘（1件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| A-1 | notifications/page.tsx | C-2 と同一 | — | 中 |

## 議論サマリー

### 合意点（初回で一致、即採用）
- C-2: groupByDate で1週間超の通知が除外される問題

### ラリーの記録

#### C-1: クエリキーにユーザーID不在
- **R1 Codex**: アカウント切替時に前ユーザーのキャッシュが一時表示されるリスク
- **R1 Claude**: watchlistKeys/feedKeys/followKeys も同パターン。Phase 4 のみ変更は不整合
- **R2 Codex**: 【修正】横断課題として別タスク化が妥当
- **結論**: 却下（プロジェクト全体パターン、スコープ外）

#### C-3: UPDATE ポリシーの列制限なし
- **R1 Codex**: PostgREST 経由で任意カラム UPDATE 可能
- **R1 Claude**: activity_log も同様。既存パターンとの整合性は？
- **R2 Codex**: 【修正】後続セキュリティ強化バッチで対応が妥当
- **結論**: 却下（後続対応、Phase 4 スコープ外）

#### C-4: w-10 の幅問題
- **R1 Codex**: テキストアクションが w-10 に収まらずレイアウト崩れ
- **R1 Claude**: flex + justify-end で右寄せ。実害はあるか？
- **R2 Codex**: 【撤回】主要ブレイクポイントで実害確認しにくい
- **結論**: 撤回

### 議論を経て採用
| 指摘 | 最終ラウンド | 概要 | 結論 |
|------|:-----------:|------|------|
| C-2 | R1 | 両者合意 | 採用 |

### 議論を経て却下
| 指摘 | 最終ラウンド | 却下理由 |
|------|:-----------:|---------|
| C-1 | R2 | プロジェクト全体パターン、スコープ外 |
| C-3 | R2 | 後続セキュリティ強化バッチで対応 |
| C-4 | R2 | 撤回（実害なし） |

## 実施した改善

| # | ファイル | 改善内容 | 出典 |
|---|---------|---------|------|
| 1 | `src/lib/utils.ts` | `groupByDate` に `older` カテゴリ追加 | C-2 |
| 2 | `src/app/(main)/notifications/page.tsx` | 「それ以前」セクション追加 | C-2 |
| 3 | `src/__tests__/lib/utils.test.ts` | `older` 分類テスト追加、空配列テスト更新 | C-2 |

## 検証結果

- lint/format: PASS
- テスト (utils + notifications-screen): PASS (39/39)

## 所見

Phase 4 の通知機能は全体的に高品質。既存パターン（DI, React Query, Optimistic Update）に忠実に実装されている。唯一の実質的な問題は `groupByDate` の older 通知の欠落で、即座に修正済み。セキュリティ関連の指摘（クエリキーのユーザーID、列制限）は全フェーズ共通課題として後続対応が妥当。
