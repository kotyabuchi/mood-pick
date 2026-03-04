# Quality Checks

## Batch 完了時の必須チェック

実装の各 Batch 完了時に以下を**必ず**実行すること。スキップ禁止。

| 順序 | コマンド | 目的 |
|------|---------|------|
| 1 | `pnpm check` | Biome lint + format |
| 2 | `npx react-doctor --diff main --verbose` | React ベストプラクティス検証 |
| 3 | `/codex-debate` | Codex CLI とのクロスレビュー |
| 4 | `pnpm build` | TypeScript 型チェック + ビルド |
| 5 | `pnpm test` | 全テスト実行 |

- ステップ3で指摘があれば修正してから次の Batch へ進む
- レポートは `docs/reviews/` に出力される

## 計画書レビュー

Plan mode で ExitPlanMode する前にも `/codex-debate` で計画書をクロスレビューすること。
