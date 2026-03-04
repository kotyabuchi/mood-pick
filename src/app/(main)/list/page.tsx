'use client';

import { useCallback, useMemo, useState } from 'react';
import { ArrowUpDown, Bookmark, CheckCircle, Play } from 'lucide-react';

import { ContentCard } from '@/components/ui/content-card';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionDivider } from '@/components/ui/section-divider';
import { FORCE_SKELETON, ListPageSkeleton } from '@/components/ui/skeletons';
import { TabBarSegment } from '@/components/ui/tab-bar-segment';
import { useWatchlist, useWatchlistStats } from '@/hooks/use-watchlist';
import { daysUntil } from '@/lib/utils';

import type { WatchlistSortOption } from '@/types';

const TABS = [
  { id: 'want', label: '見たい' },
  { id: 'watching', label: '視聴中' },
  { id: 'watched', label: '見た' },
] as const;

const SORT_LABELS: Record<WatchlistSortOption, string> = {
  created_at: '追加日',
  title: 'タイトル',
  watched_at: '視聴日',
};

function getDefaultSort(tab: string): WatchlistSortOption {
  return tab === 'watched' ? 'watched_at' : 'created_at';
}

export default function ListPage() {
  const [activeTab, setActiveTab] = useState('want');
  const [sortBy, setSortBy] = useState<WatchlistSortOption>(() =>
    getDefaultSort('want'),
  );

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setSortBy(getDefaultSort(tab));
  }, []);

  const wantSortBy = activeTab === 'want' ? sortBy : getDefaultSort('want');
  const watchingSortBy =
    activeTab === 'watching' ? sortBy : getDefaultSort('watching');
  const watchedSortBy =
    activeTab === 'watched' ? sortBy : getDefaultSort('watched');

  const { data: stats } = useWatchlistStats();
  const { data: wantItems = [], isLoading: wantLoading } = useWatchlist(
    'want',
    { sortBy: wantSortBy },
  );
  const { data: watchingItems = [], isLoading: watchingLoading } = useWatchlist(
    'watching',
    { sortBy: watchingSortBy },
  );
  const { data: watchedItems = [], isLoading: watchedLoading } = useWatchlist(
    'watched',
    { sortBy: watchedSortBy },
  );

  const isLoading = wantLoading || watchingLoading || watchedLoading;

  const tabs = useMemo(
    () =>
      TABS.map((tab) => ({
        ...tab,
        count:
          tab.id === 'want'
            ? (stats?.want ?? 0)
            : tab.id === 'watching'
              ? (stats?.watching ?? 0)
              : (stats?.watched ?? 0),
      })),
    [stats],
  );

  const sortOptions = useMemo(() => {
    const options: WatchlistSortOption[] = ['created_at', 'title'];
    if (activeTab === 'watched') {
      options.push('watched_at');
    }
    return options;
  }, [activeTab]);

  const urgentItems = useMemo(
    () =>
      wantItems.filter((i) =>
        i.streaming.some(
          (s) =>
            s.expiresAt &&
            daysUntil(s.expiresAt) <= 7 &&
            daysUntil(s.expiresAt) >= 0,
        ),
      ),
    [wantItems],
  );

  const normalWantItems = useMemo(
    () => wantItems.filter((i) => !urgentItems.includes(i)),
    [wantItems, urgentItems],
  );

  if (FORCE_SKELETON || isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="px-4 pt-4 pb-2 lg:px-0 lg:pt-6">
          <h1 className="text-2xl font-bold text-text-primary">マイリスト</h1>
        </div>
        <ListPageSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="px-4 pt-4 pb-2 lg:px-0 lg:pt-6">
        <h1 className="text-2xl font-bold text-text-primary">マイリスト</h1>
      </div>

      <div className="px-4 mb-4 lg:px-0">
        <TabBarSegment
          tabs={tabs}
          activeId={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      <div className="flex items-center gap-2 px-4 mb-3 lg:px-0">
        <ArrowUpDown className="size-4 text-text-secondary" />
        <label htmlFor="sort-select" className="text-sm text-text-secondary">
          並び替え:
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as WatchlistSortOption)}
          className="bg-surface text-text-primary text-sm rounded-lg border border-surface-light px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {sortOptions.map((option) => (
            <option key={option} value={option}>
              {SORT_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <div className="px-4 space-y-2 pb-8 lg:px-0">
        {activeTab === 'want' &&
          (wantItems.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="見たい作品がまだありません"
              description="気になる作品を追加しましょう"
              action={{ label: '作品を探す', href: '/search' }}
            />
          ) : (
            <>
              {urgentItems.length > 0 && (
                <>
                  <SectionDivider label="まもなく終了" />
                  {urgentItems.map((item) => (
                    <ContentCard
                      key={item.watchlistId}
                      item={item}
                      variant="horizontal"
                      showExpiration
                    />
                  ))}
                  <SectionDivider />
                </>
              )}
              {normalWantItems.map((item) => (
                <ContentCard
                  key={item.watchlistId}
                  item={item}
                  variant="horizontal"
                  showExpiration
                />
              ))}
            </>
          ))}

        {activeTab === 'watching' &&
          (watchingItems.length === 0 ? (
            <EmptyState
              icon={Play}
              title="視聴中の作品はありません"
              description="見始めた作品をここで管理できます"
              action={{ label: '作品を探す', href: '/search' }}
            />
          ) : (
            watchingItems.map((item) => (
              <ContentCard
                key={item.watchlistId}
                item={item}
                variant="horizontal"
                showMemo
              />
            ))
          ))}

        {activeTab === 'watched' &&
          (watchedItems.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="見た作品はまだありません"
              description="見終わった作品を記録しましょう"
              action={{ label: '作品を探す', href: '/search' }}
            />
          ) : (
            watchedItems.map((item) => (
              <ContentCard
                key={item.watchlistId}
                item={item}
                variant="horizontal"
                showRating
              />
            ))
          ))}
      </div>
    </div>
  );
}
