import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UrgencyBadge } from '@/components/ui/urgency-badge';
import { daysFromNow } from '@/lib/utils';

describe('UrgencyBadge', () => {
  it('今日期限のコンテンツに「今日終了」を表示する', () => {
    render(<UrgencyBadge expiresAt={daysFromNow(0)} />);
    expect(screen.getByText('今日終了')).toBeInTheDocument();
  });

  it('明日期限のコンテンツに「明日終了」を表示する', () => {
    render(<UrgencyBadge expiresAt={daysFromNow(1)} />);
    expect(screen.getByText('明日終了')).toBeInTheDocument();
  });

  it('3日後期限のコンテンツに「あと3日」を表示する', () => {
    render(<UrgencyBadge expiresAt={daysFromNow(3)} />);
    expect(screen.getByText('あと3日')).toBeInTheDocument();
  });

  it('7日後期限のコンテンツに「あと7日」を表示する', () => {
    render(<UrgencyBadge expiresAt={daysFromNow(7)} />);
    expect(screen.getByText('あと7日')).toBeInTheDocument();
  });

  it('8日以上先の場合はnullを返す（何も表示しない）', () => {
    const { container } = render(<UrgencyBadge expiresAt={daysFromNow(10)} />);
    expect(container.innerHTML).toBe('');
  });

  it('過去の日付の場合はnullを返す（何も表示しない）', () => {
    const { container } = render(<UrgencyBadge expiresAt={daysFromNow(-1)} />);
    expect(container.innerHTML).toBe('');
  });
});
