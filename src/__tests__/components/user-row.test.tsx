import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { UserRow } from '@/components/ui/user-row';

import type { User } from '@/types';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt ?? ''} {...props} />,
}));

const mockUser: User = {
  id: 'u-1',
  name: '田中太郎',
  handle: 'taro_tanaka',
  avatarUrl: null,
  followingCount: 15,
  followerCount: 22,
  isFollowing: true,
};

const mockUnfollowedUser: User = {
  ...mockUser,
  id: 'u-2',
  name: '鈴木花子',
  handle: 'hanako_suzuki',
  isFollowing: false,
};

describe('UserRow', () => {
  it('ユーザー名が表示される', () => {
    render(<UserRow user={mockUser} />);
    expect(screen.getByText('田中太郎')).toBeInTheDocument();
  });

  it('ハンドル名が@付きで表示される', () => {
    render(<UserRow user={mockUser} />);
    expect(screen.getByText('@taro_tanaka')).toBeInTheDocument();
  });

  it('showFollowButtonがtrueでフォロー中の場合、「フォロー中」が表示される', () => {
    render(
      <UserRow user={mockUser} showFollowButton onFollowToggle={vi.fn()} />,
    );
    expect(screen.getByText('フォロー中')).toBeInTheDocument();
  });

  it('showFollowButtonがtrueでフォローしていない場合、「フォローする」が表示される', () => {
    render(
      <UserRow
        user={mockUnfollowedUser}
        showFollowButton
        onFollowToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('フォローする')).toBeInTheDocument();
  });

  it('フォローボタンをクリックするとonFollowToggleが呼ばれる', () => {
    const onFollowToggle = vi.fn();
    render(
      <UserRow
        user={mockUser}
        showFollowButton
        onFollowToggle={onFollowToggle}
      />,
    );
    fireEvent.click(screen.getByText('フォロー中'));
    expect(onFollowToggle).toHaveBeenCalledTimes(1);
  });

  it('showFollowButtonがfalseの場合、フォローボタンが表示されない', () => {
    render(<UserRow user={mockUser} />);
    expect(screen.queryByText('フォロー中')).not.toBeInTheDocument();
    expect(screen.queryByText('フォローする')).not.toBeInTheDocument();
  });

  it('onClickが渡された場合、行クリックでonClickが呼ばれる', () => {
    const onClick = vi.fn();
    render(<UserRow user={mockUser} onClick={onClick} />);
    fireEvent.click(screen.getByText('田中太郎'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('アバターの頭文字が表示される（avatarUrlがnullの場合）', () => {
    render(<UserRow user={mockUser} />);
    expect(screen.getByText('田')).toBeInTheDocument();
  });
});
