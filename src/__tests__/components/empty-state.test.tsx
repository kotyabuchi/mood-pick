import { render, screen } from '@testing-library/react';
import { WarningCircleIcon } from '@phosphor-icons/react/ssr';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
  it('タイトルが表示される', () => {
    render(<EmptyState icon={WarningCircleIcon} title="データがありません" />);
    expect(screen.getByText('データがありません')).toBeInTheDocument();
  });

  it('descriptionが渡された場合、説明テキストが表示される', () => {
    render(
      <EmptyState
        icon={WarningCircleIcon}
        title="データがありません"
        description="新しいコンテンツを追加してください"
      />,
    );
    expect(
      screen.getByText('新しいコンテンツを追加してください'),
    ).toBeInTheDocument();
  });

  it('descriptionが渡されない場合、説明テキストが表示されない', () => {
    render(<EmptyState icon={WarningCircleIcon} title="データがありません" />);
    expect(
      screen.queryByText('新しいコンテンツを追加してください'),
    ).not.toBeInTheDocument();
  });

  it('アイコンがレンダリングされる', () => {
    const { container } = render(
      <EmptyState icon={WarningCircleIcon} title="テスト" />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('actionが渡された場合、リンクボタンが表示される', () => {
    render(
      <EmptyState
        icon={WarningCircleIcon}
        title="データがありません"
        action={{ label: '作品を探す', href: '/search' }}
      />,
    );
    const link = screen.getByRole('link', { name: '作品を探す' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/search');
  });

  it('actionが渡されない場合、リンクボタンが表示されない', () => {
    render(<EmptyState icon={WarningCircleIcon} title="データがありません" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
