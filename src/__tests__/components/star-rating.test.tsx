import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StarRating } from '@/components/ui/star-rating';

describe('StarRating', () => {
  it('rating=3の場合、塗りつぶし星が3個、アウトライン星が2個', () => {
    render(<StarRating rating={3} />);
    const filled = screen.getAllByTestId('star-filled');
    const outline = screen.getAllByTestId('star-outline');
    expect(filled).toHaveLength(3);
    expect(outline).toHaveLength(2);
  });

  it('rating=5の場合、全て塗りつぶし星', () => {
    render(<StarRating rating={5} />);
    const filled = screen.getAllByTestId('star-filled');
    expect(filled).toHaveLength(5);
    expect(screen.queryAllByTestId('star-outline')).toHaveLength(0);
  });

  it('rating=0の場合、全てアウトライン星', () => {
    render(<StarRating rating={0} />);
    const outline = screen.getAllByTestId('star-outline');
    expect(outline).toHaveLength(5);
    expect(screen.queryAllByTestId('star-filled')).toHaveLength(0);
  });

  it('editable=trueの場合、星をクリックするとonChangeが呼ばれる', () => {
    const onChange = vi.fn();
    render(<StarRating rating={2} editable onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[3]); // 4番目の星をクリック
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('editable=falseの場合、ボタンが存在しない', () => {
    render(<StarRating rating={3} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
