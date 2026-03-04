import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import RecommendPage from '@/app/(main)/recommend/[id]/page';

import type { ContentDetail, User } from '@/types';

// --- Mocks ---

const mockRouterBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: mockRouterBack }),
  useParams: () => ({ id: 'tmdb-movie-550' }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

vi.mock('@/context/auth-context', () => ({
  useAuth: () => ({ user: { id: 'user-1', email: 'test@example.com' } }),
}));

const mockContent: ContentDetail = {
  id: 'tmdb-movie-550',
  tmdbId: 550,
  title: 'ファイト・クラブ',
  type: 'movie',
  posterUrl: '/poster.jpg',
  year: 1999,
  genre: 'ドラマ',
  runtime: 139,
  synopsis: 'テスト',
  moodTags: ['excited'],
  attentionLevel: 'focused',
  streaming: [],
};

const mockUsers: User[] = [
  {
    id: 'user-2',
    name: '太郎',
    handle: 'taro',
    avatarUrl: null,
    followingCount: 0,
    followerCount: 0,
  },
  {
    id: 'user-3',
    name: '花子',
    handle: 'hanako',
    avatarUrl: null,
    followingCount: 0,
    followerCount: 0,
  },
];

let mockUseContentDetail = vi.fn().mockReturnValue({
  content: mockContent,
  isLoading: false,
  error: null,
});

vi.mock('@/hooks/use-content-detail', () => ({
  useContentDetail: (...args: unknown[]) => mockUseContentDetail(...args),
}));

let mockUseFollowing = vi.fn().mockReturnValue({
  data: mockUsers,
  isLoading: false,
  isError: false,
});

vi.mock('@/hooks/use-follows', () => ({
  useFollowing: (...args: unknown[]) => mockUseFollowing(...args),
}));

const mockSendRecommendations = vi.fn();
vi.mock('@/hooks/use-recommendation-mutations', () => ({
  useSendRecommendations: () => ({
    mutate: mockSendRecommendations,
    isPending: false,
  }),
}));

describe('RecommendPage', () => {
  it('コンテンツタイトルが表示される', () => {
    render(<RecommendPage />);
    expect(screen.getByText('ファイト・クラブ')).toBeInTheDocument();
  });

  it('フォロー中ユーザーが表示される', () => {
    render(<RecommendPage />);
    expect(screen.getByText('太郎')).toBeInTheDocument();
    expect(screen.getByText('花子')).toBeInTheDocument();
  });

  it('ユーザー選択をトグルできる', async () => {
    const user = userEvent.setup();
    render(<RecommendPage />);

    const taro = screen.getByText('太郎');
    await user.click(taro);

    // ボタンが無効でなくなる
    const sendBtn = screen.getByText('おすすめを送る');
    expect(sendBtn).not.toBeDisabled();
  });

  it('送信ボタンクリックで mutation が呼ばれる', async () => {
    const user = userEvent.setup();
    render(<RecommendPage />);

    await user.click(screen.getByText('太郎'));
    await user.click(screen.getByText('おすすめを送る'));

    expect(mockSendRecommendations).toHaveBeenCalledWith(
      expect.objectContaining({
        toUserIds: ['user-2'],
        content: mockContent,
        contentType: 'movie',
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('複数ユーザー選択が可能', async () => {
    const user = userEvent.setup();
    render(<RecommendPage />);

    await user.click(screen.getByText('太郎'));
    await user.click(screen.getByText('花子'));
    await user.click(screen.getByText('おすすめを送る'));

    expect(mockSendRecommendations).toHaveBeenCalledWith(
      expect.objectContaining({
        toUserIds: expect.arrayContaining(['user-2', 'user-3']),
      }),
      expect.anything(),
    );
  });

  it('ローディング中はスピナーが表示される', () => {
    mockUseContentDetail = vi.fn().mockReturnValue({
      content: null,
      isLoading: true,
      error: null,
    });

    render(<RecommendPage />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();

    // Reset
    mockUseContentDetail = vi.fn().mockReturnValue({
      content: mockContent,
      isLoading: false,
      error: null,
    });
  });

  it('エラー時はエラーメッセージが表示される', () => {
    mockUseFollowing = vi.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<RecommendPage />);
    expect(screen.getByTestId('error-message')).toBeInTheDocument();

    // Reset
    mockUseFollowing = vi.fn().mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
    });
  });

  it('フォロー中ユーザーが0人の場合は空状態が表示される', () => {
    mockUseFollowing = vi.fn().mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(<RecommendPage />);
    expect(screen.getByTestId('empty-users')).toBeInTheDocument();

    // Reset
    mockUseFollowing = vi.fn().mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
    });
  });

  it('選択ユーザーなしでは送信ボタンが無効', () => {
    render(<RecommendPage />);
    const sendBtn = screen.getByText('おすすめを送る');
    expect(sendBtn).toBeDisabled();
  });
});
