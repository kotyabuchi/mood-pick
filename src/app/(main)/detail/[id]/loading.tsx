export default function DetailLoading() {
  return (
    <div className="relative min-h-screen animate-pulse">
      {/* ポスタースケルトン */}
      <div className="relative w-full aspect-[2/3] max-h-[60vh] bg-surface-light" />

      {/* コンテンツスケルトン */}
      <div className="px-4 -mt-4 relative z-10 max-w-4xl mx-auto lg:px-0">
        <div className="h-8 w-48 bg-surface-light rounded mb-2" />
        <div className="h-4 w-32 bg-surface-light rounded mb-4" />

        {/* バッジスケルトン */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-20 bg-surface-light rounded-full" />
          <div className="h-6 w-20 bg-surface-light rounded-full" />
        </div>

        {/* ムードスケルトン */}
        <div className="mb-4">
          <div className="h-4 w-16 bg-surface-light rounded mb-2" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-surface-light rounded-full" />
            <div className="h-8 w-24 bg-surface-light rounded-full" />
            <div className="h-8 w-24 bg-surface-light rounded-full" />
          </div>
        </div>

        {/* あらすじスケルトン */}
        <div>
          <div className="h-6 w-20 bg-surface-light rounded mb-2" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-surface-light rounded" />
            <div className="h-4 w-full bg-surface-light rounded" />
            <div className="h-4 w-3/4 bg-surface-light rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
