import { mapNotificationRowToNotification } from './mappers';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Notification } from '@/types';
import type { Database } from '@/types/database';

export function createNotificationsApi(client: SupabaseClient<Database>) {
  async function fetchNotifications(): Promise<Notification[]> {
    const { data, error } = await client
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(50);

    if (error) throw error;

    return (data ?? []).map(mapNotificationRowToNotification);
  }

  async function fetchUnreadCount(): Promise<number> {
    const { count, error } = await client
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) throw error;

    return count ?? 0;
  }

  async function markAsRead(id: string): Promise<void> {
    const { error } = await client
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  }

  async function markAllAsRead(): Promise<void> {
    const { error } = await client
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
  }

  return { fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead };
}
