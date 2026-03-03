'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <AlertCircle size={64} className="text-error mb-6" />
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        エラーが発生しました
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        予期しないエラーが発生しました。
        <br />
        しばらくしてからもう一度お試しください。
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-accent text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors"
      >
        再試行
      </button>
    </div>
  );
}
