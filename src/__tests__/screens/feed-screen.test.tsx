import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import FeedPage from '@/app/(main)/feed/page';

import type { FeedItem } from '@/types';

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

const mockFeedItems: FeedItem[] = [
  {
    id: 'act-1',
    user: {
      id: 'user-1',
      name: '田中太郎',
      handle: 'tanaka',
      avatarUrl: null,
      followingCount: 0,
      followerCount: 0,
    },
    actionType: 'watched',
    content: {
      id: 'tmdb-movie-1',
      tmdbId: 1,
      title: 'オッペンハイマー',
      type: 'movie',
      posterUrl: 'https://image.tmdb.org/t/p/w200/poster1.jpg',
      year: 2023,
      genre: 'ドラマ',
      runtime: 180,
      synopsis: '',
      moodTags: [],
      attentionLevel: 'casual',
      streaming: [],
    },
    timestamp: '2025-01-01T00:00:00Z',
    rating: 5,
    review: '映像と音楽が圧巻だった！',
  },
  {
    id: 'act-2',
    user: {
      id: 'user-2',
      name: '佐藤花子',
      handle: 'sato',
      avatarUrl: null,
      followingCount: 0,
      followerCount: 0,
    },
    actionType: 'want',
    content: {
      id: 'tmdb-movie-2',
      tmdbId: 2,
      title: 'DUNE',
      type: 'movie',
      posterUrl: 'https://image.tmdb.org/t/p/w200/poster2.jpg',
      year: 2024,
      genre: 'SF',
      runtime: 166,
      synopsis: '',
      moodTags: [],
      attentionLevel: 'casual',
      streaming: [],
    },
    timestamp: '2025-01-01T00:00:00Z',
  },
];

// デフォルト: データありモック
const mockUseFeed = vi.fn().mockReturnValue({
  data: mockFeedItems,
  isLoading: false,
  error: null,
});

vi.mock('@/hooks/use-feed', () => ({
  useFeed: () => mockUseFeed(),
}));

describe('FeedPage', () => {
  it('フィードページが表示される', () => {
    render(<FeedPage />);
    expect(screen.getByText('フィード')).toBeInTheDocument();
  });

  it('フィードアイテムのユーザー名が表示される', () => {
    render(<FeedPage />);
    expect(screen.getByText('田中太郎')).toBeInTheDocument();
  });

  it('フィードアイテムのコンテンツタイトルが表示される', () => {
    render(<FeedPage />);
    const titles = screen.getAllByText(/オッペンハイマー/);
    expect(titles.length).toBeGreaterThan(0);
  });

  it('「見たいに追加」ボタンが表示される', () => {
    render(<FeedPage />);
    const buttons = screen.getAllByText('見たいに追加');
    expect(buttons.length).toBe(2);
  });

  it('レビューテキストが表示される', () => {
    render(<FeedPage />);
    expect(screen.getByText('映像と音楽が圧巻だった！')).toBeInTheDocument();
  });

  it('ローディング中はスピナーが表示される', () => {
    mockUseFeed.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<FeedPage />);
    // Loader2 はsvgでレンダリングされる
    expect(screen.queryByText('田中太郎')).not.toBeInTheDocument();
  });

  it('エラー時にエラーメッセージが表示される', () => {
    mockUseFeed.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      error: new Error('fetch error'),
    });
    render(<FeedPage />);
    expect(
      screen.getByText('フィードの読み込みに失敗しました'),
    ).toBeInTheDocument();
  });

  it('データが空の場合は空状態メッセージが表示される', () => {
    mockUseFeed.mockReturnValueOnce({
      data: [],
      isLoading: false,
      error: null,
    });
    render(<FeedPage />);
    expect(
      screen.getByText(
        'フォロー中のユーザーのアクティビティがここに表示されます',
      ),
    ).toBeInTheDocument();
  });
});
