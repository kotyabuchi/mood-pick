'use client';

import { useMemo } from 'react';
import { Bell, Film, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { ContentCard } from '@/components/ui/content-card';
import { EmptyState } from '@/components/ui/empty-state';
import { HorizontalCarousel } from '@/components/ui/horizontal-carousel';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { UrgencyBadge } from '@/components/ui/urgency-badge';
import { useWatchlist } from '@/hooks/use-watchlist';
import { daysUntil } from '@/lib/utils';

export default function HomePage() {
  const { data: watchingItems = [], isLoading: watchingLoading } =
    useWatchlist('watching');
  const { data: wantItems = [], isLoading: wantLoading } = useWatchlist('want');

  const expiringItems = useMemo(
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 lg:px-0 lg:pt-6">
        <h1 className="text-2xl font-bold text-accent lg:hidden">MoodPick</h1>
        <h1 className="text-2xl font-bold text-text-primary hidden lg:block">
          ホーム
        </h1>
        <Link
          href="/notifications"
          className="relative text-text-primary hover:text-text-secondary transition-colors"
          data-testid="notification-bell"
        >
          <Bell size={24} />
          <NotificationBadge />
        </Link>
      </div>

      {wantLoading || watchingLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2
            size={32}
            className="animate-spin text-accent"
            data-testid="loading-indicator"
          />
        </div>
      ) : watchingItems.length === 0 && expiringItems.length === 0 ? (
        <EmptyState
          icon={Film}
          title="まだ作品がありません"
          description="気分に合わせて作品を探してみましょう"
          action={{ label: '作品を探す', href: '/search' }}
        />
      ) : (
        <div className="space-y-6 pb-8">
          {/* 視聴中セクション */}
          {watchingItems.length > 0 && (
            <HorizontalCarousel
              title="視聴中"
              icon={<span className="text-lg mr-1">▶</span>}
              count={watchingItems.length}
              showSeeAll
              onSeeAll={() => {}}
            >
              {watchingItems.map((item) => (
                <div key={item.watchlistId} className="w-[200px] shrink-0">
                  <ContentCard item={item} variant="poster" showMemo />
                </div>
              ))}
            </HorizontalCarousel>
          )}

          {/* 配信終了まもなくセクション */}
          {expiringItems.length > 0 && (
            <HorizontalCarousel
              title="配信終了まもなく"
              icon={<span className="text-lg mr-1">⚠</span>}
              count={expiringItems.length}
            >
              {expiringItems.map((item) => {
                const expiringStream = item.streaming.find(
                  (s) =>
                    s.expiresAt &&
                    daysUntil(s.expiresAt) <= 7 &&
                    daysUntil(s.expiresAt) >= 0,
                );
                return (
                  <div key={item.watchlistId} className="w-[130px] shrink-0">
                    <div className="relative">
                      <ContentCard item={item} variant="poster" />
                      {expiringStream?.expiresAt && (
                        <div className="absolute top-1 left-1">
                          <UrgencyBadge expiresAt={expiringStream.expiresAt} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </HorizontalCarousel>
          )}
        </div>
      )}
    </div>
  );
}
