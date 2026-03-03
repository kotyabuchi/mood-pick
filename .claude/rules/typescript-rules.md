# TypeScript ルール

## 厳格さ

- **any禁止**: `any`は一切使用しない。型が不明な場合は`unknown`を使用
- **型アサーション**: `as`は最小限に。型ガードを優先
- **Non-null assertion**: `!`は使用禁止。Optional chainingを使用

```typescript
// NG
const data: any = response
const name = user!.name

// OK
const data: unknown = response
const name = user?.name ?? 'Unknown'
```

## 型定義

- **Props型**: コンポーネント名 + `Props`
  ```typescript
  interface ButtonProps {
    variant: 'primary' | 'secondary'
    onClick: () => void
  }
  ```
- **interfaceとtype**: 基本的に`interface`を使用。`type`は union / intersection / リテラル型など`interface`で表現できない場合のみ
  ```typescript
  // ✅ interface（オブジェクト型）
  interface User {
    id: string
    name: string
  }

  // ✅ type（union型、リテラル型）
  type ContentType = 'movie' | 'tv' | 'anime'
  type Result = Success | Failure
  ```
- **exportする型**: ファイル末尾にまとめてexport
  ```typescript
  // ファイル末尾
  export type { ButtonProps, ButtonVariant }
  ```

---

## 型の導出原則（Single Source of Truth）

**スキーマ・テーブル定義を Single Source of Truth（単一の信頼できる情報源）とする。**

型定義は以下の優先順位に必ず従うこと：

| 優先度 | 型の取得元 | 例 |
|--------|-----------|-----|
| 1 | ライブラリ公式の型 | `z.infer`, Supabase生成型, `FieldErrors` |
| 2 | 上記から推論された型 | `typeof schema` からの派生 |
| 3 | 最小限の独自型 | やむを得ない場合のみ |

## Supabase 生成型からの型導出

DB行データの型は `src/types/database.ts`（`supabase gen types typescript --linked` で生成）から導出すること。

```typescript
// ✅ OK - Supabase生成型から導出
import type { Database } from '@/types/database'
type ProfileRow = Database['public']['Tables']['profiles']['Row']

// ❌ NG - テーブル定義と同等の独自型を作成
type Profile = {
  id: string
  name: string
  avatarUrl: string | null
  createdAt: string
}
```

**注意**: Supabase REST APIはタイムスタンプを`string`（ISO形式）で返す。`Date`型ではない。

### ドメイン型とDB型の分離

このプロジェクトでは以下の3層構造を採用：

| レイヤー | ファイル | 役割 |
|----------|---------|------|
| DB型 | `src/types/database.ts` | Supabase自動生成。Row/Insert/Update |
| 外部API型 | `src/types/tmdb.ts` | TMDb APIレスポンス定義 |
| ドメイン型 | `src/types/index.ts` | UI層で使うアプリ固有の型 |

**Mapper** (`src/lib/*/mappers.ts`) が各層間の変換を担う。ドメイン型にDB型やAPI型を直接混入させない。

## Zod スキーマからの型導出

Zod スキーマが存在する場合、型定義は必ず `z.infer<typeof schema>` から取得すること。

```typescript
// ✅ OK - スキーマから型を導出
export type UserFormValues = z.infer<typeof userFormSchema>

// ❌ NG - スキーマと型を二重管理
export type UserFormValues = {
  name: string
  email: string
}
```

## 禁止パターン

| パターン | 問題点 |
|----------|--------|
| `Record<string, any>` | 型安全性が失われる |
| `Record<string, string>` | ライブラリの型を無視している |
| スキーマと同等の独自型 | 二重管理でズレが生じる |
| プリミティブへの安易な変換 | 型情報が失われる |

## まとめ

1. **DBテーブル** → `Database['public']['Tables'][T]['Row']` / `['Insert']`（Supabase生成型）
2. **Zod スキーマ** → `z.infer<typeof schema>` / `z.input<typeof schema>`
3. **React Hook Form** → `FieldErrors<T>`, `UseFormReturn<T>` 等
4. **TMDb API** → `src/types/tmdb.ts` の型を使用
5. **ドメイン型** → `src/types/index.ts`（DB/API型で表現できない場合のみ）
6. **独自型は最終手段** → 上記で対応できない場合のみ
