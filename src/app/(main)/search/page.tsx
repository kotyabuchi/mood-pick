'use client';

import { useCallback, useState } from 'react';
import { Search, SearchX, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AddToWatchlistDialog } from '@/components/ui/add-to-watchlist-dialog';
import { AttentionChip } from '@/components/ui/attention-chip';
import { ContentCard } from '@/components/ui/content-card';
import { DurationChip } from '@/components/ui/duration-chip';
import { EmptyState } from '@/components/ui/empty-state';
import { MoodChip } from '@/components/ui/mood-chip';
import { SectionDivider } from '@/components/ui/section-divider';
import { ContentCardSkeleton, FORCE_SKELETON } from '@/components/ui/skeletons';
import { AttentionLevels, Durations, Moods } from '@/constants/theme';
import { useDebounce } from '@/hooks/use-debounce';
import { useTmdbSearch } from '@/hooks/use-tmdb-search';
import { cn } from '@/lib/cn';

import type { AttentionLevelId, Content, DurationId, MoodId } from '@/types';

export default function SearchPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<MoodId[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<DurationId | null>(
    null,
  );
  const [selectedAttention, setSelectedAttention] =
    useState<AttentionLevelId | null>(null);

  const [addDialogContent, setAddDialogContent] = useState<Content | null>(
    null,
  );

  const debouncedQuery = useDebounce(searchQuery, 300);
  const isTextMode = searchQuery.length > 0;
  const { results, isLoading, error } = useTmdbSearch(debouncedQuery);

  const handleMoodToggle = useCallback((moodId: MoodId) => {
    setSelectedMoods((prev) =>
      prev.includes(moodId)
        ? prev.filter((m) => m !== moodId)
        : [...prev, moodId],
    );
  }, []);

  const handleDurationToggle = useCallback((durationId: DurationId) => {
    setSelectedDuration((prev) => (prev === durationId ? null : durationId));
  }, []);

  const handleAttentionToggle = useCallback((attentionId: AttentionLevelId) => {
    setSelectedAttention((prev) => (prev === attentionId ? null : attentionId));
  }, []);

  const handleSearch = useCallback(() => {
    if (selectedMoods.length === 0) return;
    const params = new URLSearchParams();
    params.set('moods', selectedMoods.join(','));
    if (selectedDuration) params.set('duration', selectedDuration);
    if (selectedAttention) params.set('attention', selectedAttention);
    router.push(`/results?${params.toString()}`);
  }, [selectedMoods, selectedDuration, selectedAttention, router]);

  return (
    <div className="max-w-4xl mx-auto relative min-h-screen">
      {/* 検索入力 */}
      <div className="px-4 pt-4 pb-2 lg:px-0 lg:pt-6">
        <div className="flex items-center bg-surface-light rounded-lg px-3 py-2.5">
          <Search size={20} className="text-text-disabled shrink-0" />
          <input
            type="text"
            className="flex-1 ml-2 bg-transparent text-sm text-text-primary placeholder:text-text-disabled outline-none"
            placeholder="タイトルで探す..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-text-disabled hover:text-text-secondary"
            >
              <XCircle size={20} />
            </button>
          )}
        </div>
      </div>

      {isTextMode ? (
        <div className="px-4 space-y-1 pb-8 lg:px-0">
          {(FORCE_SKELETON || isLoading) && ( // TEMP: skeleton debug
            <div className="space-y-1 animate-pulse" data-testid="skeleton">
              <ContentCardSkeleton />
              <ContentCardSkeleton />
              <ContentCardSkeleton />
            </div>
          )}
          {error && (
            <p className="text-center text-sm text-error py-12">
              検索中にエラーが発生しました
            </p>
          )}
          {!isLoading &&
            !error &&
            results.length === 0 &&
            debouncedQuery.length >= 2 && (
              <EmptyState
                icon={SearchX}
                title={`「${debouncedQuery}」に一致する作品が見つかりません`}
                description="別のキーワードで検索してみてください"
              />
            )}
          {results.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              variant="list-item"
              showAddButton
              onAddPress={() => setAddDialogContent(item)}
            />
          ))}
        </div>
      ) : (
        <div className="px-4 pb-24 lg:px-0">
          <SectionDivider label="または" />

          <div className="mt-2">
            <h2 className="text-lg font-bold text-text-primary mb-3">気分</h2>
            <div className="flex flex-wrap gap-2">
              {Moods.map((mood) => (
                <MoodChip
                  key={mood.id}
                  mood={{
                    id: mood.id,
                    emoji: mood.emoji,
                    label: mood.shortLabel,
                  }}
                  selected={selectedMoods.includes(mood.id as MoodId)}
                  onPress={() => handleMoodToggle(mood.id as MoodId)}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">時間</h2>
            <div className="flex flex-wrap gap-2">
              {Durations.map((d) => (
                <DurationChip
                  key={d.id}
                  item={{ id: d.id, label: d.label }}
                  selected={selectedDuration === d.id}
                  onPress={() => handleDurationToggle(d.id as DurationId)}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">集中度</h2>
            <div className="flex flex-wrap gap-2">
              {AttentionLevels.map((a) => (
                <AttentionChip
                  key={a.id}
                  item={{ id: a.id, label: a.label }}
                  selected={selectedAttention === a.id}
                  onPress={() =>
                    handleAttentionToggle(a.id as AttentionLevelId)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 検索ボタン（気分モード時のみ） */}
      {!isTextMode && (
        <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 px-4 pb-4 pt-2 bg-background lg:sticky lg:px-0">
          <button
            type="button"
            onClick={handleSearch}
            disabled={selectedMoods.length === 0}
            className={cn(
              'w-full py-3 rounded-lg text-sm font-semibold transition-colors',
              selectedMoods.length > 0
                ? 'bg-accent text-white hover:bg-accent-hover'
                : 'bg-surface-light text-text-disabled cursor-not-allowed',
            )}
          >
            作品を探す
          </button>
        </div>
      )}

      <AddToWatchlistDialog
        open={!!addDialogContent}
        onOpenChange={(open) => !open && setAddDialogContent(null)}
        content={addDialogContent}
      />
    </div>
  );
}
