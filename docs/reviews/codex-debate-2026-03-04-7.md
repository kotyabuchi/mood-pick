# Codex Debate レビューレポート

> **日時**: 2026-03-04
> **対象**: Phase 6 Batch 2 — RLS スモークテスト SQL
> **ラウンド数**: 1/5
> **採用指摘数**: 4 / 全6件

## 対象ファイル

| ファイル | 行数 | 種別 |
|----------|------|------|
| `docs/reviews/phase6-rls-smoke-test.md` | 606 | 新規 |
| `PROGRESS.md` | 8 | 更新 |

## Codex の指摘（6件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| C-1 | phase6-rls-smoke-test.md:139 | `watchlist_items` で `content_type` 列を使っているが正しくは `type` | `content_type` → `type` に修正 | 高 |
| C-2 | phase6-rls-smoke-test.md:377 | `recommendations` INSERT に必須列 `poster_url` が不足 | `poster_url` を追加 | 高 |
| C-3 | phase6-rls-smoke-test.md:39 | profiles 直接 INSERT は auth.users FK 制約で失敗 | auth.users 作成を必須化 | 高 |
| C-4 | phase6-rls-smoke-test.md:274 | notifications/activity_log INSERT の必須列不足 | `target_id`, `poster_url` を追加 | 中 |
| C-5 | phase6-rls-smoke-test.md:448 | storage.objects テストがポリシー確認のみ | Storage API テスト追加 | 中 |
| C-6 | PROGRESS.md:121 | テスト未実行なのに完了扱い | 表現修正 | 低 |

## Claude の指摘（0件）

Codex と同一の問題を独立して認識（C-1, C-2, C-3, C-4 相当）。

## 議論サマリー

### 合意点（初回で一致、即採用）

- **C-1**: `watchlist_items` の `content_type` → `type` 修正（マイグレーションで `type` カラムと確認済み）
- **C-2**: `recommendations` INSERT に `poster_url` NOT NULL 列を追加
- **C-3**: profiles 直接 INSERT 手順を削除し、auth.users からのユーザー作成を必須化
- **C-4**: notifications の `target_id`、activity_log の `poster_url` 追加

### 議論を経て却下

| 指摘 | 最終ラウンド | 却下理由 |
|------|:-----------:|---------|
| C-5 | R1 | テスト SQL ドキュメント内で storage.objects は SQL Editor テスト困難と明記済み。手動テスト項目を既に列挙しており、追加は不要 |
| C-6 | R1 | PROGRESS.md の「テスト SQL 作成」注記で状況は明確。テスト SQL 作成自体がタスクの成果物 |

## 実施した改善

| # | ファイル | 改善内容 | 出典 |
|---|---------|---------|------|
| 1 | phase6-rls-smoke-test.md | `content_type` → `type` (watchlist_items 全箇所) | C-1 |
| 2 | phase6-rls-smoke-test.md | recommendations INSERT に `poster_url` 追加 (4箇所) | C-2 |
| 3 | phase6-rls-smoke-test.md | profiles 直接 INSERT を削除、Dashboard 経由の手順に変更 | C-3 |
| 4 | phase6-rls-smoke-test.md | notifications INSERT に `target_id`、activity_log INSERT に `poster_url` 追加 | C-4 |

## 検証結果

- lint/format: PASS
- ビルド: PASS
- テスト: PASS (39 files, 296 tests)

## 所見

RLS テスト SQL の列名・必須列の不整合を Codex が正確に検出した。特に `watchlist_items` の `type` vs `content_type` は実行時にしか発覚しないエラーであり、事前に修正できたのは有益。
