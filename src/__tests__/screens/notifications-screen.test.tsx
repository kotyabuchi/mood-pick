import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import NotificationsPage from '@/app/(main)/notifications/page';

import type { Notification } from '@/types';

// --- Mocks ---

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();

vi.mock('@/hooks/use-notification-mutations', () => ({
  useMarkAsRead: () => ({ mutate: mockMarkAsRead }),
  useMarkAllAsRead: () => ({ mutate: mockMarkAllAsRead }),
}));

const now = new Date();
const today = now.toISOString();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'follow',
    title: '太郎さんがあなたをフォローしました',
    timestamp: today,
    isRead: false,
    targetId: 'user-2',
  },
  {
    id: 'notif-2',
    type: 'expiring',
    title: 'テスト映画がNetflixから配信終了',
    timestamp: today,
    isRead: true,
    targetId: 'tmdb-123',
    serviceName: 'Netflix',
  },
  {
    id: 'notif-3',
    type: 'recommendation',
    title: '花子さんがあなたにテスト作品をおすすめしました',
    timestamp: yesterday,
    isRead: false,
    targetId: 'tmdb-456',
  },
];

let mockUseNotifications = vi.fn().mockReturnValue({
  data: mockNotifications,
  isLoading: false,
  isError: false,
});

vi.mock('@/hooks/use-notifications', () => ({
  useNotifications: () => mockUseNotifications(),
}));

describe('NotificationsPage', () => {
  it('通知ページが表示される', () => {
    render(<NotificationsPage />);
    expect(screen.getByText('通知')).toBeInTheDocument();
  });

  it('戻るボタンが表示される', () => {
    render(<NotificationsPage />);
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
  });

  it('セクションヘッダー「今日」が表示される', () => {
    render(<NotificationsPage />);
    expect(screen.getByText('今日')).toBeInTheDocument();
  });

  it('未読通知のドットが表示される', () => {
    render(<NotificationsPage />);
    const unreadDots = screen.getAllByTestId('unread-dot');
    expect(unreadDots.length).toBe(2);
  });

  it('フォロー通知が表示される', () => {
    render(<NotificationsPage />);
    expect(
      screen.getByText('太郎さんがあなたをフォローしました'),
    ).toBeInTheDocument();
  });

  it('未読通知クリック時に markAsRead が呼ばれる', async () => {
    const user = userEvent.setup();
    render(<NotificationsPage />);

    const link = screen.getByText('太郎さんがあなたをフォローしました');
    await user.click(link);

    expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
  });

  it('既読通知クリック時に markAsRead が呼ばれない', async () => {
    mockMarkAsRead.mockClear();
    const user = userEvent.setup();
    render(<NotificationsPage />);

    const link = screen.getByText('テスト映画がNetflixから配信終了');
    await user.click(link);

    expect(mockMarkAsRead).not.toHaveBeenCalled();
  });

  it('「すべて既読」ボタンが未読がある場合に表示される', async () => {
    const user = userEvent.setup();
    render(<NotificationsPage />);

    const markAllBtn = screen.getByTestId('mark-all-read');
    expect(markAllBtn).toBeInTheDocument();

    await user.click(markAllBtn);
    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('ローディング中はスピナーが表示される', () => {
    mockUseNotifications = vi.fn().mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<NotificationsPage />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Reset
    mockUseNotifications = vi.fn().mockReturnValue({
      data: mockNotifications,
      isLoading: false,
      isError: false,
    });
  });

  it('エラー時はエラーメッセージが表示される', () => {
    mockUseNotifications = vi.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<NotificationsPage />);
    expect(screen.getByTestId('error-message')).toBeInTheDocument();

    // Reset
    mockUseNotifications = vi.fn().mockReturnValue({
      data: mockNotifications,
      isLoading: false,
      isError: false,
    });
  });

  it('通知がない場合は空メッセージが表示される', () => {
    mockUseNotifications = vi.fn().mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(<NotificationsPage />);
    expect(screen.getByTestId('empty-message')).toBeInTheDocument();

    // Reset
    mockUseNotifications = vi.fn().mockReturnValue({
      data: mockNotifications,
      isLoading: false,
      isError: false,
    });
  });
});
