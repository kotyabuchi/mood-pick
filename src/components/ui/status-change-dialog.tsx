'use client';

import { useCallback, useState } from 'react';
import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  PlayIcon,
  TrashIcon,
  XCircleIcon,
  XIcon,
} from '@phosphor-icons/react/ssr';
import * as Dialog from '@radix-ui/react-dialog';

import {
  useRemoveFromWatchlist,
  useUpdateWatchlistStatus,
} from '@/hooks/use-watchlist-mutations';
import { cn } from '@/lib/cn';

import type { WatchStatus } from '@/types';

const STATUS_OPTIONS = [
  { id: 'watching', label: '視聴中にする', icon: PlayIcon },
  { id: 'watched', label: '見終わった', icon: CheckCircleIcon },
  { id: 'dropped', label: '合わなくてやめた', icon: XCircleIcon },
  { id: 'want', label: '見たいに戻す', icon: ArrowCounterClockwiseIcon },
  { id: 'remove', label: 'リストから削除', icon: TrashIcon },
] as const;

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tmdbId: number;
  currentStatus?: WatchStatus;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  tmdbId,
  currentStatus,
}: StatusChangeDialogProps) {
  const updateStatus = useUpdateWatchlistStatus();
  const removeItem = useRemoveFromWatchlist();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredOptions = STATUS_OPTIONS.filter(
    (option) => option.id !== currentStatus,
  );

  const handleSelect = useCallback(
    async (optionId: string) => {
      setIsSubmitting(true);
      setError(null);
      try {
        if (optionId === 'remove') {
          await removeItem.mutateAsync(tmdbId);
        } else if (optionId === 'watching') {
          await updateStatus.mutateAsync({
            tmdbId,
            updates: {
              status: 'watching',
              watched_at: null,
              dropped_at: null,
            },
          });
        } else if (optionId === 'watched') {
          await updateStatus.mutateAsync({
            tmdbId,
            updates: {
              status: 'watched',
              watched_at: new Date().toISOString(),
              dropped_at: null,
            },
          });
        } else if (optionId === 'dropped') {
          await updateStatus.mutateAsync({
            tmdbId,
            updates: {
              status: 'dropped',
              dropped_at: new Date().toISOString(),
              watched_at: null,
            },
          });
        } else if (optionId === 'want') {
          await updateStatus.mutateAsync({
            tmdbId,
            updates: {
              status: 'want',
              watched_at: null,
              dropped_at: null,
            },
          });
        }
        onOpenChange(false);
      } catch {
        setError('ステータスの変更に失敗しました。もう一度お試しください。');
      } finally {
        setIsSubmitting(false);
      }
    },
    [tmdbId, updateStatus, removeItem, onOpenChange],
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:max-w-sm lg:rounded-xl bg-surface rounded-t-2xl px-6 pt-6 pb-8 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom lg:data-[state=open]:slide-in-from-bottom-0 lg:data-[state=open]:fade-in">
          <Dialog.Close className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
            <XIcon size={20} />
          </Dialog.Close>

          <Dialog.Title className="text-lg font-bold text-text-primary mb-4 text-center">
            ステータス変更
          </Dialog.Title>

          {error && (
            <p className="text-xs text-error text-center mb-3">{error}</p>
          )}

          <div className="space-y-0">
            {filteredOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  disabled={isSubmitting}
                  className={cn(
                    'flex items-center w-full py-3 border-b border-border text-sm transition-colors',
                    'hover:bg-surface-light disabled:opacity-50',
                    option.id === 'remove' ? 'text-error' : 'text-text-primary',
                  )}
                >
                  <Icon size={20} className="mr-3" />
                  {option.label}
                </button>
              );
            })}
          </div>

          <Dialog.Close asChild>
            <button
              type="button"
              className="w-full mt-4 py-3 rounded-lg border border-border text-sm font-semibold text-text-secondary hover:bg-surface-light transition-colors"
            >
              キャンセル
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
