# React フォーム送信パターン

## useTransition + useOptimistic によるフォーム送信管理

フォーム送信（ログイン、サインアップ、データ作成等）では `useState` による手動ローディング管理を禁止する。
代わりに `useTransition` + `useOptimistic` を使用すること。

### なぜ useState(isLoading) がダメか

```typescript
// ❌ NG - 多重サブミット問題が発生する
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await submitAction();
    router.push('/next');  // この遷移完了前に↓が実行される
  } finally {
    setIsLoading(false);   // ボタンが有効化 → 多重サブミット可能
  }
};
```

`finally` でローディング解除すると、`router.push` のページ遷移完了前にボタンが有効化される。

### 正しいパターン

```typescript
// ✅ OK - useTransition + useOptimistic
const [error, setError] = useState('');
const [isPending, startTransition] = useTransition();
const [optimisticError, setOptimisticError] = useOptimistic(error);

const handleSubmit = () => {
  startTransition(async () => {
    setOptimisticError('');  // 即座にエラー表示クリア

    const { error } = await submitAction();
    if (error) {
      setError(errorMessage);  // 実体値を更新 → トランジション完了時に反映
      return;
    }

    router.replace('/next');
  });
};
```

### 各フックの役割

| フック | 役割 |
|--------|------|
| `useTransition` | 非同期処理 + ルーター遷移を一括管理。`isPending` は `startTransition` 開始からページ遷移完了まで `true` を維持 |
| `useOptimistic` | エラー等の表示状態を即座に更新。トランジション完了時に実体値に収束 |

### ルール

1. **`isPending` をローディング表示・ボタン無効化に使用する**（`useState` の `isLoading` は使わない）
2. **`useOptimistic` でエラー表示を管理する**（`error` が source of truth、`optimisticError` が表示用）
3. **`router.replace` を使用する**（認証フローなど、戻るボタンで前画面に戻るべきでない場合）
4. **`try/finally` パターンは使わない**（`startTransition` がライフサイクルを管理する）
