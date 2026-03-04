'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useSupabaseClient } from './use-supabase';

import { useAuth } from '@/context/auth-context';
import { createNotificationsApi, notificationKeys } from '@/lib/notifications';

export function useNotifications() {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createNotificationsApi(supabase), [supabase]);

  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => api.fetchNotifications(),
    enabled: !!user,
  });
}

export function useUnreadNotificationCount() {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createNotificationsApi(supabase), [supabase]);

  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => api.fetchUnreadCount(),
    enabled: !!user,
    refetchInterval: 60_000,
  });
}
