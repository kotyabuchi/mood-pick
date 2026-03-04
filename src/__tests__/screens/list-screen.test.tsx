import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ListPage from '@/app/(main)/list/page';

import type { WatchlistItem } from '@/types';

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

vi.mock('@/hooks/use-supabase', () => ({
  useSupabaseClient: () => ({}),
}));

const makeItem = (overrides: Partial<WatchlistItem>): WatchlistItem => ({
  id: 'tmdb-movie-1',
  watchlistId: 'wl-1',
  tmdbId: 1,
  title: 'テスト映画',
  type: 'movie',
  posterUrl: '/poster.jpg',
  year: 2024,
  genre: 'アクション',
  runtime: 120,
  synopsis: 'テスト',
  moodTags: ['excited'],
  attentionLevel: 'focused',
  streaming: [],
  status: 'want',
  memo: null,
  rating: null,
  review: null,
  watchedAt: null,
  droppedAt: null,
  createdAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

const wantItems = [makeItem({ status: 'want' })];
const watchingItems = [
  makeItem({
    id: 'tmdb-movie-2',
    watchlistId: 'wl-2',
    tmdbId: 2,
    title: '視聴中映画',
    status: 'watching',
  }),
];
const watchedItems = [
  makeItem({
    id: 'tmdb-movie-3',
    watchlistId: 'wl-3',
    tmdbId: 3,
    title: '見た映画',
    status: 'watched',
    watchedAt: '2025-06-01T00:00:00Z',
  }),
];

const mockUseWatchlist = vi.fn();
const mockUseWatchlistStats = vi
  .fn()
  .mockReturnValue({ data: { want: 1, watching: 1, watched: 1, dropped: 0 } });

vi.mock('@/hooks/use-watchlist', () => ({
  useWatchlist: (...args: unknown[]) => mockUseWatchlist(...args),
  useWatchlistStats: () => mockUseWatchlistStats(),
}));

function setupMockWatchlist() {
  mockUseWatchlist.mockImplementation(
    (status: string, options?: { sortBy?: string }) => {
      if (status === 'want')
        return { data: wantItems, isLoading: false, sortBy: options?.sortBy };
      if (status === 'watching')
        return {
          data: watchingItems,
          isLoading: false,
          sortBy: options?.sortBy,
        };
      if (status === 'watched')
        return {
          data: watchedItems,
          isLoading: false,
          sortBy: options?.sortBy,
        };
      return { data: [], isLoading: false };
    },
  );
}

describe('ListPage — 並び替え', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('並び替えセレクタが表示される', () => {
    setupMockWatchlist();
    render(<ListPage />);

    expect(screen.getByLabelText('並び替え:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('追加日')).toBeInTheDocument();
  });

  it('「見たい」タブでは「追加日」「タイトル」の2オプションが表示される', () => {
    setupMockWatchlist();
    render(<ListPage />);

    const select = screen.getByLabelText('並び替え:');
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(2);
    expect(options[0].textContent).toBe('追加日');
    expect(options[1].textContent).toBe('タイトル');
  });

  it('「見た」タブに切り替えると「視聴日」オプションが追加される', async () => {
    setupMockWatchlist();
    const user = userEvent.setup();
    render(<ListPage />);

    await user.click(screen.getByRole('tab', { name: /^見た \d/ }));

    const select = screen.getByLabelText('並び替え:');
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(3);
    expect(options[2].textContent).toBe('視聴日');
  });

  it('「見た」タブのデフォルトソートは「視聴日」', async () => {
    setupMockWatchlist();
    const user = userEvent.setup();
    render(<ListPage />);

    await user.click(screen.getByRole('tab', { name: /^見た \d/ }));

    expect(screen.getByDisplayValue('視聴日')).toBeInTheDocument();
  });

  it('タブ切り替え時にデフォルトソートにリセットされる', async () => {
    setupMockWatchlist();
    const user = userEvent.setup();
    render(<ListPage />);

    // タイトルソートに切り替え
    await user.selectOptions(screen.getByLabelText('並び替え:'), 'title');
    expect(screen.getByDisplayValue('タイトル')).toBeInTheDocument();

    // 「視聴中」タブに切り替え → デフォルト「追加日」にリセット
    await user.click(screen.getByRole('tab', { name: /視聴中/ }));
    expect(screen.getByDisplayValue('追加日')).toBeInTheDocument();
  });

  it('ソート変更時にアクティブタブの useWatchlist に sortBy が渡される', async () => {
    setupMockWatchlist();
    const user = userEvent.setup();
    render(<ListPage />);

    await user.selectOptions(screen.getByLabelText('並び替え:'), 'title');

    // 最後の呼び出しで 'want' タブに sortBy: 'title' が渡されていること
    const wantCalls = mockUseWatchlist.mock.calls.filter(
      (call: unknown[]) => call[0] === 'want',
    );
    const lastWantCall = wantCalls[wantCalls.length - 1];
    expect(lastWantCall[1]).toEqual({ sortBy: 'title' });
  });
});
