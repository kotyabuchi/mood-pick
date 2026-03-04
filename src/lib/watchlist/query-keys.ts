import type { WatchlistSortOption, WatchStatus } from '@/types';

export const watchlistKeys = {
  all: ['watchlist'] as const,
  lists: () => [...watchlistKeys.all, 'list'] as const,
  list: (status?: WatchStatus, sortBy?: WatchlistSortOption) =>
    [...watchlistKeys.lists(), { status, sortBy }] as const,
  detail: (tmdbId: number) => [...watchlistKeys.all, 'detail', tmdbId] as const,
  stats: () => [...watchlistKeys.all, 'stats'] as const,
  timedStats: () => [...watchlistKeys.all, 'timedStats'] as const,
};
