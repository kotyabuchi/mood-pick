import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { HorizontalCarousel } from '@/components/ui/horizontal-carousel';

describe('HorizontalCarousel', () => {
  it('タイトルが表示される', () => {
    render(
      <HorizontalCarousel title="テストセクション">
        <div>子要素</div>
      </HorizontalCarousel>,
    );
    expect(screen.getByText('テストセクション')).toBeInTheDocument();
  });

  it('子要素が表示される', () => {
    render(
      <HorizontalCarousel title="テスト">
        <div>アイテム1</div>
        <div>アイテム2</div>
      </HorizontalCarousel>,
    );
    expect(screen.getByText('アイテム1')).toBeInTheDocument();
    expect(screen.getByText('アイテム2')).toBeInTheDocument();
  });

  it('countが渡された場合、カウントが表示される', () => {
    render(
      <HorizontalCarousel title="テスト" count={5}>
        <div>子要素</div>
      </HorizontalCarousel>,
    );
    expect(screen.getByText('(5)')).toBeInTheDocument();
  });

  it('countが渡されない場合、カウントが表示されない', () => {
    render(
      <HorizontalCarousel title="テスト">
        <div>子要素</div>
      </HorizontalCarousel>,
    );
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });

  it('showSeeAllがtrueの場合、「すべて見る」ボタンが表示される', () => {
    const onSeeAll = vi.fn();
    render(
      <HorizontalCarousel title="テスト" showSeeAll onSeeAll={onSeeAll}>
        <div>子要素</div>
      </HorizontalCarousel>,
    );
    expect(screen.getByText('すべて見る')).toBeInTheDocument();
  });

  it('「すべて見る」ボタンをクリックするとonSeeAllが呼ばれる', () => {
    const onSeeAll = vi.fn();
    render(
      <HorizontalCarousel title="テスト" showSeeAll onSeeAll={onSeeAll}>
        <div>子要素</div>
      </HorizontalCarousel>,
    );
    fireEvent.click(screen.getByText('すべて見る'));
    expect(onSeeAll).toHaveBeenCalledTimes(1);
  });

  it('showSeeAllがfalseの場合、「すべて見る」ボタンが表示されない', () => {
    render(
      <HorizontalCarousel title="テスト">
        <div>子要素</div>
      </HorizontalCarousel>,
    );
    expect(screen.queryByText('すべて見る')).not.toBeInTheDocument();
  });

  it('iconが渡された場合、アイコンが表示される', () => {
    render(
      <HorizontalCarousel
        title="テスト"
        icon={<span data-testid="icon">🔥</span>}
      >
        <div>子要素</div>
      </HorizontalCarousel>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
