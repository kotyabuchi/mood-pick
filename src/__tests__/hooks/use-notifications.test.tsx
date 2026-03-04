import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';
import type { Notification } from '@/types';

// --- Mocks ---

const mockUser = { id: 'user-1', email: 'test@test.com' };

vi.mock('@/context/auth-context', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/hooks/use-supabase', () => ({
  useSupabaseClient: () => ({}),
}));

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'follow',
    title: 'テストさんがあなたをフォローしました',
    timestamp: '2026-03-01T00:00:00Z',
    isRead: false,
    targetId: 'user-2',
  },
];

const mockApi = {
  fetchNotifications: vi.fn().mockResolvedValue(mockNotifications),
  fetchUnreadCount: vi.fn().mockResolvedValue(3),
};

vi.mock('@/lib/notifications', () => ({
  createNotificationsApi: () => mockApi,
  notificationKeys: {
    all: ['notifications'],
    list: () => ['notifications', 'list'],
    unreadCount: () => ['notifications', 'unreadCount'],
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

describe('useNotifications', () => {
  it('通知一覧を取得する', async () => {
    const { useNotifications } = await import('@/hooks/use-notifications');
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.fetchNotifications).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockNotifications);
  });
});

describe('useUnreadNotificationCount', () => {
  it('未読件数を取得する', async () => {
    const { useUnreadNotificationCount } = await import(
      '@/hooks/use-notifications'
    );
    const { result } = renderHook(() => useUnreadNotificationCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.fetchUnreadCount).toHaveBeenCalled();
    expect(result.current.data).toBe(3);
  });
});
