# コーディング規約

## Biome 設定

- シングルクォート、スペースインデント、LF改行
- `noExplicitAny: error` — any禁止
- `noUnusedImports: error`

## Import 順序

空行区切りで以下の順序:
1. react
2. packages
3. lib (`@/lib/`)
4. paths (`@/`)
5. relative (`./`, `../`)
6. types (`type` imports)

## Theme (Dark Only)

Tailwind v4 `@theme` 変数を使用 (`src/app/globals.css`):

| トークン | 値 |
|---------|-----|
| `background` | #0D0D0D |
| `surface` / `surface-light` | サーフェス |
| `accent` | #FF6B00 |
| `text-primary` | メインテキスト |
| `text-secondary` | サブテキスト |
| `text-disabled` | 無効テキスト |

## Types

| ファイル | 役割 |
|---------|------|
| `src/types/index.ts` | ドメイン型（UI層で使うアプリ固有の型） |
| `src/types/database.ts` | Supabase自動生成（Row/Insert/Update） |
| `src/types/tmdb.ts` | TMDb APIレスポンス定義 |

Mapper (`src/lib/*/mappers.ts`) が各層間の変換を担う。

## Bash Tool

Bash ツールでコマンドを実行するとき、先頭に `cd` を付けない。作業ディレクトリはツール内部で管理されるため不要。
