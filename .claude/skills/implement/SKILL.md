---
name: implement
description: >
  CLAUDE.mdのフローに沿って指示された機能を実装する。ヒアリング→調査→プラン作成→codex-debateレビュー→
  ユーザー承認→Batch実装（各Batchでquality checks）→最終レビューの一連のワークフローを管理する。
  「実装して」「implementして」「この機能を作って」「implement」で起動。
argument-hint: "[機能の説明]"
---

# Implement — 機能実装ワークフロー

## Purpose

CLAUDE.mdとquality-checks.mdのフローに沿い、ヒアリングからレビュー完了までの機能実装ライフサイクルを一貫して管理する。

## When to Use

- ユーザーから機能実装を依頼されたとき
- 「実装して」「implementして」「この機能を作って」と言われたとき
- 複数ファイルにまたがる実装タスク

## Workflow

以下の7フェーズを順に実行する。各フェーズの完了を明示的にユーザーに報告すること。

---

### Phase 1: ヒアリング

ユーザーの指示が曖昧な場合、以下を確認する（明確なら省略可）:

- **何を作るか**: 機能の概要・ゴール
- **どこに作るか**: 影響するルート・コンポーネント
- **制約**: 既存パターンとの整合性、UI用語（CLAUDE.md参照）
- **優先度**: 必須要件 vs あれば嬉しい要件

引数 `$ARGUMENTS` が十分に具体的なら、確認を最小限にして Phase 2 へ進む。

---

### Phase 2: 調査

実装に必要な既存コードを調査する:

1. **関連ファイルの特定**: Glob/Grep で影響範囲を把握
2. **既存パターンの確認**: 類似機能がどう実装されているか確認
3. **型定義の確認**: `src/types/` の既存型、Supabase生成型を確認
4. **依存関係の確認**: 変更が他のコンポーネントに与える影響

調査結果をユーザーに簡潔に報告する。

---

### Phase 3: プラン作成

EnterPlanMode で実装計画を作成する。計画には以下を含めること:

#### 3.1 実装概要
- 目的と成果物
- 技術的アプローチ

#### 3.2 Batch分割
実装を論理的なBatchに分割する。各Batchは:
- **独立してテスト可能** な単位
- **1つの責務** に集中
- ビルドが通る状態で完了

#### 3.3 各Batchの内容
各Batchごとに:
- 変更対象ファイル一覧
- 実装内容の説明
- **Quality Checks** (以下を必ず記載):

```
### Batch N 完了時チェック
1. `pnpm check` — Biome lint + format
2. `npx react-doctor --diff main --verbose` — React ベストプラクティス検証
3. `/codex-debate` — Codex CLI とのクロスレビュー
4. `pnpm build` — TypeScript 型チェック + ビルド
5. `pnpm test` — 全テスト実行
```

#### 3.4 最終レビュー
全Batch完了後に `/codex-debate --diff` で全体レビューを行う旨を記載。

---

### Phase 4: 計画書レビュー

**ExitPlanMode する前に**、`/codex-debate --plan` で計画書をクロスレビューする。

- Codex から指摘があれば計画を修正
- 修正後、再度 `/codex-debate --plan` で確認（指摘がなくなるまで）
- レビュー通過後に ExitPlanMode でユーザー承認を求める

---

### Phase 5: Batch実装

ユーザー承認後、プランに従い各Batchを実装する。

#### 各Batch内の手順:

1. **実装**: コードを書く
   - CLAUDE.md のパターンに従う（Auth Flow、Data Fetching、型導出等）
   - `react-form-patterns.md` の `useTransition + useOptimistic` パターンを遵守
   - `typescript-rules.md` の厳格な型ルールを遵守

2. **Quality Checks** (各Batch完了時に必ず実行、スキップ禁止):

   | 順序 | コマンド | 目的 |
   |------|---------|------|
   | 1 | `pnpm check` | Biome lint + format |
   | 2 | `npx react-doctor --diff main --verbose` | React ベストプラクティス検証 |
   | 3 | `/codex-debate` | Codex CLI とのクロスレビュー |
   | 4 | `pnpm build` | TypeScript 型チェック + ビルド |
   | 5 | `pnpm test` | 全テスト実行 |

3. **修正**: ステップ3（codex-debate）で指摘があれば修正してから次のBatchへ

4. **報告**: Batch完了をユーザーに報告（変更内容 + レビュー結果の要約）

---

### Phase 6: 最終レビュー

全Batch完了後:

1. `/codex-debate --diff` で全変更を一括レビュー
2. 指摘があれば修正
3. 最終 `pnpm build` + `pnpm test` で品質確認

---

### Phase 7: 完了報告

以下をユーザーに報告:

- 実装した機能の概要
- 変更ファイル一覧
- レビュー結果のサマリー
- 残課題があれば記載

---

## Rules

- **Quality Checks は絶対にスキップしない**。各Batch完了時に必ず全5ステップを実行
- **codex-debate の指摘は必ず対応** してから次へ進む
- **CLAUDE.md のパターンを遵守**: 型導出、Auth Flow、Data Fetching 等
- **UI用語ルール**: 見たい/視聴中/見た、「見たいに追加」等（CLAUDE.md参照）
- **レポートは `docs/reviews/` に出力** される（codex-debate が自動管理）
- Batch 間でビルドが壊れた状態を放置しない

## Error Handling

- `pnpm check` 失敗 → 自動修正を試み、修正できない場合はユーザーに報告
- `pnpm build` 失敗 → 型エラーを修正してから続行
- `pnpm test` 失敗 → テストを修正してから続行
- `/codex-debate` で重大な指摘 → 修正後に再レビュー
- 実装中に設計の見直しが必要な場合 → ユーザーに相談してプランを修正
