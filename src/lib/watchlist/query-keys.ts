import type { WatchStatus } from '@/types';

export const watchlistKeys = {
  all: ['watchlist'] as const,
  lists: () => [...watchlistKeys.all, 'list'] as const,
  list: (status?: WatchStatus) =>
    [...watchlistKeys.lists(), { status }] as const,
  detail: (tmdbId: number) => [...watchlistKeys.all, 'detail', tmdbId] as const,
  stats: () => [...watchlistKeys.all, 'stats'] as const,
};
