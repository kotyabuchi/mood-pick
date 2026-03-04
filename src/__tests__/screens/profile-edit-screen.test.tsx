import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ProfileRow } from '@/types/database';

// --- Mocks ---

const mockProfile: ProfileRow = {
  id: 'user-1',
  name: 'テストユーザー',
  handle: 'test_user',
  avatar_url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

const mockRouter = { push: vi.fn(), back: vi.fn() };

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/context/auth-context', () => ({
  useAuth: () => ({ user: { id: 'user-1', email: 'test@test.com' } }),
}));

vi.mock('@/hooks/use-supabase', () => ({
  useSupabaseClient: () => ({}),
}));

vi.mock('@/hooks/use-profile', () => ({
  useOwnProfile: () => ({
    data: mockProfile,
    isLoading: false,
  }),
}));

const mockUpdateProfile = {
  mutate: vi.fn(),
  mutateAsync: vi.fn().mockResolvedValue(mockProfile),
  isPending: false,
};
const mockUploadAvatar = {
  mutate: vi.fn(),
  mutateAsync: vi.fn().mockResolvedValue('https://example.com/avatar.jpg'),
  isPending: false,
};
const mockCheckHandle = {
  mutate: vi.fn(),
  isPending: false,
};

vi.mock('@/hooks/use-profile-mutations', () => ({
  useUpdateProfile: () => mockUpdateProfile,
  useUploadAvatar: () => mockUploadAvatar,
  useCheckHandle: () => mockCheckHandle,
}));

vi.mock('@/lib/profile', () => ({
  profileFormSchema: {
    safeParse: (data: { name?: string; handle?: string }) => {
      if (!data.name) {
        return {
          success: false,
          error: {
            issues: [{ path: ['name'], message: '名前を入力してください' }],
          },
        };
      }
      return { success: true, data };
    },
  },
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

describe('ProfileEditPage', () => {
  it('プロフィール編集フォームを表示する', async () => {
    const ProfileEditPage = (await import('@/app/(main)/profile/edit/page'))
      .default;
    render(<ProfileEditPage />);

    expect(screen.getByText('プロフィール編集')).toBeInTheDocument();
    expect(screen.getByLabelText('名前')).toBeInTheDocument();
    expect(screen.getByLabelText('ハンドル')).toBeInTheDocument();
  });

  it('既存のプロフィールデータがフォームに反映される', async () => {
    const ProfileEditPage = (await import('@/app/(main)/profile/edit/page'))
      .default;
    render(<ProfileEditPage />);

    const nameInput = screen.getByLabelText('名前') as HTMLInputElement;
    const handleInput = screen.getByLabelText('ハンドル') as HTMLInputElement;

    expect(nameInput.value).toBe('テストユーザー');
    expect(handleInput.value).toBe('test_user');
  });

  it('名前が空の場合はバリデーションエラーを表示する', async () => {
    const ProfileEditPage = (await import('@/app/(main)/profile/edit/page'))
      .default;
    render(<ProfileEditPage />);

    // Clear name
    const nameInput = screen.getByLabelText('名前');
    fireEvent.change(nameInput, { target: { value: '' } });

    // Click save
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    expect(
      await screen.findByText('名前を入力してください'),
    ).toBeInTheDocument();
  });

  it('保存ボタンが表示される', async () => {
    const ProfileEditPage = (await import('@/app/(main)/profile/edit/page'))
      .default;
    render(<ProfileEditPage />);

    expect(screen.getByText('保存')).toBeInTheDocument();
  });
});
