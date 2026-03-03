'use client';

import { Settings } from 'lucide-react';
import Link from 'next/link';

import { ContentCard } from '@/components/ui/content-card';
import { HorizontalCarousel } from '@/components/ui/horizontal-carousel';
import { ScreenHeader } from '@/components/ui/screen-header';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useFollowCounts } from '@/hooks/use-follows';
import { useWatchlist, useWatchlistStats } from '@/hooks/use-watchlist';
import { mockCurrentUser } from '@/lib/mock-data';

export default function ProfilePage() {
  const user = mockCurrentUser;
  const { data: stats } = useWatchlistStats();
  const { data: watchedItems = [] } = useWatchlist('watched');
  const { data: followCounts } = useFollowCounts(user.id);

  return (
    <div className="max-w-4xl mx-auto">
      <ScreenHeader
        title="プロフィール"
        rightIcon={Settings}
        onRightPress={() => {}}
      />

      <div className="pb-8">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center mt-4 mb-3">
          <UserAvatar uri={user.avatarUrl} name={user.name} size={80} />
          <h2 className="text-xl font-bold text-text-primary mt-3">
            {user.name}
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">@{user.handle}</p>
        </div>

        {/* Follow counts */}
        <Link href="/follows" className="block">
          <div className="flex justify-center mb-4 gap-4">
            <p className="text-sm text-text-primary">
              <span className="font-bold">
                {followCounts?.followingCount ?? user.followingCount}
              </span>{' '}
              フォロー
            </p>
            <p className="text-sm text-text-primary">
              <span className="font-bold">
                {followCounts?.followerCount ?? user.followerCount}
              </span>{' '}
              フォロワー
            </p>
          </div>
        </Link>

        {/* Stats */}
        <div className="bg-surface rounded-lg mx-4 p-4 mb-4 lg:mx-0">
          <div className="flex justify-around mb-3">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-text-primary">
                {stats?.watched ?? 0}
              </span>
              <span className="text-xs text-text-secondary">見た作品</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-text-primary">
                {stats?.watching ?? 0}
              </span>
              <span className="text-xs text-text-secondary">視聴中</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-text-primary">
                {stats?.want ?? 0}
              </span>
              <span className="text-xs text-text-secondary">見たい</span>
            </div>
          </div>
          <div className="border-t border-border pt-3 flex justify-center gap-6">
            <p className="text-xs text-text-secondary">
              今月:{' '}
              <span className="text-text-primary font-bold">
                {user.stats.thisMonth}本
              </span>
            </p>
            <p className="text-xs text-text-secondary">
              今年:{' '}
              <span className="text-text-primary font-bold">
                {user.stats.thisYear}本
              </span>
            </p>
          </div>
        </div>

        {/* Recent watched */}
        {watchedItems.length > 0 && (
          <HorizontalCarousel title="最近見た作品">
            {watchedItems.map((item) => (
              <div key={item.watchlistId} className="w-[120px] shrink-0">
                <ContentCard item={item} variant="poster" showRating />
              </div>
            ))}
          </HorizontalCarousel>
        )}
      </div>
    </div>
  );
}
