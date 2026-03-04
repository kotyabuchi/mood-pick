'use client';

import { Suspense, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { ContentCard } from '@/components/ui/content-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ContentCardSkeleton, FORCE_SKELETON } from '@/components/ui/skeletons';
import { Durations } from '@/constants/theme';
import { useWatchlist } from '@/hooks/use-watchlist';

import type { AttentionLevelId, DurationId, MoodId } from '@/types';

function ResultsContentSkeleton() {
  return (
    <div
      className="px-4 pb-8 lg:px-0 space-y-2 animate-pulse"
      data-testid="skeleton"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <ContentCardSkeleton key={`result-${i.toString()}`} />
      ))}
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const moods = searchParams.get('moods');
  const duration = searchParams.get('duration');
  const attention = searchParams.get('attention');

  const { data: wantItems = [], isLoading } = useWatchlist('want');

  const moodIds = useMemo(
    () => (moods ? (moods.split(',') as MoodId[]) : []),
    [moods],
  );

  const maxMinutes = useMemo(() => {
    const d = Durations.find((d) => d.id === (duration as DurationId));
    return d?.minutes ?? Number.POSITIVE_INFINITY;
  }, [duration]);

  const attentionFilter = attention as AttentionLevelId | undefined;

  const results = useMemo(
    () =>
      wantItems.filter((item) => {
        if (
          moodIds.length > 0 &&
          !moodIds.some((mood) => item.moodTags.includes(mood))
        )
          return false;
        if (item.runtime > maxMinutes) return false;
        if (attentionFilter && item.attentionLevel !== attentionFilter)
          return false;
        return true;
      }),
    [wantItems, moodIds, maxMinutes, attentionFilter],
  );

  if (FORCE_SKELETON || isLoading) {
    // TEMP: skeleton debug
    return <ResultsContentSkeleton />;
  }

  return (
    <>
      <div className="px-4 pb-2 lg:px-0">
        <p className="text-xs text-text-secondary">{results.length}件ヒット</p>
      </div>

      <div className="px-4 pb-8 lg:px-0 space-y-2">
        {results.length === 0 ? (
          <EmptyState
            icon={Search}
            title="一致する作品がありません"
            description="別の条件で作品を追加してみてください"
          />
        ) : (
          results.map((item) => (
            <ContentCard
              key={item.watchlistId}
              item={item}
              variant="horizontal"
            />
          ))
        )}
      </div>
    </>
  );
}

export default function ResultsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <ScreenHeader title="検索結果" showBack />
      <Suspense fallback={<ResultsContentSkeleton />}>
        <ResultsContent />
      </Suspense>
    </div>
  );
}
