import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';
import type { FeedItem } from '@/types';

// --- Mocks ---

const mockUser = { id: 'viewer-1', email: 'test@test.com' };

vi.mock('@/context/auth-context', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/hooks/use-supabase', () => ({
  useSupabaseClient: () => ({}),
}));

const mockFeedItems: FeedItem[] = [
  {
    id: 'act-1',
    user: {
      id: 'user-1',
      name: 'テスト',
      handle: 'test',
      avatarUrl: null,
      followingCount: 0,
      followerCount: 0,
    },
    actionType: 'watched',
    content: {
      id: 'tmdb-movie-1',
      tmdbId: 1,
      title: 'テスト映画',
      type: 'movie',
      posterUrl: '',
      year: 2024,
      genre: 'SF',
      runtime: 120,
      synopsis: '',
      moodTags: [],
      attentionLevel: 'casual',
      streaming: [],
    },
    timestamp: '2025-01-01T00:00:00Z',
    rating: 5,
  },
];

const mockApi = {
  fetchFeed: vi.fn().mockResolvedValue(mockFeedItems),
};

vi.mock('@/lib/activity', () => ({
  createActivityApi: () => mockApi,
  feedKeys: {
    all: ['feed'],
    list: () => ['feed', 'list'],
  },
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

describe('useFeed', () => {
  it('フィードデータを取得する', async () => {
    const { useFeed } = await import('@/hooks/use-feed');
    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.fetchFeed).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockFeedItems);
  });
});
