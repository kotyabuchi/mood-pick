# Codex Debate レビューレポート

> **日時**: 2026-03-04
> **対象**: Phase 5 おすすめ送信 実装計画書
> **モード**: 計画書レビュー
> **ラウンド数**: 2/5
> **採用指摘数**: 4 / 全6件

## Codex の指摘（5件）

| # | セクション | 問題 | 改善案 | 優先度 |
|---|-----------|------|--------|--------|
| C-1 | Batch 1: RLS | INSERT が `from_user_id` のみで `to_user_id` 無制約。通知スパム可能 | follows EXISTS + self-send 禁止 | 高 |
| C-2 | Batch 1: content_type | `anime` が入ると通知遷移先で表示崩壊 | `('movie','tv')` に制限 + API 層正規化 | 高 |
| C-3 | Batch 1: SECURITY DEFINER | `set search_path=''` が計画書に明記なし | 明記 + `public.` 完全修飾 | 中 |
| C-4 | Batch 5: テスト | DB トリガー/RLS テストがない | Supabase 統合テスト追加 | 中 |
| C-5 | Batch 分割 | DB変更後の検証ゲートがない | smoke test 挿入 | 中 |

## Claude の指摘（1件）

| # | セクション | 問題 | 改善案 | 優先度 |
|---|-----------|------|--------|--------|
| A-1 | Batch 4: ページ | `useContentDetail` に `anime` を渡すと `movie` 扱い | ページ内パーサーで anime → tv 変換を明確化 | 中 |

## 議論サマリー

### 合意点（初回で一致、即採用）
- C-1: follows EXISTS チェック + `no_self_recommend` CHECK 制約
- C-3: `security definer set search_path = ''` を計画書に明記

### ラリーの記録

#### C-2: content_type anime 問題
- **R1 Codex**: content_type に anime が入ると通知遷移で表示崩壊
- **R1 Claude**: 部分同意。ページ内パーサーで anime→tv 変換は計画済み。DB CHECK だけで十分では？
- **R2 Codex**: 【修正】DB CHECK は必須だが単独だと DB エラーで UX 悪化。API 層でも正規化すべき
- **R2 Claude**: 納得。DB CHECK + API 層の二重防御を採用
- **結論**: 修正して採用

#### C-4: Supabase 統合テスト
- **R1 Codex**: 統合テスト追加を提案
- **R1 Claude**: 却下候補。Phase 1-4 で統合テストなし、手動 psql RLS スモークが既存ルール
- **R2 Codex**: 【修正】撤回で問題なし。ただし手動スモークの観点・SQL例を計画に明記すべき
- **結論**: 統合テスト却下、手動スモーク観点を計画書に明記

#### C-5: DB smoke test の位置
- **R1 Codex**: 独立 Batch として smoke test を挿入
- **R1 Claude**: Batch 1 の完了条件に含めれば十分
- **R2 Codex**: 【修正】独立 Batch 不要、Batch 1 完了条件に明記で十分
- **結論**: 修正して採用

### 議論を経て採用
| 指摘 | 最終ラウンド | 概要 | 結論 |
|------|:-----------:|------|------|
| C-2 | R2 | DB CHECK + API 層二重防御 | 修正して採用 |
| C-5 | R2 | Batch 1 完了条件にスモークテスト明記 | 修正して採用 |

### 議論を経て却下
| 指摘 | 最終ラウンド | 却下理由 |
|------|:-----------:|---------|
| C-4 | R2 | 既存プロジェクトルール（手動 psql RLS スモーク）に従う。統合テストは Phase 5 スコープ外 |

## 実施した改善

| # | ファイル | 改善内容 | 出典 |
|---|---------|---------|------|
| 1 | 計画書 Batch 1 | `content_type` CHECK 制約を `('movie','tv')` に限定 | C-2 |
| 2 | 計画書 Batch 1 | `no_self_recommend` CHECK 制約追加 | C-1 |
| 3 | 計画書 Batch 1 | INSERT RLS に follows EXISTS チェック追加 | C-1 |
| 4 | 計画書 Batch 1 | トリガー説明に `set search_path = ''` 明記 | C-3 |
| 5 | 計画書 Batch 1 | 完了条件に RLS スモークテスト観点を追加 | C-5 |
| 6 | 計画書 Batch 2 | API 層で anime → tv 正規化を明記 | C-2 |
| 7 | 計画書 Batch 4 | ページ内パーサーの anime → tv 変換を明確化 | A-1 |

## 検証結果

- 計画書修正: PASS（全改善項目を反映済み）

## 所見

Codex の指摘は全体的に的確で、特に C-1（RLS セキュリティ）と C-2（content_type 正規化）は計画書の重要な見落としだった。C-4 の統合テスト提案は理想的だが、プロジェクトの既存テスト方針を尊重し却下。代わりに手動スモークテストの観点を計画書に明記することで再現可能性を確保。
