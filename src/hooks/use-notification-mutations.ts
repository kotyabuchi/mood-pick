'use client';

import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabaseClient } from './use-supabase';

import { createNotificationsApi, notificationKeys } from '@/lib/notifications';

import type { Notification } from '@/types';

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createNotificationsApi(supabase), [supabase]);

  return useMutation({
    mutationFn: (id: string) => api.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: notificationKeys.all,
      });

      const prevList = queryClient.getQueryData<Notification[]>(
        notificationKeys.list(),
      );
      const prevCount = queryClient.getQueryData<number>(
        notificationKeys.unreadCount(),
      );

      queryClient.setQueryData<Notification[]>(
        notificationKeys.list(),
        (old) =>
          old?.map((n) => (n.id === id ? { ...n, isRead: true } : n)) ?? [],
      );

      queryClient.setQueryData<number>(notificationKeys.unreadCount(), (old) =>
        Math.max(0, (old ?? 0) - 1),
      );

      return { prevList, prevCount };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(notificationKeys.list(), context.prevList);
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          context.prevCount,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createNotificationsApi(supabase), [supabase]);

  return useMutation({
    mutationFn: () => api.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: notificationKeys.all,
      });

      const prevList = queryClient.getQueryData<Notification[]>(
        notificationKeys.list(),
      );
      const prevCount = queryClient.getQueryData<number>(
        notificationKeys.unreadCount(),
      );

      queryClient.setQueryData<Notification[]>(
        notificationKeys.list(),
        (old) => old?.map((n) => ({ ...n, isRead: true })) ?? [],
      );

      queryClient.setQueryData<number>(notificationKeys.unreadCount(), 0);

      return { prevList, prevCount };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(notificationKeys.list(), context.prevList);
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          context.prevCount,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
