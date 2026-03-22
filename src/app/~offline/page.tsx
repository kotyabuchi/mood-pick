'use client';

import { WifiSlashIcon } from '@phosphor-icons/react/ssr';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <WifiSlashIcon size={64} className="text-text-disabled mb-6" />
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        オフラインです
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        インターネット接続が見つかりません。
        <br />
        接続を確認してからもう一度お試しください。
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="bg-accent text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors"
      >
        再読み込み
      </button>
    </div>
  );
}
