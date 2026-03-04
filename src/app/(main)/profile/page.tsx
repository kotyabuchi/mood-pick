'use client';

import { Film, Loader2, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ContentCard } from '@/components/ui/content-card';
import { EmptyState } from '@/components/ui/empty-state';
import { HorizontalCarousel } from '@/components/ui/horizontal-carousel';
import { ScreenHeader } from '@/components/ui/screen-header';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/context/auth-context';
import { useFollowCounts } from '@/hooks/use-follows';
import { useOwnProfile } from '@/hooks/use-profile';
import { useTimedWatchStats } from '@/hooks/use-timed-watch-stats';
import { useWatchlist, useWatchlistStats } from '@/hooks/use-watchlist';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useOwnProfile();
  const { data: stats } = useWatchlistStats();
  const { data: timedStats } = useTimedWatchStats();
  const { data: watchedItems = [] } = useWatchlist('watched');
  const { data: followCounts } = useFollowCounts(user?.id);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ScreenHeader
        title="プロフィール"
        rightIcon={Settings}
        onRightPress={() => router.push('/settings')}
      />

      <div className="pb-8">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center mt-4 mb-3">
          <UserAvatar
            uri={profile?.avatar_url}
            name={profile?.name}
            size={80}
          />
          <h2 className="text-xl font-bold text-text-primary mt-3">
            {profile?.name ?? '名前未設定'}
          </h2>
          {profile?.handle && (
            <p className="text-sm text-text-secondary mt-0.5">
              @{profile.handle}
            </p>
          )}
        </div>

        {/* Follow counts */}
        <Link href="/follows" className="block">
          <div className="flex justify-center mb-4 gap-4">
            <p className="text-sm text-text-primary">
              <span className="font-bold">
                {followCounts?.followingCount ?? 0}
              </span>{' '}
              フォロー
            </p>
            <p className="text-sm text-text-primary">
              <span className="font-bold">
                {followCounts?.followerCount ?? 0}
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
                {timedStats?.thisMonth ?? 0}本
              </span>
            </p>
            <p className="text-xs text-text-secondary">
              今年:{' '}
              <span className="text-text-primary font-bold">
                {timedStats?.thisYear ?? 0}本
              </span>
            </p>
          </div>
        </div>

        {/* Recent watched */}
        {watchedItems.length > 0 ? (
          <HorizontalCarousel title="最近見た作品">
            {watchedItems.map((item) => (
              <div key={item.watchlistId} className="w-[120px] shrink-0">
                <ContentCard item={item} variant="poster" showRating />
              </div>
            ))}
          </HorizontalCarousel>
        ) : (
          <div className="mx-4 lg:mx-0">
            <h2 className="text-base font-bold text-text-primary mb-1">
              最近見た作品
            </h2>
            <EmptyState
              icon={Film}
              title="まだ見た作品がありません"
              description="作品を見たら記録してみましょう"
              action={{ label: '作品を探す', href: '/search' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
