import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import FollowsPage from '@/app/(main)/follows/page';

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

describe('FollowsPage', () => {
  it('つながりページが表示される', () => {
    render(<FollowsPage />);
    expect(screen.getByText('つながり')).toBeInTheDocument();
  });

  it('フォロータブが表示される', () => {
    render(<FollowsPage />);
    expect(screen.getByText('フォロー')).toBeInTheDocument();
    expect(screen.getByText('フォロワー')).toBeInTheDocument();
  });

  it('初期状態でフォロー中のユーザーのみ表示される', () => {
    render(<FollowsPage />);
    expect(screen.getByText('田中太郎')).toBeInTheDocument();
    expect(screen.getByText('鈴木花子')).toBeInTheDocument();
    expect(screen.getByText('佐藤健')).toBeInTheDocument();
    expect(screen.getByText('山田優')).toBeInTheDocument();
  });

  it('フォロワータブをクリックすると全ユーザーが表示される', async () => {
    const user = userEvent.setup();
    render(<FollowsPage />);
    await user.click(screen.getByText('フォロワー'));
    expect(screen.getByText('田中太郎')).toBeInTheDocument();
    expect(screen.getByText('高橋大輝')).toBeInTheDocument();
    expect(screen.getByText('伊藤美咲')).toBeInTheDocument();
  });

  it('フォローボタンが表示される', () => {
    render(<FollowsPage />);
    const followButtons = screen.getAllByText('フォロー中');
    expect(followButtons.length).toBeGreaterThan(0);
  });

  it('戻るボタンが表示される', () => {
    render(<FollowsPage />);
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
  });

  it('ハンドル名が表示される', () => {
    render(<FollowsPage />);
    expect(screen.getByText('@taro_tanaka')).toBeInTheDocument();
  });
});
