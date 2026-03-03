import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { User } from '@/types';

// --- Mocks ---

const mockUser = { id: 'viewer-1', email: 'test@test.com' };

vi.mock('@/context/auth-context', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/hooks/use-supabase', () => ({
  useSupabaseClient: () => ({}),
}));

const mockFollowingUsers: User[] = [
  {
    id: 'user-1',
    name: 'User 1',
    handle: 'user1',
    avatarUrl: null,
    followingCount: 0,
    followerCount: 0,
    isFollowing: true,
  },
];

const mockApi = {
  fetchFollowing: vi.fn().mockResolvedValue(mockFollowingUsers),
  fetchFollowers: vi.fn().mockResolvedValue([]),
  fetchFollowCounts: vi
    .fn()
    .mockResolvedValue({ followingCount: 5, followerCount: 10 }),
  checkIsFollowing: vi.fn().mockResolvedValue(true),
  follow: vi.fn().mockResolvedValue(undefined),
  unfollow: vi.fn().mockResolvedValue(undefined),
  fetchUserProfile: vi.fn().mockResolvedValue(null),
};

vi.mock('@/lib/follows', () => ({
  createFollowsApi: () => mockApi,
  followKeys: {
    all: ['follows'],
    following: (userId: string) => ['follows', 'following', userId],
    followers: (userId: string) => ['follows', 'followers', userId],
    counts: (userId: string) => ['follows', 'counts', userId],
    isFollowing: (viewerId: string, targetId: string) => [
      'follows',
      'isFollowing',
      viewerId,
      targetId,
    ],
  },
  mapProfileRowToUser: vi.fn(),
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

describe('useFollowing', () => {
  it('正しい queryKey で API を呼ぶ', async () => {
    const { useFollowing } = await import('@/hooks/use-follows');
    const { result } = renderHook(() => useFollowing('viewer-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.fetchFollowing).toHaveBeenCalledWith('viewer-1');
    expect(result.current.data).toEqual(mockFollowingUsers);
  });
});

describe('useFollowers', () => {
  it('正しい queryKey で API を呼ぶ', async () => {
    const { useFollowers } = await import('@/hooks/use-follows');
    const { result } = renderHook(() => useFollowers('viewer-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.fetchFollowers).toHaveBeenCalledWith('viewer-1', 'viewer-1');
  });
});

describe('useFollowCounts', () => {
  it('count データを取得する', async () => {
    const { useFollowCounts } = await import('@/hooks/use-follows');
    const { result } = renderHook(() => useFollowCounts('viewer-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      followingCount: 5,
      followerCount: 10,
    });
  });
});

describe('useIsFollowing', () => {
  it('viewerId を含む queryKey を使う', async () => {
    const { useIsFollowing } = await import('@/hooks/use-follows');
    const { result } = renderHook(() => useIsFollowing('target-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.checkIsFollowing).toHaveBeenCalledWith(
      'viewer-1',
      'target-1',
    );
    expect(result.current.data).toBe(true);
  });
});
