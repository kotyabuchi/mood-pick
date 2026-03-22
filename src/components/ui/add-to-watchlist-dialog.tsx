'use client';

import { useEffect, useOptimistic, useState, useTransition } from 'react';
import { SpinnerGapIcon, XIcon } from '@phosphor-icons/react/ssr';
import * as Dialog from '@radix-ui/react-dialog';

import { MoodChip } from './mood-chip';

import { Moods } from '@/constants/theme';
import { useContentDetail } from '@/hooks/use-content-detail';
import { useAddToWatchlist } from '@/hooks/use-watchlist-mutations';

import type { Content, ContentDetail, ContentType, MoodId } from '@/types';

function isContentDetail(c: Content): c is ContentDetail {
  return 'genre' in c && 'runtime' in c;
}

interface AddToWatchlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content?: Content | null;
  tmdbId?: number | null;
  contentType?: ContentType | null;
}

export function AddToWatchlistDialog({
  open,
  onOpenChange,
  content: providedContent,
  tmdbId,
  contentType,
}: AddToWatchlistDialogProps) {
  const needsFetch = !providedContent || !isContentDetail(providedContent);
  const resolvedTmdbId = providedContent?.tmdbId ?? tmdbId ?? null;
  const resolvedType = providedContent?.type ?? contentType ?? null;
  const { content: fetchedContent, isLoading } = useContentDetail(
    needsFetch ? resolvedTmdbId : null,
    needsFetch ? resolvedType : null,
  );
  const content =
    providedContent && isContentDetail(providedContent)
      ? providedContent
      : fetchedContent;
  const addToWatchlist = useAddToWatchlist();

  const [selectedMoods, setSelectedMoods] = useState<MoodId[]>(
    content?.moodTags ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticError, setOptimisticError] = useOptimistic(error);

  useEffect(() => {
    if (open) {
      setError(null);
      if (content?.moodTags) {
        setSelectedMoods(content.moodTags);
      }
    }
  }, [open, content]);

  const handleMoodToggle = (moodId: MoodId) => {
    setSelectedMoods((prev) =>
      prev.includes(moodId)
        ? prev.filter((m) => m !== moodId)
        : [...prev, moodId],
    );
  };

  const handleAdd = () => {
    if (!content) return;

    startTransition(async () => {
      setOptimisticError(null);

      try {
        await addToWatchlist.mutateAsync({
          content: { ...content, moodTags: selectedMoods },
          status: 'want',
        });
        onOpenChange(false);
      } catch {
        setError('追加に失敗しました。もう一度お試しください。');
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:max-w-md lg:rounded-xl bg-surface rounded-t-2xl px-6 pt-6 pb-8 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom lg:data-[state=open]:slide-in-from-bottom-0 lg:data-[state=open]:fade-in">
          <Dialog.Close className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
            <XIcon size={20} />
          </Dialog.Close>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <SpinnerGapIcon
                size={32}
                className="animate-spin text-accent"
                data-testid="loading-indicator"
              />
            </div>
          ) : !content ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">作品が見つかりません</p>
            </div>
          ) : (
            <>
              <Dialog.Title className="text-lg font-bold text-text-primary mb-2 text-center">
                「見たい」に追加
              </Dialog.Title>
              <Dialog.Description className="text-xs text-text-secondary mb-4 text-center">
                {content.title}
              </Dialog.Description>

              <p className="text-xs font-semibold text-text-secondary mb-2">
                気分タグ（自動判定）
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {Moods.map((mood) => (
                  <MoodChip
                    key={mood.id}
                    mood={{
                      id: mood.id,
                      icon: mood.icon,
                      label: mood.shortLabel,
                    }}
                    selected={selectedMoods.includes(mood.id as MoodId)}
                    onPress={() => handleMoodToggle(mood.id as MoodId)}
                  />
                ))}
              </div>
              <p className="text-[10px] text-text-disabled mb-6">
                ※ タップで変更できます
              </p>

              {optimisticError && (
                <p className="text-xs text-error text-center mb-3">
                  {optimisticError}
                </p>
              )}

              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="flex-1 py-3 rounded-lg border border-border text-sm font-semibold text-text-secondary hover:bg-surface-light transition-colors"
                  >
                    キャンセル
                  </button>
                </Dialog.Close>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isPending}
                  className="flex-1 py-3 rounded-lg bg-accent text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {isPending ? '追加中...' : '追加する'}
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
