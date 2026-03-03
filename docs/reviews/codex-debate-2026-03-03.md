# Codex Debate レビューレポート

> **日時**: 2026-03-03
> **対象**: MoodPick 主要10ファイル（Phase 1-7 移行後レビュー）
> **ラウンド数**: 2/5
> **採用指摘数**: 9 / 全21件

## 対象ファイル

| ファイル | 行数 | 種別 |
|----------|------|------|
| `src/app/(main)/detail/[id]/detail-client.tsx` | 309 | 変更対象 |
| `src/hooks/use-watchlist-mutations.ts` | 129 | 読取専用 |
| `src/context/auth-context.tsx` | 187 | 変更対象 |
| `src/lib/watchlist/api.ts` | 126 | 変更対象 |
| `src/components/ui/add-to-watchlist-dialog.tsx` | 141 | 変更対象 |
| `src/components/ui/status-change-dialog.tsx` | 133 | 変更対象 |
| `src/app/(main)/settings/page.tsx` | 177 | 読取専用 |
| `src/lib/tmdb/client.ts` | 88 | 読取専用 |
| `src/hooks/use-watchlist.ts` | 48 | 読取専用 |
| `src/app/(main)/results/page.tsx` | 90 | 変更対象 |

## Codex の指摘（5件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| C-1 | status-change-dialog:19, detail-client:106 | `watching` ステータスが STATUS_OPTIONS に欠落 | STATUS_OPTIONS に watching を追加 | 高 |
| C-2 | status-change-dialog:47 | watched/dropped 更新時に反対側のタイムスタンプが残る | 更新時に対側を null にセット | 中 |
| C-3 | add-to-watchlist-dialog:38 | selectedMoods が初回レンダー時のみ反映 | useEffect で open/content 変更時に同期 | 中 |
| C-4 | detail-client:174 | 未登録作品でもステータス変更メニューが表示され無反応 | watchlistItem がない場合は非表示に | 中 |
| C-5 | watchlist/api:42 | tmdb_id のみで対象特定、RLS 不備時の誤更新リスク | user_id を明示条件に追加 | 中 |

## Claude の指摘（16件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| A-1 | use-supabase/auth-context | 複数の Supabase client インスタンス生成 | 単一ソース化 | 中 |
| A-2 | auth-context:79-83 | getSession() レースコンディション | session 存在時も updateState を呼ぶ | 高 |
| A-3 | add-to-watchlist-dialog:38 | selectedMoods 初期化が stale（=C-3） | useEffect で同期 | 高 |
| A-4 | settings:115 | signOut() エラーが黙殺される | try/catch でエラー表示 | 中 |
| A-5 | settings:17-22 | 設定状態がローカルのみで永続化されない | バックエンド連携 | 中 |
| A-6 | use-watchlist-mutations:66-83 | updateStatus に楽観的更新がない | onMutate/onError を追加 | 中 |
| A-7 | results:38 | 空 moodIds で全件除外される | moodIds.length > 0 ガード追加 | 高 |
| A-8 | results:21 | クライアント側フィルタリングのスケーラビリティ | Supabase クエリ側でフィルタ | 中 |
| A-9 | watchlist/api:100-103 | dropped を watched としてカウント | 分離集計 | 高 |
| A-10 | watchlist/api:62-84 | user scoping なし（=C-5） | user_id フィルタ追加 | 中 |
| A-11 | use-watchlist-mutations:35-45 | 楽観的更新の temp ID 問題 | crypto.randomUUID() 使用 | 低 |
| A-12 | tmdb/client:27-28 | エラーレスポンスに HTTP status なし | status を Error に含める | 低 |
| A-13 | use-watchlist:31 | tmdbId ?? 0 のフォールバック | sentinel 値使用 | 低 |
| A-14 | auth-context:168-175 | Provider value が毎レンダー再生成 | useMemo で安定化 | 中 |
| A-15 | add-to-watchlist/status-change | catch ブロックが空 | エラーフィードバック表示 | 高 |
| A-16 | status-change-dialog:19-24 | 現在のステータスが選択肢に表示される | currentStatus でフィルタ | 中 |

## 議論サマリー

### 合意点（初回で一致、即採用）
- C-3 = A-3: selectedMoods のステイル初期化
- C-5 = A-10: user_id スコーピング（コメント追記で対応、RLS 前提を明記）

### ラリーの記録

#### A-2: getSession() レースコンディション
- **R1 Claude**: session 存在時も updateStateFromSession を呼ぶべき
- **R1 Codex**: **修正** — INITIAL_SESSION への依存を減らし、初期化漏れ/ローディング残留リスクを下げられる。error も未処理なので失敗時の isLoading false 化も追加すべき
- **結論**: 採用（Codex 追加提案の error ハンドリングも反映）

#### A-7: 空 moodIds フィルタバグ
- **R1 Claude**: moodIds.length === 0 で全件除外される
- **R1 Codex**: **修正** — moodIds が空のときはムード条件をスキップする分岐が必要
- **結論**: 採用

#### A-9: dropped を watched としてカウント
- **R1 Claude**: 命名と意味が不一致
- **R1 Codex**: **修正** — watched と dropped を分離集計するか返却フィールド名を明確化すべき
- **結論**: 採用（分離集計で実装）

#### A-14: Provider value の useMemo
- **R1 Claude**: 毎レンダーで再生成される
- **R1 Codex**: **撤回** — 重大な不具合ではない。useMemo で改善可能だが優先度は低い
- **結論**: 採用（Claude 判断 — 簡単な修正で不要な再レンダーを防げるため）

#### A-15: 空 catch ブロック
- **R1 Claude**: エラーフィードバックがない
- **R1 Codex**: **修正** — トースト表示 + ログ送信を入れるべき
- **結論**: 採用（ローカル error state で実装）

### 議論を経て採用
| 指摘 | 最終ラウンド | ラリー概要 | 結論 |
|------|:-----------:|-----------|------|
| A-2 | R1 | 両者合意 + Codex が error ハンドリング追加提案 | 採用 |
| A-7 | R1 | 両者即合意 | 採用 |
| A-9 | R1 | 両者即合意 | 採用 |
| A-14 | R1 | Codex 撤回、Claude が簡易修正として採用 | 採用 |
| A-15 | R1 | 両者即合意 | 採用 |

### 議論を経て却下（今回なし）
| 指摘 | 却下理由 |
|------|---------|
| A-1 | @supabase/ssr の createBrowserClient は内部シングルトン — 現状問題なし |
| A-4 | 設計上は正しいが、signOut は middleware が処理するため影響小 |
| A-5 | 設定の永続化は将来のフィーチャー — 現時点ではスコープ外 |
| A-6 | 楽観的更新は UX 改善だがバグではない — 将来タスクとして記録 |
| A-8 | Supabase クエリフィルタは将来のスケーリング対応 |
| A-11 | temp ID は invalidation で即差し替えられるため実害なし |
| A-12 | Route Handler が統一エラー形式を返すため影響小 |
| A-13 | enabled: false で実際にフェッチされないため実害なし |

## 実施した改善

| # | ファイル | 改善内容 | 出典 |
|---|---------|---------|------|
| 1 | status-change-dialog.tsx | `watching` を STATUS_OPTIONS に追加 | C-1 |
| 2 | status-change-dialog.tsx | watched 更新時に dropped_at=null、dropped 更新時に watched_at=null | C-2 |
| 3 | status-change-dialog.tsx | currentStatus prop で現在のステータスをフィルタ | A-16 |
| 4 | status-change-dialog.tsx | catch ブロックにエラーメッセージ表示追加 | A-15 |
| 5 | auth-context.tsx | getSession() で session 存在時も updateStateFromSession を呼ぶ + error ハンドリング | A-2 |
| 6 | auth-context.tsx | Provider value を useMemo で安定化 | A-14 |
| 7 | results/page.tsx | moodIds.length > 0 ガード追加 | A-7 |
| 8 | add-to-watchlist-dialog.tsx | useEffect で open/content 変更時に selectedMoods を同期 + エラー表示 | A-3/C-3, A-15 |
| 9 | watchlist/api.ts | fetchWatchlistStats で watched と dropped を分離集計 | A-9 |
| 10 | detail-client.tsx | watchlistItem がない場合は「ステータス変更」メニューを非表示 | C-4 |
| 11 | detail-client.tsx | StatusChangeDialog に currentStatus prop を渡す | A-16 |

## 検証結果

- lint/format: PASS（既存の lint 警告は今回のスコープ外）
- ビルド: PASS
- テスト: PASS（21ファイル / 207テスト）

## 所見

移行コードの品質は全体的に高い。最も重要な発見は:
1. **STATUS_OPTIONS に `watching` が欠落**（C-1）— ユーザーフロー上の致命的な欠落。CTA「視聴開始」をタップしても実際に watching に遷移できなかった。
2. **getSession() レースコンディション**（A-2）— Supabase の INITIAL_SESSION イベントに依存しており、タイミングによっては永久ローディングになる可能性があった。
3. **空 moodIds フィルタ**（A-7）— ムード未選択時に全件が非表示になるバグ。

今後の改善候補として、watchlist mutations の楽観的更新強化（A-6）、Settings ページのバックエンド接続（A-5）、Supabase クエリレベルのフィルタリング（A-8）が挙げられる。
