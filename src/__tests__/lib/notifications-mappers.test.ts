import { describe, expect, it } from 'vitest';

import { mapNotificationRowToNotification } from '@/lib/notifications/mappers';

import type { NotificationRow } from '@/types/database';

const baseRow: NotificationRow = {
  id: 'notif-1',
  user_id: 'user-1',
  type: 'follow',
  title: 'テストさんがあなたをフォローしました',
  target_id: 'user-2',
  service_name: null,
  is_read: false,
  created_at: '2026-03-01T00:00:00Z',
};

describe('mapNotificationRowToNotification', () => {
  it('NotificationRow を Notification に変換する', () => {
    const result = mapNotificationRowToNotification(baseRow);

    expect(result).toEqual({
      id: 'notif-1',
      type: 'follow',
      title: 'テストさんがあなたをフォローしました',
      timestamp: '2026-03-01T00:00:00Z',
      isRead: false,
      targetId: 'user-2',
      serviceName: undefined,
    });
  });

  it('is_read が true の場合は isRead が true になる', () => {
    const result = mapNotificationRowToNotification({
      ...baseRow,
      is_read: true,
    });

    expect(result.isRead).toBe(true);
  });

  it('service_name がある場合は serviceName に変換する', () => {
    const result = mapNotificationRowToNotification({
      ...baseRow,
      type: 'expiring',
      service_name: 'Netflix',
    });

    expect(result.serviceName).toBe('Netflix');
    expect(result.type).toBe('expiring');
  });

  it('type が recommendation の場合も正しく変換する', () => {
    const result = mapNotificationRowToNotification({
      ...baseRow,
      type: 'recommendation',
    });

    expect(result.type).toBe('recommendation');
  });
});
