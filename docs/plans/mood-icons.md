# ムードアイコン変更 — 実装計画

## Context

ムード（気分タグ）の表示を絵文字から Lucide Icons の SVG アイコンに変更する。
Lucide Icons はプロジェクト全体で使用中のため統一感を維持できる。

## アイコン選定

| ムード | 現在（絵文字） | 変更後（Lucide） | 選定理由 |
|--------|--------------|-----------------|---------|
| excited（興奮） | 😆 | `Zap` | 稲妻 = エネルギー・興奮 |
| sad（切ない） | 😢 | `HeartCrack` | 割れたハート = 切なさ |
| funny（笑い） | 😂 | `Laugh` | 笑顔 = 笑い（直接的） |
| think（思考） | 🤔 | `Brain` | 脳 = 思考（直接的） |
| chill（まったり） | 🫠 | `Coffee` | コーヒー = リラックス |

## 変更ファイル

| ファイル | 変更内容 |
|----------|---------|
| `src/constants/theme.ts` | `emoji` プロパティを `icon`（LucideIcon）に置換 |
| `src/components/ui/mood-chip.tsx` | `emoji` 文字列表示 → Lucide アイコンコンポーネント表示 |
| `src/app/(main)/search/page.tsx` | `emoji` → `icon` に合わせた Props 修正 |
| `src/app/(main)/detail/[id]/detail-client.tsx` | 同上 |
| `src/components/ui/add-to-watchlist-dialog.tsx` | 同上 |
| `src/__tests__/components/mood-chip.test.tsx` | テストを SVG アイコン対応に修正 |

## 実装詳細

### 1. `src/constants/theme.ts`

```typescript
import { Brain, Coffee, HeartCrack, Laugh, Zap } from 'lucide-react';

export const Moods = [
  { id: 'excited', icon: Zap, label: '興奮したい', shortLabel: '興奮' },
  { id: 'sad', icon: HeartCrack, label: '切ない気分', shortLabel: '切ない' },
  { id: 'funny', icon: Laugh, label: '笑いたい', shortLabel: '笑い' },
  { id: 'think', icon: Brain, label: '考えたい', shortLabel: '思考' },
  { id: 'chill', icon: Coffee, label: 'まったりしたい', shortLabel: 'まったり' },
] as const;
```

### 2. `src/components/ui/mood-chip.tsx`

```typescript
import type { LucideIcon } from 'lucide-react';

interface MoodChipProps {
  mood: { id: string; icon: LucideIcon; label: string };
  selected: boolean;
  onPress: () => void;
}

// <span className="mr-1">{mood.emoji}</span>
// → <mood.icon size={14} className="mr-1" aria-hidden="true" />
```

### 3. 使用箇所（3ファイル）

`emoji: mood.emoji` → `icon: mood.icon` に変更（全箇所同じパターン）。

### 4. テスト

`emoji: '🔥'` → `icon: Zap`（Lucide アイコン）に変更。
テキスト検証 → SVG 要素の存在 + Lucide CSS クラス（`lucide-zap` 等）の検証に変更。

## 影響範囲

- DB・API には影響なし（ムードアイコンは UI 表現のみ）
- `MoodId` 型は変更なし
- `mappers.ts` は変更なし（`moodTags` は ID 配列で絵文字を含まない）

## Batch 分割

単一 Batch（変更ファイル6つ、変更量は小）で実施。

### Batch 完了時チェック

1. `pnpm check` — Biome lint + format
2. `npx react-doctor --diff main --verbose` — React ベストプラクティス検証
3. `/codex-debate` — Codex CLI とのクロスレビュー
4. `pnpm build` — TypeScript 型チェック + ビルド
5. `pnpm test` — 全テスト実行
