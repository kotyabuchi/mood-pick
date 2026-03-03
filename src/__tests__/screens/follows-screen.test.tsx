import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import FollowsPage from '@/app/(main)/follows/page';

import type { User } from '@/types';

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

const mockFollowing: User[] = [
  {
    id: 'u-1',
    name: '田中太郎',
    handle: 'taro_tanaka',
    avatarUrl: null,
    followingCount: 0,
    followerCount: 0,
    isFollowing: true,
  },
  {
    id: 'u-2',
    name: '鈴木花子',
    handle: 'hanako_suzuki',
    avatarUrl: null,
    followingCount: 0,
    followerCount: 0,
    isFollowing: true,
  },
  {
    id: 'u-3',
    name: '佐藤健',
    handle: 'ken_sato',
    avatarUrl: null,
    followingCount: 0,
    followerCount: 0,
    isFollowing: true,
  },
  {
    id: 'u-4',
    name: '山田優',
    handle: 'yu_yamada',
    avatarUrl: null,
    followingCount: 0,
    followerCount: 0,
    isFollowing: true,
  },
];

const mockFollowers: User[] = [
  ...mockFollowing,
  {
    id: 'u-5',
    name: '高橋大輝',
    handle: 'daiki_t',
    avatarUrl: null,
    followingCount: 0,
    followerCount: 0,
    isFollowing: false,
  },
  {
    id: 'u-6',
    name: '伊藤美咲',
    handle: 'misaki_ito',
    avatarUrl: null,
    followingCount: 0,
    followerCount: 0,
    isFollowing: false,
  },
];

vi.mock('@/hooks/use-follows', () => ({
  useFollowing: () => ({ data: mockFollowing, isLoading: false }),
  useFollowers: () => ({ data: mockFollowers, isLoading: false }),
  useFollowCounts: () => ({
    data: { followingCount: 4, followerCount: 6 },
  }),
  useIsFollowing: () => ({ data: false }),
}));

vi.mock('@/hooks/use-follow-mutations', () => ({
  useToggleFollow: () => ({
    mutate: vi.fn(),
    isPending: false,
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
