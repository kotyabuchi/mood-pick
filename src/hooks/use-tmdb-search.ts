'use client';

import { useQuery } from '@tanstack/react-query';

import { searchMulti } from '@/lib/tmdb';

import type { Content } from '@/types';

interface UseTmdbSearchResult {
  results: Content[];
  isLoading: boolean;
  error: Error | null;
}

export function useTmdbSearch(query: string): UseTmdbSearchResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tmdb-search', query],
    queryFn: ({ signal }) => searchMulti(query, 1, signal),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000,
  });

  return {
    results: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}
