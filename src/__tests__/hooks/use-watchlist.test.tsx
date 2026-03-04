import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WatchlistItem } from '@/types';

// --- Mocks ---

const mockUser = { id: 'user-1', email: 'test@test.com' };

vi.mock('@/context/auth-context', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/hooks/use-supabase', () => ({
  useSupabaseClient: () => ({}),
}));

const mockItems: WatchlistItem[] = [
  {
    id: 'tmdb-movie-1',
    watchlistId: 'wl-1',
    tmdbId: 1,
    title: 'テスト映画',
    type: 'movie',
    posterUrl: '/poster.jpg',
    year: 2024,
    genre: 'アクション',
    runtime: 120,
    synopsis: 'テスト',
    moodTags: ['excited'],
    attentionLevel: 'focused',
    streaming: [],
    status: 'want',
    memo: null,
    rating: null,
    review: null,
    watchedAt: null,
    droppedAt: null,
    createdAt: '2025-01-01T00:00:00Z',
  },
];

const mockFetchWatchlist = vi.fn().mockResolvedValue(mockItems);

const mockWatchlistApi = {
  fetchWatchlist: mockFetchWatchlist,
  fetchWatchlistItem: vi.fn(),
  addWatchlistItem: vi.fn(),
  updateWatchlistItem: vi.fn(),
  removeWatchlistItem: vi.fn(),
  fetchWatchlistStats: vi.fn(),
  fetchTimedWatchStats: vi.fn(),
};

vi.mock('@/lib/watchlist', () => ({
  createWatchlistApi: () => mockWatchlistApi,
  watchlistKeys: {
    all: ['watchlist'],
    lists: () => ['watchlist', 'list'],
    list: (status?: string, sortBy?: string) => [
      'watchlist',
      'list',
      { status, sortBy },
    ],
    detail: (tmdbId: number) => ['watchlist', 'detail', tmdbId],
    stats: () => ['watchlist', 'stats'],
    timedStats: () => ['watchlist', 'timedStats'],
  },
}));

// QueryClient wrapper
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { ReactNode } from 'react';

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

describe('useWatchlist', () => {
  it('status のみ指定で fetchWatchlist を呼び出す', async () => {
    mockFetchWatchlist.mockClear();
    const { useWatchlist } = await import('@/hooks/use-watchlist');
    const { result } = renderHook(() => useWatchlist('want'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetchWatchlist).toHaveBeenCalledWith('want', {
      sortBy: undefined,
    });
    expect(result.current.data).toEqual(mockItems);
  });

  it('sortBy を渡すと fetchWatchlist に sortBy が渡される', async () => {
    mockFetchWatchlist.mockClear();
    const { useWatchlist } = await import('@/hooks/use-watchlist');
    const { result } = renderHook(
      () => useWatchlist('watched', { sortBy: 'watched_at' }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetchWatchlist).toHaveBeenCalledWith('watched', {
      sortBy: 'watched_at',
    });
  });

  it('sortBy=title を渡すと fetchWatchlist に title が渡される', async () => {
    mockFetchWatchlist.mockClear();
    const { useWatchlist } = await import('@/hooks/use-watchlist');
    const { result } = renderHook(
      () => useWatchlist('want', { sortBy: 'title' }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetchWatchlist).toHaveBeenCalledWith('want', {
      sortBy: 'title',
    });
  });
});
