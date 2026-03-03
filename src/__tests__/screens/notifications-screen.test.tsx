import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import NotificationsPage from '@/app/(main)/notifications/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt ?? ''} {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

vi.mock('@/context/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'test', email: 'test@test.com' },
    signOut: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-watchlist', () => ({
  useWatchlist: () => ({ data: [] }),
  useWatchlistItem: () => ({ data: null, isLoading: false }),
  useWatchlistStats: () => ({
    data: { watched: 0, watching: 0, want: 0 },
  }),
}));

vi.mock('@/hooks/use-watchlist-mutations', () => ({
  useAddToWatchlist: () => ({ mutateAsync: vi.fn() }),
  useUpdateWatchlistStatus: () => ({ mutateAsync: vi.fn() }),
  useUpdateMemo: () => ({ mutate: vi.fn() }),
  useRemoveFromWatchlist: () => ({ mutateAsync: vi.fn() }),
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

  it('通知アイテムが表示される', () => {
    render(<NotificationsPage />);
    expect(
      screen.getByText(/ドライブ・マイ・カー.*Netflixから配信終了/),
    ).toBeInTheDocument();
  });

  it('未読通知のドットが表示される', () => {
    render(<NotificationsPage />);
    const unreadDots = screen.getAllByTestId('unread-dot');
    expect(unreadDots.length).toBeGreaterThan(0);
  });

  it('フォロー通知が表示される', () => {
    render(<NotificationsPage />);
    expect(
      screen.getByText(/高橋大輝さんがあなたをフォローしました/),
    ).toBeInTheDocument();
  });

  it('おすすめ通知が表示される', () => {
    render(<NotificationsPage />);
    expect(
      screen.getByText(/鈴木花子さんがあなたに.*おすすめしました/),
    ).toBeInTheDocument();
  });

  it('配信終了通知が表示される', () => {
    render(<NotificationsPage />);
    const expiringNotifications = screen.getAllByText(/配信終了/);
    expect(expiringNotifications.length).toBeGreaterThan(0);
  });
});
