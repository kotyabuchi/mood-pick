'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { StarRating } from './star-rating';
import { StreamingBadge } from './streaming-badge';
import { UrgencyBadge } from './urgency-badge';

import { cn } from '@/lib/cn';

import type { Content, SearchResult, WatchlistItem } from '@/types';

interface ContentCardProps {
  item: WatchlistItem | Content | SearchResult;
  variant: 'horizontal' | 'poster' | 'list-item';
  href?: string;
  showExpiration?: boolean;
  showRating?: boolean;
  showMemo?: boolean;
  showAddButton?: boolean;
  onAddPress?: () => void;
}

function ContentCardInner({
  item,
  variant,
  href,
  showExpiration,
  showRating,
  showMemo,
  showAddButton,
  onAddPress,
}: ContentCardProps) {
  const itemMemo = 'memo' in item ? (item as WatchlistItem).memo : null;
  const rating = 'rating' in item ? (item as WatchlistItem).rating : null;

  const cardLink =
    href ??
    `/detail/${item.tmdbId}?type=${item.type === 'anime' ? 'tv' : item.type}`;

  if (variant === 'horizontal') {
    return (
      <Link
        href={cardLink}
        className="block bg-surface rounded-lg p-2 hover:bg-surface-light transition-colors"
      >
        <div className="flex gap-3">
          <div className="relative w-20 h-[120px] shrink-0">
            <Image
              src={item.posterUrl}
              alt={item.title}
              fill
              className="object-cover rounded"
              sizes="80px"
            />
          </div>
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="text-sm font-bold text-text-primary line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {item.genre} · {item.runtime}分
              </p>
              {item.streaming[0] && (
                <div className="mt-1">
                  <StreamingBadge
                    service={item.streaming[0].service}
                    expiresAt={item.streaming[0].expiresAt}
                  />
                </div>
              )}
            </div>
            {showMemo && itemMemo && (
              <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                {itemMemo}
              </p>
            )}
            {showExpiration && item.streaming.some((s) => s.expiresAt) && (
              <div className="mt-1 flex gap-1 flex-wrap">
                {item.streaming
                  .filter(
                    (s): s is typeof s & { expiresAt: string } => !!s.expiresAt,
                  )
                  .map((s) => (
                    <UrgencyBadge key={s.service} expiresAt={s.expiresAt} />
                  ))}
              </div>
            )}
            {showRating && rating && (
              <div className="mt-1">
                <StarRating rating={rating} />
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'poster') {
    return (
      <Link href={cardLink} className="block group">
        <div className="relative aspect-[2/3] overflow-hidden rounded">
          <Image
            src={item.posterUrl}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="(max-width: 768px) 33vw, 200px"
          />
        </div>
        <p className="text-xs font-semibold text-text-primary mt-1 line-clamp-1">
          {item.title}
        </p>
        {item.streaming[0] && (
          <p className="text-[10px] text-text-secondary">
            {item.streaming[0].service}
          </p>
        )}
      </Link>
    );
  }

  // variant === "list-item"
  return (
    <div className="flex items-center py-2">
      <Link href={cardLink} className="flex items-center flex-1 min-w-0 gap-3">
        <div className="relative w-[60px] h-[90px] shrink-0">
          <Image
            src={item.posterUrl}
            alt={item.title}
            fill
            className="object-cover rounded"
            sizes="60px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-text-primary line-clamp-2">
            {item.title}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {item.genre} · {item.runtime}分
          </p>
        </div>
      </Link>
      {showAddButton && (
        <button
          type="button"
          onClick={onAddPress}
          className={cn(
            'ml-2 text-accent font-semibold text-sm shrink-0',
            'hover:text-accent-hover transition-colors',
          )}
        >
          追加
        </button>
      )}
    </div>
  );
}

export const ContentCard = memo(ContentCardInner);
