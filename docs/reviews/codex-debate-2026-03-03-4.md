# Codex Debate レビューレポート

> **日時**: 2026-03-03
> **対象**: Phase 1 フォロー機能 実装コード
> **ラウンド数**: 2/5
> **採用指摘数**: 2 / 全4件

## 対象ファイル

| ファイル | 行数 | 種別 |
|----------|------|------|
| `src/lib/follows/api.ts` | 122 | 新規 |
| `src/lib/follows/mappers.ts` | 33 | 新規 |
| `src/lib/follows/query-keys.ts` | 10 | 新規 |
| `src/lib/follows/index.ts` | 3 | 新規 |
| `src/hooks/use-follows.ts` | 57 | 新規 |
| `src/hooks/use-follow-mutations.ts` | 102 | 新規 |
| `src/hooks/use-user-profile.ts` | 35 | 新規 |
| `src/app/(main)/follows/page.tsx` | 85 | 変更 |
| `src/app/(main)/user/[id]/page.tsx` | 98 | 変更 |
| `src/app/(main)/profile/page.tsx` | 107 | 変更 |
| `src/__tests__/lib/follows-api.test.ts` | 200+ | 新規 |
| `src/__tests__/hooks/use-follows.test.tsx` | 130+ | 新規 |
| `src/__tests__/screens/follows-screen.test.tsx` | 140+ | 変更 |
| `src/types/database.ts` | 337 | 変更 |

## Codex の指摘（4件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| C-1 | api.ts:25 | fetchFollowers が isFollowing を埋めない | viewerID で別クエリし isFollowing を解決 | 高 |
| C-2 | api.ts:17 | `as unknown as ProfileRow` で profiles null 時クラッシュ | null チェック + filter | 高 |
| C-3 | use-user-profile.ts:37 | enabled 条件で認証初期化中に Not Found 表示 | enabled を !!userId ベースに変更 | 中 |
| C-4 | profile/page.tsx:15 | mockCurrentUser 固定使用 | useAuth() の実ユーザーID使用 | 高 |

## Claude の指摘（4件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| A-1 | api.ts:17,31 | as unknown as ProfileRow + null チェック欠如 | null filter 追加 | 高 |
| A-2 | api.ts:30-32 | fetchFollowers で isFollowing が undefined | viewerId パラメータ追加 | 高 |
| A-3 | profile/page.tsx | mockCurrentUser は Phase 2 スコープ | 計画通り Phase 2 で対応 | 却下 |
| A-4 | use-follow-mutations.ts:64 | 楽観的更新で followingCount のみ | 自分の followingCount のみで正しい | 問題なし |

## 議論サマリー

### 合意点（初回で一致、即採用）
- C-1/A-2: fetchFollowers で isFollowing が未設定 → フォロワータブでトグルが常に「フォローする」表示になるバグ
- C-2/A-1: profiles の null チェック欠如 → RLS/参照欠損時にランタイムクラッシュの可能性

### ラリーの記録

#### C-3: useUserProfile の enabled 条件
- **R1 Codex**: enabled: !!user && !!userId で認証初期化中にクエリ未実行、即 Not Found 表示（中）
- **R1 Claude**: middleware で認証済み保証。実害は極めて低い。根拠を確認したい
- **R2 Codex**: 【修正】middleware 前提を踏まえ中→低に修正。クライアント認証コンテキスト初期化の一時的未確定は残る
- **R2 Claude**: React Query v5 では enabled=false の間は isPending=true でスピナー表示。実害なし
- **結論**: 却下（middleware + React Query の挙動で実害なし）

#### C-4: mockCurrentUser 固定使用
- **R1 Codex**: 実ユーザーと無関係なプロフィール表示（高）
- **R1 Claude**: 計画書で Phase 2 スコープと明記。thisMonth/thisYear の実装が先に必要
- **R2 Codex**: 【撤回】Phase 2 で対応が妥当
- **結論**: 却下（Phase 2 スコープ。Codex も撤回）

### 議論を経て採用
| 指摘 | 最終ラウンド | Codex → Claude のラリー概要 | 結論 |
|------|:-----------:|---------------------------|------|
| (なし — 合意指摘のみ) | | | |

### 議論を経て却下
| 指摘 | 最終ラウンド | 却下理由 |
|------|:-----------:|---------|
| C-3 | R2 | middleware 保証 + React Query の isPending で実害なし |
| C-4 | R2 | Phase 2 スコープ。Codex も撤回 |

## 実施した改善

| # | ファイル | 改善内容 | 出典 |
|---|---------|---------|------|
| 1 | src/lib/follows/api.ts | fetchFollowing/fetchFollowers に `.filter(row => row.profiles !== null)` 追加 | C-2/A-1 |
| 2 | src/lib/follows/api.ts | fetchFollowers に viewerId パラメータ追加、follows テーブルで isFollowing を解決 | C-1/A-2 |
| 3 | src/hooks/use-follows.ts | useFollowers が user?.id を viewerId として渡す | C-1/A-2 |
| 4 | src/__tests__/lib/follows-api.test.ts | null 除外テスト2件 + isFollowing 解決テスト1件 追加 | C-1/C-2 |
| 5 | src/__tests__/hooks/use-follows.test.tsx | fetchFollowers の呼び出し引数を更新 | C-1/A-2 |

## 検証結果

- lint/format: PASS (`pnpm check` — No fixes applied)
- ビルド: PASS (`pnpm build` — Compiled successfully)
- テスト: PASS (23 files, 225 tests — 全合格)
- react-doctor: PASS (100/100, No issues found)

## 所見

Phase 1 の実装品質は概ね良好。主要な問題は2点:
1. **fetchFollowers の isFollowing 未解決** — フォロワータブでフォロー状態が正しく表示されないバグ。1クエリ追加で解決
2. **profiles null チェック欠如** — 防御的プログラミングの基本。FK制約があるため実際に null になる可能性は低いが、安全側に倒すべき

mockCurrentUser の残存は計画通りの意図的負債であり、Phase 2 で解消予定。
