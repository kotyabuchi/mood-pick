'use client';

import { useMemo, useState } from 'react';
import { Bookmark, CheckCircle, Play } from 'lucide-react';

import { ContentCard } from '@/components/ui/content-card';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionDivider } from '@/components/ui/section-divider';
import { FORCE_SKELETON, ListPageSkeleton } from '@/components/ui/skeletons';
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

  if (FORCE_SKELETON || isLoading) {
    // TEMP: skeleton debug
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
          onTabChange={setActiveTab}
        />
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
