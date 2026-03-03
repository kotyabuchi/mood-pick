import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AttentionChip } from '@/components/ui/attention-chip';

const defaultItem = { id: 'focused', label: 'じっくり' };

describe('AttentionChip', () => {
  it('labelが表示される', () => {
    render(
      <AttentionChip item={defaultItem} selected={false} onPress={vi.fn()} />,
    );
    expect(screen.getByText('じっくり')).toBeInTheDocument();
  });

  it('selectedがfalseの場合、非選択スタイルで表示される', () => {
    render(
      <AttentionChip item={defaultItem} selected={false} onPress={vi.fn()} />,
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-surface-light');
  });

  it('selectedがtrueの場合、選択スタイルで表示される', () => {
    render(
      <AttentionChip item={defaultItem} selected={true} onPress={vi.fn()} />,
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-accent-subtle');
  });

  it('クリック時にonPressが呼ばれる', () => {
    const onPress = vi.fn();
    render(
      <AttentionChip item={defaultItem} selected={false} onPress={onPress} />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
