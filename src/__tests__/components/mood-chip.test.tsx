import { fireEvent, render, screen } from '@testing-library/react';
import { Zap } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { MoodChip } from '@/components/ui/mood-chip';

const defaultMood = { id: 'excited', icon: Zap, label: 'アツい' };

describe('MoodChip', () => {
  it('アイコンとlabelが表示される', () => {
    render(<MoodChip mood={defaultMood} selected={false} onPress={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button.querySelector('.lucide-zap')).toBeInTheDocument();
    expect(screen.getByText('アツい')).toBeInTheDocument();
  });

  it('selectedがfalseの場合、非選択スタイルで表示される', () => {
    render(<MoodChip mood={defaultMood} selected={false} onPress={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('bg-surface-light');
  });

  it('selectedがtrueの場合、選択スタイルで表示される', () => {
    render(<MoodChip mood={defaultMood} selected={true} onPress={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-accent-subtle');
  });

  it('クリック時にonPressが呼ばれる', () => {
    const onPress = vi.fn();
    render(<MoodChip mood={defaultMood} selected={false} onPress={onPress} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
