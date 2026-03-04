# Codex Debate レビューレポート

> **日時**: 2026-03-03
> **対象**: Phase 2 プロフィール完全実装 計画書
> **モード**: 計画書レビュー
> **ラウンド数**: 2/5
> **採用指摘数**: 3 / 全6件

## 対象ファイル

| ファイル | 種別 |
|----------|------|
| `.claude/plans/glimmering-imagining-iverson.md` | 計画書 |

## Codex の指摘（6件）

| # | セクション | 問題 | 改善案 | 優先度 |
|---|-----------|------|--------|--------|
| C-1 | Batch 1: handle CHECK | CHECK 制約追加前に既存データの正規化が必要 | UPDATE ... SET handle = lower(trim(handle)) を先に実行 | 高 |
| C-2 | Batch 1: avatars policy | UPDATE policy に WITH CHECK がない。USING のみでは更新後の値が検証されない | WITH CHECK を追加 | 高 |
| C-3 | Batch 1: query-keys | profileKeys.own() に userId がない。ユーザー切替時にキャッシュが残り誤表示 | own(userId: string) に変更 | 高 |
| C-4 | Batch 1: fetchTimedWatchStats | new Date() がクライアントTZに依存。UTC固定の集計にならない | Supabase RPC でサーバー側集計 | 中 |
| C-5 | 全体: database.ts | supabase gen types 再生成で手動追記が消失するリスク | 型エイリアスを別ファイルに分離 | 中 |
| C-6 | 全体: Batch分割 | Batch 1 が大きすぎる（migration + API + テスト） | migration を独立 Batch に分離 | 中 |

## Claude の指摘（3件）

| # | セクション | 問題 | 改善案 | 優先度 |
|---|-----------|------|--------|--------|
| A-1 | Batch 1: handle CHECK | C-1 と同一 | C-1 と同一 | 高 |
| A-2 | Batch 1: avatars policy | C-2 と同一 | C-2 と同一 | 高 |
| A-3 | Batch 1: query-keys | C-3 と同一 | C-3 と同一 | 高 |

## 議論サマリー

### 合意点（初回で一致、即採用）
- C-1/A-1: handle CHECK 制約前に既存データの正規化が必要
- C-2/A-2: avatars UPDATE policy に WITH CHECK 追加
- C-3/A-3: profileKeys.own() に userId を含める

### ラリーの記録

#### C-4: fetchTimedWatchStats の TZ 依存
- **R1 Codex**: new Date() がクライアント TZ に依存。UTC 固定集計にならない（中）
- **R1 Claude**: toISOString() で UTC 変換済み。watched_at は timestamptz で UTC 格納。実害なし。TODO で対応
- **R2 Codex**: 【修正】境界はローカル月初を UTC 化した時刻。「ユーザーのローカル月で集計」が仕様なら成立。仕様明記不足に下げる（TODO 明記で可）
- **結論**: 却下（TODO コメントで将来の RPC 化を明記。現状の実装で仕様上問題なし）

#### C-5: database.ts 手動編集リスク
- **R1 Codex**: supabase gen types 再生成で手動追記が消失するリスク（中）
- **R1 Claude**: Phase 1 で確立済みパターン。CLAUDE.md に手順記載済み
- **R2 Codex**: 【撤回】プロジェクト規約として確立・明文化されているなら撤回
- **結論**: 却下（Codex も撤回。確立済みパターン）

#### C-6: Batch 分割の粒度
- **R1 Codex**: Batch 1 が大きすぎる。migration を独立 Batch に分離すべき（中）
- **R1 Claude**: Phase 1 も同規模で 3 Batch 構成。問題なく機能した分割方針を踏襲
- **R2 Codex**: 【修正】3 Batch 構成は妥当。Phase 1 実績があるなら分割指摘は強すぎた。Batch 1 完了条件の明示のみ
- **結論**: 却下（Codex も分割方針は問題なしと認めた）

### 議論を経て採用
| 指摘 | 最終ラウンド | Codex → Claude のラリー概要 | 結論 |
|------|:-----------:|---------------------------|------|
| (なし — 合意指摘のみ) | | | |

### 議論を経て却下
| 指摘 | 最終ラウンド | 却下理由 |
|------|:-----------:|---------|
| C-4 | R2 | toISOString() で UTC 変換済み。Codex も仕様明記不足に下方修正。TODO で対応 |
| C-5 | R2 | Phase 1 確立済みパターン。Codex も撤回 |
| C-6 | R2 | Phase 1 同規模で成功した分割方針。Codex も妥当と認めた |

## 実施した改善（計画書への反映）

| # | セクション | 改善内容 | 出典 |
|---|-----------|---------|------|
| 1 | Batch 1: handle CHECK migration | `UPDATE ... SET handle = lower(trim(handle))` を CHECK 追加前に実行 | C-1 |
| 2 | Batch 1: avatars migration | UPDATE policy に `WITH CHECK` を追加 | C-2 |
| 3 | Batch 1: query-keys | `profileKeys.own(userId: string)` に変更 | C-3 |
| 4 | Batch 2: use-profile.ts | `profileKeys.own(user.id)` で queryKey を構築 | C-3 |
| 5 | Batch 3: use-profile-mutations.ts | `onSuccess` で `profileKeys.own(user.id)` をキャッシュ更新 | C-3 |

## 検証結果

- 計画書レビューのため、コードの検証は実装フェーズで実施

## 所見

計画書の品質は良好。主要な問題は3点（C-1〜C-3）で、いずれもセキュリティ・データ整合性に関わる重要な指摘。
C-4〜C-6 はプロジェクトの既存パターン・仕様を踏まえると実害がなく、Codex もラウンド2 で修正・撤回した。
