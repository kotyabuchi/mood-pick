import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UserAvatar } from '@/components/ui/user-avatar';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt ?? ''} {...props} />,
}));

describe('UserAvatar', () => {
  it('URIがある場合、画像を表示する', () => {
    render(<UserAvatar uri="https://example.com/avatar.jpg" name="田中太郎" />);
    const img = screen.getByTestId('avatar-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('URIがない場合、名前の頭文字を表示する', () => {
    render(<UserAvatar name="田中太郎" />);
    expect(screen.getByText('田')).toBeInTheDocument();
  });

  it('URIもnameもない場合、「?」を表示する', () => {
    render(<UserAvatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('URIがnullの場合、名前の頭文字を表示する', () => {
    render(<UserAvatar uri={null} name="鈴木花子" />);
    expect(screen.getByText('鈴')).toBeInTheDocument();
  });

  it('sizeが指定された場合、そのサイズが適用される', () => {
    render(<UserAvatar name="テスト" size={64} />);
    const avatar = screen.getByText('テ').parentElement;
    expect(avatar).toHaveStyle({ width: '64px', height: '64px' });
  });

  it('デフォルトサイズは48', () => {
    render(<UserAvatar name="テスト" />);
    const avatar = screen.getByText('テ').parentElement;
    expect(avatar).toHaveStyle({ width: '48px', height: '48px' });
  });
});
