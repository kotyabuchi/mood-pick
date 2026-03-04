import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

// --- Mocks ---

vi.mock('@/hooks/use-supabase', () => ({
  useSupabaseClient: () => ({}),
}));

const mockApi = {
  markAsRead: vi.fn().mockResolvedValue(undefined),
  markAllAsRead: vi.fn().mockResolvedValue(undefined),
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

describe('useMarkAsRead', () => {
  it('指定 ID の通知を既読にする', async () => {
    const { useMarkAsRead } = await import(
      '@/hooks/use-notification-mutations'
    );
    const { result } = renderHook(() => useMarkAsRead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('notif-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.markAsRead).toHaveBeenCalledWith('notif-1');
  });
});

describe('useMarkAllAsRead', () => {
  it('全通知を既読にする', async () => {
    const { useMarkAllAsRead } = await import(
      '@/hooks/use-notification-mutations'
    );
    const { result } = renderHook(() => useMarkAllAsRead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.markAllAsRead).toHaveBeenCalled();
  });
});
