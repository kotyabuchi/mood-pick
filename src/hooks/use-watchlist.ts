'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useSupabaseClient } from './use-supabase';

import { useAuth } from '@/context/auth-context';
import { createWatchlistApi, watchlistKeys } from '@/lib/watchlist';

import type { WatchStatus } from '@/types';

export function useWatchlist(status?: WatchStatus) {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createWatchlistApi(supabase), [supabase]);

  return useQuery({
    queryKey: watchlistKeys.list(status),
    queryFn: () => api.fetchWatchlist(status),
    enabled: !!user,
  });
}

export function useWatchlistItem(tmdbId: number | null) {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createWatchlistApi(supabase), [supabase]);

  return useQuery({
    queryKey: watchlistKeys.detail(tmdbId ?? 0),
    queryFn: () => api.fetchWatchlistItem(tmdbId!),
    enabled: !!user && tmdbId !== null,
  });
}

export function useWatchlistStats() {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createWatchlistApi(supabase), [supabase]);

  return useQuery({
    queryKey: watchlistKeys.stats(),
    queryFn: () => api.fetchWatchlistStats(),
    enabled: !!user,
  });
}
