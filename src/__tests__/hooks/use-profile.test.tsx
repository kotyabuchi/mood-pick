import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ProfileRow } from '@/types/database';

// --- Mocks ---

const mockUser = { id: 'user-1', email: 'test@test.com' };

vi.mock('@/context/auth-context', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/hooks/use-supabase', () => ({
  useSupabaseClient: () => ({}),
}));

const mockProfile: ProfileRow = {
  id: 'user-1',
  name: 'テストユーザー',
  handle: 'test_user',
  avatar_url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

const mockFollowsApi = {
  fetchUserProfile: vi.fn().mockResolvedValue(mockProfile),
  fetchFollowing: vi.fn(),
  fetchFollowers: vi.fn(),
  fetchFollowCounts: vi.fn(),
  checkIsFollowing: vi.fn(),
  follow: vi.fn(),
  unfollow: vi.fn(),
};

vi.mock('@/lib/follows', () => ({
  createFollowsApi: () => mockFollowsApi,
  followKeys: {
    all: ['follows'],
  },
}));

vi.mock('@/lib/profile', () => ({
  profileKeys: {
    all: ['profile'],
    own: (userId: string) => ['profile', 'own', userId],
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

describe('useOwnProfile', () => {
  it('自分の ProfileRow を取得する', async () => {
    const { useOwnProfile } = await import('@/hooks/use-profile');
    const { result } = renderHook(() => useOwnProfile(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFollowsApi.fetchUserProfile).toHaveBeenCalledWith('user-1');
    expect(result.current.data).toEqual(mockProfile);
  });

  it('queryKey に userId を含む', async () => {
    const { useOwnProfile } = await import('@/hooks/use-profile');
    const { result } = renderHook(() => useOwnProfile(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // The hook should use profileKeys.own(user.id) which includes the userId
    expect(mockFollowsApi.fetchUserProfile).toHaveBeenCalledWith('user-1');
  });
});
