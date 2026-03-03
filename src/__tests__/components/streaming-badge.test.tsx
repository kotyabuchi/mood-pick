import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StreamingBadge } from '@/components/ui/streaming-badge';
import { daysFromNow } from '@/lib/utils';

describe('StreamingBadge', () => {
  it('サービス名を表示する', () => {
    render(<StreamingBadge service="netflix" />);
    expect(screen.getByText('Netflix')).toBeInTheDocument();
  });

  it('Prime Videoのサービス名を表示する', () => {
    render(<StreamingBadge service="prime" />);
    expect(screen.getByText('Prime Video')).toBeInTheDocument();
  });

  it('期限が7日以内の場合、期限テキストを表示する', () => {
    render(<StreamingBadge service="netflix" expiresAt={daysFromNow(3)} />);
    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('あと3日')).toBeInTheDocument();
  });

  it('期限が8日以上先の場合、期限テキストを表示しない', () => {
    render(<StreamingBadge service="netflix" expiresAt={daysFromNow(10)} />);
    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.queryByText(/あと/)).not.toBeInTheDocument();
  });

  it('expiresAtがnullの場合、期限テキストを表示しない', () => {
    render(<StreamingBadge service="netflix" expiresAt={null} />);
    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.queryByText(/あと/)).not.toBeInTheDocument();
  });

  it('onClickが渡された場合、ボタンとして表示される', () => {
    const onClick = vi.fn();
    render(<StreamingBadge service="netflix" onClick={onClick} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('onClickが渡されない場合、ボタンとして表示されない', () => {
    render(<StreamingBadge service="netflix" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
