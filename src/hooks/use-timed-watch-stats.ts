'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useSupabaseClient } from './use-supabase';

import { useAuth } from '@/context/auth-context';
import { createWatchlistApi, watchlistKeys } from '@/lib/watchlist';

export function useTimedWatchStats() {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createWatchlistApi(supabase), [supabase]);

  return useQuery({
    queryKey: watchlistKeys.timedStats(),
    queryFn: () => api.fetchTimedWatchStats(),
    enabled: !!user,
  });
}
