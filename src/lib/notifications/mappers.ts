import type { Notification, NotificationType } from '@/types';
import type { NotificationRow } from '@/types/database';

export function mapNotificationRowToNotification(
  row: NotificationRow,
): Notification {
  return {
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    timestamp: row.created_at,
    isRead: row.is_read,
    targetId: row.target_id,
    serviceName: row.service_name ?? undefined,
  };
}
