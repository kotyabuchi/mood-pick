import { fireEvent, render, screen } from '@testing-library/react';
import { Settings } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { ScreenHeader } from '@/components/ui/screen-header';

const mockBack = vi.fn();
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
  usePathname: () => '/',
}));

describe('ScreenHeader', () => {
  it('タイトルが表示される', () => {
    render(<ScreenHeader title="テストタイトル" />);
    expect(screen.getByText('テストタイトル')).toBeInTheDocument();
  });

  it('showBackがtrueの場合、戻るボタンが表示される', () => {
    render(<ScreenHeader title="テスト" showBack />);
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
  });

  it('showBackがfalseでonBackもない場合、戻るボタンが非表示', () => {
    render(<ScreenHeader title="テスト" />);
    expect(screen.queryByTestId('back-button')).not.toBeInTheDocument();
  });

  it('onBackが渡された場合、戻るボタンが表示される', () => {
    const onBack = vi.fn();
    render(<ScreenHeader title="テスト" onBack={onBack} />);
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
  });

  it('onBackが渡された場合、クリックでonBackが呼ばれる', () => {
    const onBack = vi.fn();
    render(<ScreenHeader title="テスト" onBack={onBack} />);
    fireEvent.click(screen.getByTestId('back-button'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('showBackのみの場合、クリックでrouter.backが呼ばれる', () => {
    mockBack.mockClear();
    render(<ScreenHeader title="テスト" showBack />);
    fireEvent.click(screen.getByTestId('back-button'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('rightIconとonRightPressが渡された場合、右ボタンが表示される', () => {
    const onRightPress = vi.fn();
    render(
      <ScreenHeader
        title="テスト"
        rightIcon={Settings}
        onRightPress={onRightPress}
      />,
    );
    expect(screen.getByTestId('right-button')).toBeInTheDocument();
  });

  it('右ボタンをクリックするとonRightPressが呼ばれる', () => {
    const onRightPress = vi.fn();
    render(
      <ScreenHeader
        title="テスト"
        rightIcon={Settings}
        onRightPress={onRightPress}
      />,
    );
    fireEvent.click(screen.getByTestId('right-button'));
    expect(onRightPress).toHaveBeenCalledTimes(1);
  });

  it('rightIconのみでonRightPressがない場合、右ボタンが非表示', () => {
    render(<ScreenHeader title="テスト" rightIcon={Settings} />);
    expect(screen.queryByTestId('right-button')).not.toBeInTheDocument();
  });
});
