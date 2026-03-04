'use client';

import { useMemo } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import {
  FORCE_SKELETON,
  NotificationSkeleton,
} from '@/components/ui/skeletons';
import {
  useMarkAllAsRead,
  useMarkAsRead,
} from '@/hooks/use-notification-mutations';
import { useNotifications } from '@/hooks/use-notifications';
import { formatRelativeTime, groupByDate } from '@/lib/utils';

import type { Notification } from '@/types';

function getNotificationHref(notification: Notification): string {
  if (
    notification.type === 'expiring' ||
    notification.type === 'recommendation'
  ) {
    return `/detail/${notification.targetId}`;
  }
  if (notification.type === 'follow') {
    return `/user/${notification.targetId}`;
  }
  return '#';
}

export default function NotificationsPage() {
  const { data: notifications, isLoading, isError } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const sections = useMemo(() => {
    if (!notifications) return [];
    const { today, yesterday, thisWeek, older } = groupByDate(notifications);
    const result: { title: string; data: Notification[] }[] = [];
    if (today.length > 0) result.push({ title: '今日', data: today });
    if (yesterday.length > 0) result.push({ title: '昨日', data: yesterday });
    if (thisWeek.length > 0) result.push({ title: '今週', data: thisWeek });
    if (older.length > 0) result.push({ title: 'それ以前', data: older });
    return result;
  }, [notifications]);

  const hasUnread = notifications?.some((n) => !n.isRead) ?? false;

  if (FORCE_SKELETON || isLoading) {
    // TEMP: skeleton debug
    return (
      <div className="max-w-4xl mx-auto">
        <ScreenHeader title="通知" showBack />
        <NotificationSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto">
        <ScreenHeader title="通知" showBack />
        <div className="px-4 py-20 text-center" data-testid="error-message">
          <p className="text-text-secondary">通知の読み込みに失敗しました</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ScreenHeader
        title="通知"
        showBack
        rightAction={
          hasUnread ? (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="text-sm text-accent hover:text-accent/80 transition-colors"
              data-testid="mark-all-read"
            >
              すべて既読
            </button>
          ) : undefined
        }
      />

      <div className="pb-8">
        {sections.length === 0 ? (
          <div data-testid="empty-message">
            <EmptyState
              icon={Bell}
              title="通知はまだありません"
              description="新しいお知らせがあるとここに届きます"
            />
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.title}>
              <div className="px-4 pt-4 pb-2 lg:px-0">
                <h3 className="text-base font-bold text-text-primary">
                  {section.title}
                </h3>
              </div>
              {section.data.map((item) => (
                <Link
                  key={item.id}
                  href={getNotificationHref(item)}
                  onClick={() => {
                    if (!item.isRead) markAsRead(item.id);
                  }}
                  className="block bg-surface rounded-lg mx-4 mb-2 p-3 hover:bg-surface-light transition-colors lg:mx-0"
                >
                  <div className="flex">
                    {!item.isRead && (
                      <div
                        data-testid="unread-dot"
                        className="w-2 h-2 rounded-full bg-accent mr-2 mt-1.5 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">{item.title}</p>
                      <p className="text-xs text-text-secondary mt-1">
                        {formatRelativeTime(item.timestamp)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
