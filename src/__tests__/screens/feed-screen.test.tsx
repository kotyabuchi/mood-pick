import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import FeedPage from '@/app/(main)/feed/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
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

vi.mock('@/hooks/use-content-detail', () => ({
  useContentDetail: () => ({ content: null, isLoading: false, error: null }),
}));

describe('FeedPage', () => {
  it('フィードページが表示される', () => {
    render(<FeedPage />);
    expect(screen.getByText('フィード')).toBeInTheDocument();
  });

  it('フィードアイテムのユーザー名が表示される', () => {
    render(<FeedPage />);
    const userNames = screen.getAllByText('田中太郎');
    expect(userNames.length).toBeGreaterThan(0);
  });

  it('フィードアイテムのコンテンツタイトルが表示される', () => {
    render(<FeedPage />);
    const titles = screen.getAllByText(/オッペンハイマー/);
    expect(titles.length).toBeGreaterThan(0);
  });

  it('「見たいに追加」ボタンが表示される', () => {
    render(<FeedPage />);
    const buttons = screen.getAllByText('見たいに追加');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('レビューテキストが表示される', () => {
    render(<FeedPage />);
    expect(screen.getByText('映像と音楽が圧巻だった！')).toBeInTheDocument();
  });

  it('おすすめメッセージが表示される', () => {
    render(<FeedPage />);
    expect(screen.getByText('DUNEの映像美、絶対見て！')).toBeInTheDocument();
  });

  it('複数のフィードカードが表示される', () => {
    render(<FeedPage />);
    const addButtons = screen.getAllByText('見たいに追加');
    expect(addButtons.length).toBe(8);
  });
});
