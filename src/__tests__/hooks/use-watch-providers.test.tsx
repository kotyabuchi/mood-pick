import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';
import type { TmdbWatchProviderRegion } from '@/types/tmdb';

// --- Mocks ---

const mockRegion: TmdbWatchProviderRegion = {
  link: 'https://www.themoviedb.org/movie/550/watch?locale=JP',
  flatrate: [
    {
      logo_path: '/netflix.png',
      provider_id: 8,
      provider_name: 'Netflix',
      display_priority: 1,
    },
  ],
};

const mockGetWatchProviders = vi.fn().mockResolvedValue(mockRegion);

vi.mock('@/lib/tmdb/client', () => ({
  getWatchProviders: (...args: unknown[]) => mockGetWatchProviders(...args),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// --- Tests ---

describe('useWatchProviders', () => {
  it('データ取得成功時に TmdbWatchProviderRegion を返す', async () => {
    const { useWatchProviders } = await import('@/hooks/use-watch-providers');
    const { result } = renderHook(() => useWatchProviders(550, 'movie'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockRegion);
    expect(mockGetWatchProviders).toHaveBeenCalledWith(
      550,
      'movie',
      expect.any(AbortSignal),
    );
  });

  it('query key が正しい形式である', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { useWatchProviders } = await import('@/hooks/use-watch-providers');
    renderHook(() => useWatchProviders(123, 'tv'), { wrapper });

    await waitFor(() => {
      const cache = queryClient.getQueryCache().findAll();
      const keys = cache.map((q) => q.queryKey);
      expect(keys).toContainEqual(['tmdb', 'watch-providers', 'tv', 123]);
    });
  });

  it('getWatchProviders が null を返した場合 data が null', async () => {
    mockGetWatchProviders.mockResolvedValueOnce(null);

    const { useWatchProviders } = await import('@/hooks/use-watch-providers');
    const { result } = renderHook(() => useWatchProviders(999, 'movie'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });

  it('getWatchProviders がエラーの場合 isError が true', async () => {
    mockGetWatchProviders.mockRejectedValueOnce(new Error('API Error'));

    const { useWatchProviders } = await import('@/hooks/use-watch-providers');
    const { result } = renderHook(() => useWatchProviders(888, 'tv'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
