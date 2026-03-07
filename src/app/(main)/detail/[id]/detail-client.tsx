'use client';

import { useCallback, useRef, useState } from 'react';
import { AlertCircle, ChevronLeft, Ellipsis } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AddToWatchlistDialog } from '@/components/ui/add-to-watchlist-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { MoodChip } from '@/components/ui/mood-chip';
import { DetailSkeleton, FORCE_SKELETON } from '@/components/ui/skeletons';
import { StatusChangeDialog } from '@/components/ui/status-change-dialog';
import { StreamingBadge } from '@/components/ui/streaming-badge';
import { WatchProvidersSheet } from '@/components/ui/watch-providers-sheet';
import { Moods } from '@/constants/theme';
import { useContentDetail } from '@/hooks/use-content-detail';
import { useWatchlistItem } from '@/hooks/use-watchlist';
import { useUpdateMemo } from '@/hooks/use-watchlist-mutations';
import { cn } from '@/lib/cn';

import type { ContentType, MoodId } from '@/types';

interface DetailClientProps {
  tmdbId: number;
  contentType: string;
}

export function DetailClient({ tmdbId, contentType }: DetailClientProps) {
  const router = useRouter();
  const type = (contentType === 'tv' ? 'tv' : 'movie') as ContentType;

  const { content, isLoading: tmdbLoading } = useContentDetail(tmdbId, type);
  const { data: watchlistData, isLoading: watchlistLoading } =
    useWatchlistItem(tmdbId);
  const updateMemo = useUpdateMemo();

  const item = content ?? watchlistData;
  const watchlistItem = watchlistData;

  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [watchProvidersOpen, setWatchProvidersOpen] = useState(false);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleStatusAction = useCallback(() => {
    if (!item) return;
    if (watchlistItem) {
      setStatusDialogOpen(true);
    } else {
      setAddDialogOpen(true);
    }
  }, [item, watchlistItem]);

  const memoRef = useRef<HTMLTextAreaElement>(null);

  const handleMemoBlur = useCallback(() => {
    if (watchlistItem && memoRef.current) {
      updateMemo.mutate({
        tmdbId,
        memo: memoRef.current.value || null,
      });
    }
  }, [watchlistItem, tmdbId, updateMemo]);

  if (FORCE_SKELETON || tmdbLoading || (watchlistLoading && !item)) {
    // TEMP: skeleton debug
    return <DetailSkeleton />;
  }

  if (!item) {
    return (
      <div>
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={handleBack}
            data-testid="back-button"
            className="text-text-primary hover:text-text-secondary"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        <EmptyState icon={AlertCircle} title="作品が見つかりません" />
      </div>
    );
  }

  const statusLabel = (() => {
    if (!watchlistItem) return '見たいに追加';
    switch (watchlistItem.status) {
      case 'want':
        return '視聴開始';
      case 'watching':
        return '途中まで見た';
      case 'watched':
      case 'dropped':
        return 'もう一度見る';
      default:
        return '見たいに追加';
    }
  })();

  const moodChips = Moods.filter((m) => item.moodTags.includes(m.id as MoodId));

  return (
    <div className="relative min-h-screen">
      <div className="pb-20">
        {/* ポスター + グラデーション */}
        <div className="relative">
          <div className="relative w-full aspect-[2/3] max-h-[60vh] overflow-hidden">
            <Image
              src={item.posterUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
          {/* グラデーションオーバーレイ */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

          {/* ヘッダーオーバーレイ */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={handleBack}
              data-testid="back-button"
              className="text-white hover:text-text-secondary bg-black/30 rounded-full p-1"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                data-testid="menu-button"
                className="text-white hover:text-text-secondary bg-black/30 rounded-full p-1"
              >
                <Ellipsis size={24} />
              </button>
              {menuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 appearance-none bg-transparent border-none cursor-default"
                    onClick={() => setMenuOpen(false)}
                    aria-label="メニューを閉じる"
                  />
                  <div className="absolute right-0 top-10 bg-surface rounded-lg shadow-lg z-50 min-w-[160px]">
                    {watchlistItem && (
                      <>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-surface-light"
                          onClick={() => {
                            setMenuOpen(false);
                            setStatusDialogOpen(true);
                          }}
                        >
                          ステータス変更
                        </button>
                        <div className="border-t border-border" />
                      </>
                    )}
                    <Link
                      href={`/recommend/${item.id}`}
                      className="block px-4 py-3 text-sm text-text-primary hover:bg-surface-light"
                      onClick={() => setMenuOpen(false)}
                    >
                      友達におすすめ
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* コンテンツ情報 */}
        <div className="px-4 -mt-4 relative z-10 max-w-4xl mx-auto lg:px-0">
          <h1 className="text-2xl font-bold text-text-primary">{item.title}</h1>

          <p className="text-xs text-text-secondary mt-1">
            {[item.year, item.genre, item.runtime ? `${item.runtime}分` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>

          {/* 配信サービスバッジ */}
          <div className="flex flex-wrap gap-2 mt-3">
            {item.streaming.map((s) => (
              <StreamingBadge
                key={s.service}
                service={s.service}
                expiresAt={s.expiresAt}
                size="md"
              />
            ))}
          </div>

          {/* MOODS */}
          {moodChips.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-text-secondary mb-2">
                MOODS
              </p>
              <div className="flex flex-wrap gap-2">
                {moodChips.map((mood) => (
                  <MoodChip
                    key={mood.id}
                    mood={{
                      id: mood.id,
                      icon: mood.icon,
                      label: mood.shortLabel,
                    }}
                    selected
                    onPress={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {/* あらすじ */}
          <div className="mt-4">
            <h2 className="text-lg font-bold text-text-primary mb-2">
              あらすじ
            </h2>
            <p
              className={cn(
                'text-sm text-text-secondary leading-relaxed',
                !synopsisExpanded && 'line-clamp-3',
              )}
            >
              {item.synopsis}
            </p>
            {!synopsisExpanded && (
              <button
                type="button"
                onClick={() => setSynopsisExpanded(true)}
                className="text-xs text-accent mt-1 hover:text-accent-hover"
              >
                もっと見る
              </button>
            )}
          </div>

          {/* メモ */}
          <div className="mt-4">
            <h2 className="text-lg font-bold text-text-primary mb-2">メモ</h2>
            <textarea
              ref={memoRef}
              className="w-full bg-surface-light rounded-lg p-3 text-sm text-text-primary placeholder:text-text-disabled outline-none resize-none"
              placeholder="この作品についてのメモを残す..."
              rows={3}
              defaultValue={watchlistItem?.memo ?? ''}
              onBlur={handleMemoBlur}
            />
          </div>
        </div>
      </div>

      {/* 固定ボトムバー */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 bg-surface border-t border-border px-4 py-3 flex gap-3 z-30">
        <button
          type="button"
          onClick={handleStatusAction}
          className="flex-1 py-3 rounded-lg border border-border text-sm font-semibold text-text-primary hover:bg-surface-light transition-colors"
        >
          {statusLabel}
        </button>
        <button
          type="button"
          onClick={() => setWatchProvidersOpen(true)}
          className="flex-1 py-3 rounded-lg bg-accent text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          今すぐ見る
        </button>
      </div>

      <AddToWatchlistDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        content={item}
      />

      {watchlistItem && (
        <StatusChangeDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          tmdbId={tmdbId}
          currentStatus={watchlistItem.status}
        />
      )}

      {watchProvidersOpen && (
        <WatchProvidersSheet
          open={watchProvidersOpen}
          onOpenChange={setWatchProvidersOpen}
          tmdbId={tmdbId}
          contentType={type === 'anime' ? 'tv' : type}
        />
      )}
    </div>
  );
}
