'use client';

import { useUnreadNotificationCount } from '@/hooks/use-notifications';

export function NotificationBadge() {
  const { data: count } = useUnreadNotificationCount();

  if (!count || count <= 0) return null;

  const display = count > 99 ? '99+' : String(count);

  return (
    <span
      data-testid="notification-badge"
      className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-accent rounded-full"
    >
      {display}
    </span>
  );
}
