import { useQuery } from '@tanstack/react-query';

import { getWatchProviders } from '@/lib/tmdb/client';

export function useWatchProviders(tmdbId: number, type: 'movie' | 'tv') {
  return useQuery({
    queryKey: ['tmdb', 'watch-providers', type, tmdbId],
    queryFn: ({ signal }) => getWatchProviders(tmdbId, type, signal),
    staleTime: 60 * 60 * 1000,
  });
}
