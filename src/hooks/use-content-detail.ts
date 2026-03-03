'use client';

import { useQuery } from '@tanstack/react-query';

import { getMovieDetail, getTvDetail } from '@/lib/tmdb';

import type { Content, ContentType } from '@/types';

interface UseContentDetailResult {
  content: Content | null;
  isLoading: boolean;
  error: Error | null;
}

export function useContentDetail(
  tmdbId: number | null,
  type: ContentType | null,
): UseContentDetailResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tmdb-detail', tmdbId, type],
    queryFn: ({ signal }) => {
      if (!tmdbId || !type) return null;
      const fetchFn = type === 'movie' ? getMovieDetail : getTvDetail;
      return fetchFn(tmdbId, signal);
    },
    enabled: !!tmdbId && !!type,
    staleTime: 10 * 60 * 1000,
  });

  return {
    content: data ?? null,
    isLoading,
    error: error as Error | null,
  };
}
