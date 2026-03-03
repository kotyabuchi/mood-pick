# Codex Debate レビューレポート

> **日時**: 2026-03-04
> **対象**: Content/ContentDetail 型分離 + TMDb検索バグ修正
> **ラウンド数**: 1/5
> **採用指摘数**: 2 / 全5件

## 対象ファイル

| ファイル | 種別 |
|----------|------|
| `src/types/index.ts` | 型定義 |
| `src/lib/tmdb/mappers.ts` | TMDbマッパー |
| `src/lib/tmdb/client.ts` | TMDbクライアント |
| `src/hooks/use-content-detail.ts` | 詳細取得hook |
| `src/hooks/use-watchlist-mutations.ts` | ウォッチリスト変更hook |
| `src/lib/watchlist/mappers.ts` | ウォッチリストマッパー |
| `src/components/ui/add-to-watchlist-dialog.tsx` | 追加ダイアログ |
| `src/components/ui/content-card.tsx` | カード表示 |
| `src/app/(main)/detail/[id]/detail-client.tsx` | 詳細ページ |
| `src/app/(main)/feed/page.tsx` | フィードページ |
| `src/app/(main)/results/page.tsx` | 検索結果フィルタ |
| `src/lib/mock-data.ts` | モックデータ |
| `src/__tests__/components/content-card.test.tsx` | テスト |

## Codex の指摘（3件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| C-1 | feed/page.tsx:115 | useFeedのフォロー絞り込み未実装でアクティビティ露出リスク | follows ベースでサーバー側フィルタ必須化 | 高 |
| C-2 | add-to-watchlist-dialog.tsx:30 | 常にuseContentDetail実行でTMDb失敗時に追加不可の回帰 | providedContentがContentDetailならフェッチ不要 | 中 |
| C-3 | feed/page.tsx:143 | 空状態とundefined状態の区別不足 | デフォルト値とauth状態分岐の明示化 | 低 |

## Claude の指摘（2件）

| # | ファイル:行 | 問題 | 改善案 | 優先度 |
|---|------------|------|--------|--------|
| A-1 | content-card.tsx:67 | `'runtime' in item && item.runtime` で runtime:0 が非表示 | ContentDetailなら0でも表示すべき | 低 |
| A-2 | results/page.tsx:43 | WatchlistItemにはruntimeが必ず存在するので `&&` ガード不要 | ガード削除 | 低 |

## 議論サマリー

### 合意点
- C-2: TMDb障害時のフォールバックが消失する回帰は修正すべき

### 議論を経て却下

| 指摘 | 却下理由 |
|------|----------|
| C-1 | この差分のスコープ外（useFeedへの切り替えは別の既存変更）。RLS/フォロー絞り込みは別タスク |
| C-3 | この差分のスコープ外（フィードページのstate管理は別タスク） |
| A-1 | runtime:0 は実運用で発生しない（TMDb detailは必ず正のruntime値を返す） |

### 議論を経て採用

| 指摘 | 結論 |
|------|------|
| C-2 | `isContentDetail` 型ガードを導入し、providedContentがContentDetailならフェッチをスキップ |
| A-2 | WatchlistItem.runtimeは必須なのでガード削除 |

## 実施した改善

| # | ファイル | 改善内容 | 出典 |
|---|---------|---------|------|
| 1 | add-to-watchlist-dialog.tsx | `isContentDetail` 型ガード導入、ContentDetailならフェッチスキップ | C-2 |
| 2 | results/page.tsx | 不要な `item.runtime &&` ガード削除 | A-2 |

## 検証結果

- lint/format: PASS
- TypeScript: PASS
- react-doctor: 99/100 (PASS)

## 所見

Content/ContentDetail の型分離により、検索結果と詳細データの責務が型レベルで明確になった。
Codex の C-2 指摘は的確で、ダイアログの回帰バグを防止できた。
C-1/C-3 はフィードページの別変更に対する指摘であり、今回のスコープ外として却下した。
