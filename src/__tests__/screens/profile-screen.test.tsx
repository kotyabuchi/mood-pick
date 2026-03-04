import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ProfileRow } from '@/types/database';

// --- Mocks ---

const mockUser = { id: 'user-1', email: 'test@test.com' };
const mockProfile: ProfileRow = {
  id: 'user-1',
  name: 'テストユーザー',
  handle: 'test_user',
  avatar_url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

const mockRouter = { push: vi.fn() };

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/context/auth-context', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/hooks/use-supabase', () => ({
  useSupabaseClient: () => ({}),
}));

// Mutable mock state to allow per-test override
const profileMockState = {
  data: mockProfile as ProfileRow | null,
  isLoading: false,
};

vi.mock('@/hooks/use-profile', () => ({
  useOwnProfile: () => profileMockState,
}));

vi.mock('@/hooks/use-timed-watch-stats', () => ({
  useTimedWatchStats: () => ({
    data: { thisMonth: 5, thisYear: 20 },
  }),
}));

vi.mock('@/hooks/use-follows', () => ({
  useFollowCounts: () => ({
    data: { followingCount: 10, followerCount: 8 },
  }),
}));

vi.mock('@/hooks/use-watchlist', () => ({
  useWatchlistStats: () => ({
    data: { watched: 30, watching: 3, want: 15 },
  }),
  useWatchlist: () => ({
    data: [],
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    // biome-ignore lint/a11y/useAltText: テスト用モック
    return <img {...rest} />;
  },
}));

// --- Tests ---

describe('ProfilePage', () => {
  it('ユーザー名を表示する', async () => {
    const ProfilePage = (await import('@/app/(main)/profile/page')).default;
    render(<ProfilePage />);

    expect(screen.getByText('テストユーザー')).toBeInTheDocument();
  });

  it('ハンドルを @付きで表示する', async () => {
    const ProfilePage = (await import('@/app/(main)/profile/page')).default;
    render(<ProfilePage />);

    expect(screen.getByText('@test_user')).toBeInTheDocument();
  });

  it('フォロー数を表示する', async () => {
    const ProfilePage = (await import('@/app/(main)/profile/page')).default;
    render(<ProfilePage />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('ウォッチリスト統計を表示する', async () => {
    const ProfilePage = (await import('@/app/(main)/profile/page')).default;
    render(<ProfilePage />);

    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('今月・今年の視聴数を表示する', async () => {
    const ProfilePage = (await import('@/app/(main)/profile/page')).default;
    render(<ProfilePage />);

    expect(screen.getByText('5本')).toBeInTheDocument();
    expect(screen.getByText('20本')).toBeInTheDocument();
  });

  it('ローディング中はスピナーを表示する', async () => {
    // Override mock state for this test
    profileMockState.data = null;
    profileMockState.isLoading = true;

    try {
      const ProfilePage = (await import('@/app/(main)/profile/page')).default;
      const { container } = render(<ProfilePage />);

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    } finally {
      // Restore
      profileMockState.data = mockProfile;
      profileMockState.isLoading = false;
    }
  });
});
