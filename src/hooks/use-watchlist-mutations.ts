'use client';

import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabaseClient } from './use-supabase';

import {
  createWatchlistApi,
  mapContentToInsertRow,
  watchlistKeys,
} from '@/lib/watchlist';

import type { Content, WatchlistItem, WatchStatus } from '@/types';
import type { WatchlistItemUpdate } from '@/types/database';

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createWatchlistApi(supabase), [supabase]);

  return useMutation({
    mutationFn: ({
      content,
      status = 'want',
    }: {
      content: Content;
      status?: WatchStatus;
    }) => api.addWatchlistItem(mapContentToInsertRow(content, status)),
    onMutate: async ({ content, status = 'want' }) => {
      await queryClient.cancelQueries({ queryKey: watchlistKeys.all });
      const prev = queryClient.getQueryData<WatchlistItem[]>(
        watchlistKeys.list(status),
      );
      const optimistic: WatchlistItem = {
        ...content,
        watchlistId: `temp-${Date.now()}`,
        status,
        memo: null,
        rating: null,
        review: null,
        watchedAt: null,
        droppedAt: null,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<WatchlistItem[]>(
        watchlistKeys.list(status),
        (old) => [optimistic, ...(old ?? [])],
      );
      return { prev, status };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(
          watchlistKeys.list(context.status),
          context.prev,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
    },
  });
}

export function useUpdateWatchlistStatus() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createWatchlistApi(supabase), [supabase]);

  return useMutation({
    mutationFn: ({
      tmdbId,
      updates,
    }: {
      tmdbId: number;
      updates: WatchlistItemUpdate;
    }) => api.updateWatchlistItem(tmdbId, updates),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
    },
  });
}

export function useUpdateMemo() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createWatchlistApi(supabase), [supabase]);

  return useMutation({
    mutationFn: ({ tmdbId, memo }: { tmdbId: number; memo: string | null }) =>
      api.updateWatchlistItem(tmdbId, { memo }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createWatchlistApi(supabase), [supabase]);

  return useMutation({
    mutationFn: (tmdbId: number) => api.removeWatchlistItem(tmdbId),
    onMutate: async (tmdbId) => {
      await queryClient.cancelQueries({ queryKey: watchlistKeys.all });
      const prevQueries = queryClient.getQueriesData<WatchlistItem[]>({
        queryKey: watchlistKeys.lists(),
      });
      queryClient.setQueriesData<WatchlistItem[]>(
        { queryKey: watchlistKeys.lists() },
        (old) => old?.filter((i) => i.tmdbId !== tmdbId) ?? [],
      );
      return { prevQueries };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        for (const [queryKey, data] of context.prevQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
    },
  });
}
