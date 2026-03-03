export default function MainLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      {/* ヘッダースケルトン */}
      <div className="flex items-center justify-between px-4 py-3 lg:px-0 lg:pt-6">
        <div className="h-8 w-32 bg-surface-light rounded" />
        <div className="h-6 w-6 bg-surface-light rounded" />
      </div>

      <div className="space-y-6 px-4 lg:px-0">
        {/* セクションタイトルスケルトン */}
        <div>
          <div className="h-5 w-24 bg-surface-light rounded mb-3" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[130px] shrink-0">
                <div className="aspect-[2/3] bg-surface-light rounded-lg" />
                <div className="h-3 w-20 bg-surface-light rounded mt-2" />
              </div>
            ))}
          </div>
        </div>

        {/* 2番目のセクション */}
        <div>
          <div className="h-5 w-36 bg-surface-light rounded mb-3" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[130px] shrink-0">
                <div className="aspect-[2/3] bg-surface-light rounded-lg" />
                <div className="h-3 w-20 bg-surface-light rounded mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
