# Codex Debate レビューレポート

> **日時**: 2026-03-03
> **対象**: Phase 4 通知機能 実装計画書
> **モード**: 計画書レビュー
> **ラウンド数**: 2/5
> **採用指摘数**: 4 / 全6件

## 対象ファイル

| ファイル | 種別 |
|----------|------|
| `.claude/plans/golden-dreaming-whistle.md` | 計画書 |

## Codex の指摘（6件）

| # | セクション | 問題 | 改善案 | 優先度 |
|---|-----------|------|--------|--------|
| C-1 | Batch 1 | UPDATE ポリシーの WITH CHECK 句が不明確 | USING + WITH CHECK を明示 | 高 |
| C-2 | Batch 1 | SECURITY DEFINER の set search_path = '' が未記載 | トリガー関数に明記 | 高 |
| C-3 | Context | type に expiring/recommendation 含むが INSERT は follow のみ → 矛盾 | スコープ明示化 | 高 |
| C-4 | Batch 1 | target_id text 単一カラムで型安全性不足 | 型別カラム分離 | 中 |
| C-5 | Batch 3-4 | markAsRead の非同期で unreadCount 負数化 | Math.max(0, n-1) | 中 |
| C-6 | 検証手順 | RLS・トリガーの検証が不足 | RLS スモークテスト追加 | 中 |

## Claude の指摘（5件）

| # | セクション | 問題 | 改善案 | 優先度 |
|---|-----------|------|--------|--------|
| A-1 | Batch 1 | SECURITY DEFINER set search_path = '' (=C-2) | トリガー関数に明記 | 高 |
| A-2 | Batch 1 | UPDATE WITH CHECK (=C-1) | 既存パターンに合わせる | 中 |
| A-3 | Context | Phase 4 スコープ明示 | Context に追記 | 低 |
| A-4 | Batch 3 | unreadCount 負数防止 (=C-5) | Math.max(0, n-1) | 中 |
| A-5 | 検証手順 | RLS スモークテスト (=C-6) | Batch 1 に追加 | 中 |

## 議論サマリー

### 合意点（初回で一致、即採用）

- C-1/A-2: UPDATE ポリシーに `WITH CHECK` を明示
- C-2/A-1: `security definer set search_path = ''` を計画書に明記
- C-5/A-4: unreadCount 楽観的更新に `Math.max(0, n-1)` ガード
- C-6/A-5: Batch 1 に RLS スモークテスト追加

### ラリーの記録

#### C-3: expiring/recommendation 生成経路の矛盾
- **R1 Codex**: type に3種含むが INSERT 経路は follow のみ → 要件矛盾
- **R1 Claude**: PROGRESS.md に Phase 5 で追加と明記済み。CHECK constraint の先行定義は expand/contract パターン。スコープ明示で十分。
- **R2 Codex**: 【修正】設計矛盾とまでは言えない。スコープ明記 + 検証を follow に限定すべき。
- **結論**: 修正して採用。Context に「Phase 4 では follow のみ生成」を明記。

#### C-4: target_id text カラム分離
- **R1 Codex**: target_id text では型安全/参照整合性を担保できない → カラム分離提案
- **R1 Claude**: 3種のみ、ドメイン型と一致、nullable カラム増加は over-engineering。
- **R2 Codex**: 【修正】カラム分離は強すぎた。type ごとの target_id バリデーション (CHECK/アプリ層) を代替提案。
- **R2 Claude**: 却下。INSERT はすべて SECURITY DEFINER トリガー経由。トリガー関数内で target_id フォーマットが保証されるため追加バリデーション不要。
- **結論**: 却下（トリガーが整合性を保証）

### 議論を経て採用

| 指摘 | 最終ラウンド | ラリー概要 | 結論 |
|------|:-----------:|-----------|------|
| C-3 | R2 | Codex: 矛盾 → Claude: expand/contract → Codex: 修正 | スコープ明記で採用 |

### 議論を経て却下

| 指摘 | 最終ラウンド | 却下理由 |
|------|:-----------:|---------|
| C-4 | R2 | トリガーが整合性保証、over-engineering |

## 実施した改善

| # | ファイル | 改善内容 | 出典 |
|---|---------|---------|------|
| 1 | 計画書 Context | Phase 4 スコープ明示 (follow のみ) | C-3 修正 |
| 2 | 計画書 Batch 1 | RLS WITH CHECK 明示 + SECURITY DEFINER search_path 明記 | C-1, C-2 |
| 3 | 計画書 Batch 3 | Math.max(0, n-1) ガード追記 | C-5 |
| 4 | 計画書 検証手順 | RLS スモークテスト + トリガー発火確認 追加 | C-6 |

## 検証結果

- 計画書修正: PASS (4箇所更新、フォーマット整合確認済み)

## 所見

計画書の品質は全体的に高く、既存パターン (DI + React Query) の踏襲が適切。主な改善は RLS ポリシーの記述精度向上とスコープ明示化。Codex の target_id 分離提案はトリガー経由 INSERT のみの設計では不要と判断。
