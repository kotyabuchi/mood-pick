'use client';

import { useCallback, useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { AddToWatchlistDialog } from '@/components/ui/add-to-watchlist-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StarRating } from '@/components/ui/star-rating';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useFeed } from '@/hooks/use-feed';
import { formatRelativeTime } from '@/lib/utils';

import type { Content, FeedItem } from '@/types';

function getActionText(item: FeedItem): string {
  switch (item.actionType) {
    case 'watched':
      return `「${item.content.title}」を見た`;
    case 'watching':
      return `「${item.content.title}」を見始めた`;
    case 'want':
      return `「${item.content.title}」を見たいに追加`;
    case 'recommend':
      return `あなたに「${item.content.title}」をおすすめ`;
  }
}

function FeedCard({
  item,
  onAddPress,
}: {
  item: FeedItem;
  onAddPress: () => void;
}) {
  const contentLink = `/detail/${item.content.tmdbId}?type=${item.content.type === 'anime' ? 'tv' : item.content.type}`;

  return (
    <div className="bg-surface rounded-lg mx-4 mb-3 p-3 lg:mx-0">
      {/* Header: avatar + name + time */}
      <div className="flex items-center mb-2">
        <UserAvatar uri={item.user.avatarUrl} name={item.user.name} size={36} />
        <span className="text-sm font-bold text-text-primary ml-2 flex-1">
          {item.user.name}
        </span>
        <span className="text-xs text-text-secondary">
          {formatRelativeTime(item.timestamp)}
        </span>
      </div>

      {/* Action text */}
      <p className="text-sm text-text-primary mb-2">{getActionText(item)}</p>

      {/* Rating for watched */}
      {item.actionType === 'watched' && item.rating && (
        <div className="mb-2">
          <StarRating rating={item.rating} />
        </div>
      )}

      {/* Content card */}
      <Link href={contentLink} className="flex mb-2 hover:opacity-80">
        <div className="relative w-[60px] h-[90px] shrink-0">
          <Image
            src={item.content.posterUrl}
            alt={item.content.title}
            fill
            className="object-cover rounded"
            sizes="60px"
          />
        </div>
        <div className="flex-1 ml-3 flex flex-col justify-center min-w-0">
          <p className="text-sm font-bold text-text-primary line-clamp-2">
            {item.content.title}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            {[
              item.content.genre,
              item.content.runtime ? `${item.content.runtime}分` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </Link>

      {/* Review / Message */}
      {item.review && (
        <p className="text-xs text-text-secondary mb-2 line-clamp-2">
          {item.review}
        </p>
      )}
      {item.message && (
        <p className="text-xs text-text-secondary mb-2 line-clamp-2">
          {item.message}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onAddPress}
          className="bg-accent rounded-full px-4 py-1.5 text-xs font-bold text-white hover:bg-accent-hover transition-colors"
        >
          見たいに追加
        </button>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { data: feedItems, isLoading, error } = useFeed();
  const [addDialogContent, setAddDialogContent] = useState<Content | null>(
    null,
  );

  const handleAddPress = useCallback((content: Content) => {
    setAddDialogContent(content);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <ScreenHeader title="フィード" />

      <div className="pt-2 pb-8">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 px-4">
            <p className="text-text-secondary text-sm">
              フィードの読み込みに失敗しました
            </p>
          </div>
        )}

        {!isLoading && !error && feedItems?.length === 0 && (
          <EmptyState
            icon={Users}
            title="フィードはまだ空です"
            description="ユーザーをフォローするとアクティビティが表示されます"
            action={{ label: '作品を探してみる', href: '/search' }}
          />
        )}

        {feedItems?.map((item) => (
          <FeedCard
            key={item.id}
            item={item}
            onAddPress={() => handleAddPress(item.content)}
          />
        ))}
      </div>

      <AddToWatchlistDialog
        open={!!addDialogContent}
        onOpenChange={(open) => !open && setAddDialogContent(null)}
        content={addDialogContent}
      />
    </div>
  );
}
