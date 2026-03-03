import { render, screen } from '@testing-library/react';
import { AlertCircle } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
  it('タイトルが表示される', () => {
    render(<EmptyState icon={AlertCircle} title="データがありません" />);
    expect(screen.getByText('データがありません')).toBeInTheDocument();
  });

  it('descriptionが渡された場合、説明テキストが表示される', () => {
    render(
      <EmptyState
        icon={AlertCircle}
        title="データがありません"
        description="新しいコンテンツを追加してください"
      />,
    );
    expect(
      screen.getByText('新しいコンテンツを追加してください'),
    ).toBeInTheDocument();
  });

  it('descriptionが渡されない場合、説明テキストが表示されない', () => {
    render(<EmptyState icon={AlertCircle} title="データがありません" />);
    expect(
      screen.queryByText('新しいコンテンツを追加してください'),
    ).not.toBeInTheDocument();
  });

  it('アイコンがレンダリングされる', () => {
    const { container } = render(
      <EmptyState icon={AlertCircle} title="テスト" />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
