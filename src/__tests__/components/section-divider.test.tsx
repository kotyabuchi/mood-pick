import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SectionDivider } from '@/components/ui/section-divider';

describe('SectionDivider', () => {
  it('ラベルなしの場合、区切り線が表示される', () => {
    render(<SectionDivider />);
    expect(screen.getByTestId('divider-line')).toBeInTheDocument();
  });

  it('ラベルありの場合、ラベルテキストが表示される', () => {
    render(<SectionDivider label="セクション" />);
    expect(screen.getByText('セクション')).toBeInTheDocument();
  });

  it('ラベルありの場合、区切り線が表示される', () => {
    render(<SectionDivider label="テスト" />);
    expect(screen.getByTestId('divider-line')).toBeInTheDocument();
  });
});
