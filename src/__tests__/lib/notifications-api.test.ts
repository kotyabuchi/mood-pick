import { describe, expect, it, vi } from 'vitest';

import { createNotificationsApi } from '@/lib/notifications/api';

import type { NotificationRow } from '@/types/database';

const mockRow: NotificationRow = {
  id: 'notif-1',
  user_id: 'user-1',
  type: 'follow',
  title: 'テストさんがあなたをフォローしました',
  target_id: 'user-2',
  service_name: null,
  is_read: false,
  created_at: '2026-03-01T00:00:00Z',
};

function createMockClient() {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
  };

  const client = {
    from: vi.fn().mockReturnValue(chainable),
    _chain: chainable,
  };

  // biome-ignore lint/suspicious/noExplicitAny: テスト用モック
  return client as any;
}

describe('createNotificationsApi', () => {
  describe('fetchNotifications', () => {
    it('notifications を取得し Notification[] に変換する', async () => {
      const client = createMockClient();
      client._chain.limit.mockResolvedValue({
        data: [mockRow],
        error: null,
      });

      const api = createNotificationsApi(client);
      const result = await api.fetchNotifications();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'notif-1',
        type: 'follow',
        title: 'テストさんがあなたをフォローしました',
        timestamp: '2026-03-01T00:00:00Z',
        isRead: false,
        targetId: 'user-2',
        serviceName: undefined,
      });
      expect(client.from).toHaveBeenCalledWith('notifications');
    });

    it('data が null の場合は空配列を返す', async () => {
      const client = createMockClient();
      client._chain.limit.mockResolvedValue({
        data: null,
        error: null,
      });

      const api = createNotificationsApi(client);
      const result = await api.fetchNotifications();

      expect(result).toEqual([]);
    });

    it('error がある場合は throw する', async () => {
      const client = createMockClient();
      client._chain.limit.mockResolvedValue({
        data: null,
        error: { message: 'DB error' },
      });

      const api = createNotificationsApi(client);
      await expect(api.fetchNotifications()).rejects.toEqual({
        message: 'DB error',
      });
    });

    it('created_at DESC, id DESC の順序でクエリする', async () => {
      const client = createMockClient();
      client._chain.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      const api = createNotificationsApi(client);
      await api.fetchNotifications();

      expect(client._chain.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
      expect(client._chain.order).toHaveBeenCalledWith('id', {
        ascending: false,
      });
      expect(client._chain.limit).toHaveBeenCalledWith(50);
    });
  });

  describe('fetchUnreadCount', () => {
    it('未読件数を返す', async () => {
      const client = createMockClient();
      // fetchUnreadCount: select → eq の結果
      client._chain.eq.mockResolvedValue({
        count: 5,
        error: null,
      });

      const api = createNotificationsApi(client);
      const result = await api.fetchUnreadCount();

      expect(result).toBe(5);
      expect(client._chain.select).toHaveBeenCalledWith('*', {
        count: 'exact',
        head: true,
      });
      expect(client._chain.eq).toHaveBeenCalledWith('is_read', false);
    });

    it('count が null の場合は 0 を返す', async () => {
      const client = createMockClient();
      client._chain.eq.mockResolvedValue({
        count: null,
        error: null,
      });

      const api = createNotificationsApi(client);
      const result = await api.fetchUnreadCount();

      expect(result).toBe(0);
    });

    it('error がある場合は throw する', async () => {
      const client = createMockClient();
      client._chain.eq.mockResolvedValue({
        count: null,
        error: { message: 'count error' },
      });

      const api = createNotificationsApi(client);
      await expect(api.fetchUnreadCount()).rejects.toEqual({
        message: 'count error',
      });
    });
  });

  describe('markAsRead', () => {
    it('指定 ID の通知を既読にする', async () => {
      const client = createMockClient();
      client._chain.eq.mockResolvedValue({ error: null });

      const api = createNotificationsApi(client);
      await api.markAsRead('notif-1');

      expect(client.from).toHaveBeenCalledWith('notifications');
      expect(client._chain.update).toHaveBeenCalledWith({ is_read: true });
      expect(client._chain.eq).toHaveBeenCalledWith('id', 'notif-1');
    });

    it('error がある場合は throw する', async () => {
      const client = createMockClient();
      client._chain.eq.mockResolvedValue({
        error: { message: 'update error' },
      });

      const api = createNotificationsApi(client);
      await expect(api.markAsRead('notif-1')).rejects.toEqual({
        message: 'update error',
      });
    });
  });

  describe('markAllAsRead', () => {
    it('未読の通知を全て既読にする', async () => {
      const client = createMockClient();
      client._chain.eq.mockResolvedValue({ error: null });

      const api = createNotificationsApi(client);
      await api.markAllAsRead();

      expect(client.from).toHaveBeenCalledWith('notifications');
      expect(client._chain.update).toHaveBeenCalledWith({ is_read: true });
      expect(client._chain.eq).toHaveBeenCalledWith('is_read', false);
    });

    it('error がある場合は throw する', async () => {
      const client = createMockClient();
      client._chain.eq.mockResolvedValue({
        error: { message: 'batch update error' },
      });

      const api = createNotificationsApi(client);
      await expect(api.markAllAsRead()).rejects.toEqual({
        message: 'batch update error',
      });
    });
  });
});
