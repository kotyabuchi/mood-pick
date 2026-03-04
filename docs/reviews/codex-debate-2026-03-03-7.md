# Codex Debate レビューレポート

> **日時**: 2026-03-03
> **対象**: Phase 3 フィード (アクティビティ) 実装計画書
> **モード**: 計画書レビュー
> **ラウンド数**: 2/5
> **採用指摘数**: 5 / 全10件

## 対象ファイル

| ファイル | 種別 |
|----------|------|
| `.claude/plans/floating-chasing-babbage.md` | 計画書 |

## Codex の指摘（6件）

| # | セクション | 問題 | 改善案 | 優先度 |
|---|-----------|------|--------|--------|
| C-1 | RLS | recommend/recipient_id を考慮しないポリシー | action_type 別ポリシーに分離 | 高 |
| C-2 | DB | recommend を CHECK に含むがトリガーで生成不可の矛盾 | RPC を追加 or recommend をスキーマから外す | 高 |
| C-3 | 非正規化 | Content(full) をダミー値で埋める前提は破綻しやすい | ContentPreview 型を切り出す | 中 |
| C-4 | 移行 | 既存データのバックフィル計画がない | one-off migration SQL を追加 | 中 |
| C-5 | テスト | DB トリガー/RLS の統合テストがない | DB統合テストを追加 | 中 |
| C-6 | Quality Checks | 非決定的ステップが混在 | /codex-debate を任意に | 低 |

## Claude の指摘（4件）

| # | セクション | 問題 | 改善案 | 優先度 |
|---|-----------|------|--------|--------|
| A-1 | DB | DOWN マイグレーション（ロールバックSQL）が未記載 | PROGRESS.md ルールに従い追記 | 高 |
| A-2 | 移行 | 既存データのバックフィルが未考慮 | バックフィル INSERT を追加 | 中 |
| A-3 | page.tsx | AddToWatchlistDialog に渡す Content のダミー値問題 | tmdbId で TMDb API から再取得 | 中 |
| A-4 | Batch 分割 | Batch 2（型エイリアス1行）が薄すぎる | Batch 3 に統合 | 低 |

## 議論サマリー

### 合意点（初回で一致、即採用）

- A-2 / C-4: 既存 watchlist_items からのバックフィル SQL が必要

### ラリーの記録

#### C-1/C-2: recommend の RLS / INSERT 設計矛盾
- **R1 Codex**: recommend 対応の RLS/RPC が必要（高）
- **R1 Claude**: recommend は Phase 5 スコープ。Phase 3 では未使用。トリガーは watchlist の status を使うため recommend は構造的に生成不可
- **R2 Codex**: 【修正】Phase 5 で妥当。Phase 3 では明文化のみ。誤挿入防止ガード推奨
- **R2 Claude**: 誤挿入防止ガードは不要（watchlist に recommend status は存在しない）。明文化のみ採用
- **結論**: 採用（部分的）— 計画書に Phase 5 デファーを明記

#### C-3: Content ダミー値の破綻リスク
- **R1 Codex**: ContentPreview 型を切り出すべき（中）
- **R1 Claude**: FeedCard は 6 フィールドのみ使用。ContentPreview は FeedItem 型変更 + FeedCard 型変更を伴い過剰設計
- **R2 Codex**: 【修正】ダミー値アプローチは現実的。mapper に TODO コメントを推奨
- **結論**: 修正して採用 — mapper に TODO コメント追記

#### C-5: DB 統合テスト
- **R1 Codex**: DB 統合テストを追加すべき（中）
- **R1 Claude**: ローカル DB 環境がない。モックベーステストが現実的
- **R2 Codex**: 【修正】RLS スモーク手順を SQL 化して実行記録を残す運用を推奨
- **結論**: 修正して採用 — RLS スモーク手順を Batch 1 に追加

#### C-6: Quality Checks の非決定性
- **R1 Codex**: /codex-debate を任意扱いに（低）
- **R1 Claude**: CLAUDE.md で必須と規定済み
- **R2 Codex**: 【撤回】プロジェクト規約が優先
- **結論**: 却下 — プロジェクト規約に矛盾

### 議論を経て採用

| 指摘 | 最終ラウンド | ラリー概要 | 結論 |
|------|:-----------:|-----------|------|
| C-1/C-2 | R2 | Phase 5 デファーに修正 | 明文化のみ採用 |
| C-3 | R2 | ContentPreview → TODO コメント | 修正して採用 |
| C-4 / A-2 | R1 | 初回合意 | 即採用 |
| C-5 | R2 | 統合テスト → スモーク手順 | 修正して採用 |
| A-1 | - | Claude のみ | 採用 |
| A-3 | - | Claude のみ | 採用 |

### 議論を経て却下

| 指摘 | 最終ラウンド | 却下理由 |
|------|:-----------:|---------|
| C-6 | R2 | プロジェクト規約 (CLAUDE.md) で /codex-debate は必須と規定 |
| A-4 | - | 些末（Batch 統合は実施済みだが本質的でない） |

## 実施した改善

| # | セクション | 改善内容 | 出典 |
|---|-----------|---------|------|
| 1 | Batch 1 SQL | DOWN マイグレーション（ロールバック SQL）をコメントで追記 | A-1 |
| 2 | Batch 1 SQL | 既存 watchlist_items からのバックフィル INSERT を追加 | A-2/C-4 |
| 3 | Batch 1 | RLS スモークテスト手順を適用手順に追加 | C-5 |
| 4 | 設計判断 | recommend は Phase 5 デファーの旨を明記 | C-1/C-2 |
| 5 | Batch 2 mappers | TODO コメント追記の指示を追加 | C-3 |
| 6 | Batch 3 page.tsx | AddToWatchlistDialog の Content データ品質問題の注意事項追加 | A-3 |
| 7 | Batch 分割 | 旧 Batch 2（型エイリアスのみ）を Batch 2 に統合し、全体を 5 Batch に整理 | A-4 |

## 検証結果

- 計画書のフォーマット: PASS（Batch 番号連番、ファイル一覧整合）
- DOWN マイグレーション: PASS（ロールバック SQL 記載あり）
- バックフィル: PASS（WHERE status IN ('want','watching','watched') で dropped 除外）

## 所見

計画書は全体的に良い設計。主要な改善点は (1) DOWN マイグレーションの追記、(2) 既存データのバックフィル、(3) recommend の Phase 5 デファー明文化の3点。Codex は recommend の RLS 設計矛盾を鋭く指摘したが、Phase 分割のコンテキストを考慮すると Phase 3 では不要。Content ダミー値問題は TODO コメントで対応し、Phase 5 以降の拡張時に再検討すべき。
