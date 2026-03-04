import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NotificationBadge } from '@/components/ui/notification-badge';

// --- Mocks ---

let mockCount = 0;

vi.mock('@/hooks/use-notifications', () => ({
  useUnreadNotificationCount: () => ({ data: mockCount }),
}));

describe('NotificationBadge', () => {
  it('未読数が 0 の場合は表示しない', () => {
    mockCount = 0;
    const { container } = render(<NotificationBadge />);
    expect(container.innerHTML).toBe('');
  });

  it('未読数を表示する', () => {
    mockCount = 5;
    render(<NotificationBadge />);
    expect(screen.getByTestId('notification-badge')).toHaveTextContent('5');
  });

  it('99 を超える場合は 99+ を表示する', () => {
    mockCount = 150;
    render(<NotificationBadge />);
    expect(screen.getByTestId('notification-badge')).toHaveTextContent('99+');
  });

  it('未読数が負の場合は表示しない', () => {
    mockCount = -1;
    const { container } = render(<NotificationBadge />);
    expect(container.innerHTML).toBe('');
  });
});
