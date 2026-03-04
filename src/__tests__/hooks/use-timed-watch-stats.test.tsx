import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// --- Mocks ---

const mockUser = { id: 'user-1', email: 'test@test.com' };

vi.mock('@/context/auth-context', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/hooks/use-supabase', () => ({
  useSupabaseClient: () => ({}),
}));

const mockTimedStats = { thisMonth: 5, thisYear: 20 };

const mockWatchlistApi = {
  fetchTimedWatchStats: vi.fn().mockResolvedValue(mockTimedStats),
  fetchWatchlist: vi.fn(),
  fetchWatchlistItem: vi.fn(),
  addWatchlistItem: vi.fn(),
  updateWatchlistItem: vi.fn(),
  removeWatchlistItem: vi.fn(),
  fetchWatchlistStats: vi.fn(),
};

vi.mock('@/lib/watchlist', () => ({
  createWatchlistApi: () => mockWatchlistApi,
  watchlistKeys: {
    all: ['watchlist'],
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

describe('useTimedWatchStats', () => {
  it('今月と今年の視聴数を取得する', async () => {
    const { useTimedWatchStats } = await import(
      '@/hooks/use-timed-watch-stats'
    );
    const { result } = renderHook(() => useTimedWatchStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockWatchlistApi.fetchTimedWatchStats).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockTimedStats);
  });
});
