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

const mockUpdatedProfile: ProfileRow = {
  id: 'user-1',
  name: '新しい名前',
  handle: 'new_handle',
  avatar_url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

const mockProfileApi = {
  updateProfile: vi.fn().mockResolvedValue(mockUpdatedProfile),
  checkHandleAvailable: vi.fn().mockResolvedValue(true),
  uploadAvatar: vi
    .fn()
    .mockResolvedValue('https://example.supabase.co/avatars/user-1/avatar.jpg'),
};

vi.mock('@/lib/profile', () => ({
  createProfileApi: () => mockProfileApi,
  profileKeys: {
    all: ['profile'],
    own: (userId: string) => ['profile', 'own', userId],
  },
}));

vi.mock('@/lib/follows', () => ({
  followKeys: {
    all: ['follows'],
  },
}));

// QueryClient wrapper
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { ReactNode } from 'react';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// --- Tests ---

describe('useUpdateProfile', () => {
  it('プロフィールを更新する', async () => {
    const { useUpdateProfile } = await import('@/hooks/use-profile-mutations');
    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ name: '新しい名前', handle: 'new_handle' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockProfileApi.updateProfile).toHaveBeenCalledWith('user-1', {
      name: '新しい名前',
      handle: 'new_handle',
    });
  });
});

describe('useUploadAvatar', () => {
  it('アバターをアップロードして URL を返す', async () => {
    const { useUploadAvatar } = await import('@/hooks/use-profile-mutations');
    const { result } = renderHook(() => useUploadAvatar(), {
      wrapper: createWrapper(),
    });

    const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });
    result.current.mutate(file);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockProfileApi.uploadAvatar).toHaveBeenCalledWith('user-1', file);
    expect(result.current.data).toBe(
      'https://example.supabase.co/avatars/user-1/avatar.jpg',
    );
  });
});

describe('useCheckHandle', () => {
  it('ハンドルが使用可能か確認する', async () => {
    const { useCheckHandle } = await import('@/hooks/use-profile-mutations');
    const { result } = renderHook(() => useCheckHandle(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('new_handle');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockProfileApi.checkHandleAvailable).toHaveBeenCalledWith(
      'new_handle',
      'user-1',
    );
    expect(result.current.data).toBe(true);
  });
});
