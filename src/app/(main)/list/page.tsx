'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { ContentCard } from '@/components/ui/content-card';
import { SectionDivider } from '@/components/ui/section-divider';
import { TabBarSegment } from '@/components/ui/tab-bar-segment';
import { useWatchlist, useWatchlistStats } from '@/hooks/use-watchlist';
import { daysUntil } from '@/lib/utils';

const TABS = [
  { id: 'want', label: '見たい' },
  { id: 'watching', label: '視聴中' },
  { id: 'watched', label: '見た' },
] as const;

export default function ListPage() {
  const [activeTab, setActiveTab] = useState('want');

  const { data: stats } = useWatchlistStats();
  const { data: wantItems = [], isLoading: wantLoading } = useWatchlist('want');
  const { data: watchingItems = [], isLoading: watchingLoading } =
    useWatchlist('watching');
  const { data: watchedItems = [], isLoading: watchedLoading } =
    useWatchlist('watched');

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2
          size={32}
          className="animate-spin text-accent"
          data-testid="loading-indicator"
        />
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
          onTabChange={setActiveTab}
        />
      </div>

      <div className="px-4 space-y-2 pb-8 lg:px-0">
        {activeTab === 'want' && (
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
        )}

        {activeTab === 'watching' &&
          watchingItems.map((item) => (
            <ContentCard
              key={item.watchlistId}
              item={item}
              variant="horizontal"
              showMemo
            />
          ))}

        {activeTab === 'watched' &&
          watchedItems.map((item) => (
            <ContentCard
              key={item.watchlistId}
              item={item}
              variant="horizontal"
              showRating
            />
          ))}
      </div>
    </div>
  );
}
