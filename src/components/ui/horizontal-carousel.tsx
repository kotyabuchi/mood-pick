interface HorizontalCarouselProps {
  title: string;
  icon?: React.ReactNode;
  count?: number;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  children: React.ReactNode;
}

export function HorizontalCarousel({
  title,
  icon,
  count,
  showSeeAll,
  onSeeAll,
  children,
}: HorizontalCarouselProps) {
  return (
    <section className="mb-4 min-w-0 overflow-x-hidden">
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center gap-1">
          {icon}
          <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          {count !== undefined && (
            <span className="text-xs text-text-secondary">({count})</span>
          )}
        </div>
        {showSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-xs text-accent hover:text-accent-hover transition-colors"
          >
            すべて見る
          </button>
        )}
      </div>
      <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain scrollbar-thin">
        <div className="flex w-max min-w-full gap-3 px-4">{children}</div>
      </div>
    </section>
  );
}
