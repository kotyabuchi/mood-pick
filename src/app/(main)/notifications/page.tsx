'use client';

import { useMemo } from 'react';
import Link from 'next/link';

import { ScreenHeader } from '@/components/ui/screen-header';
import { mockNotifications } from '@/lib/mock-data';
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
  const sections = useMemo(() => {
    const { today, yesterday, thisWeek } = groupByDate(mockNotifications);
    const result: { title: string; data: Notification[] }[] = [];
    if (today.length > 0) result.push({ title: '今日', data: today });
    if (yesterday.length > 0) result.push({ title: '昨日', data: yesterday });
    if (thisWeek.length > 0) result.push({ title: '今週', data: thisWeek });
    return result;
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <ScreenHeader title="通知" showBack />

      <div className="pb-8">
        {sections.map((section) => (
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
        ))}
      </div>
    </div>
  );
}
