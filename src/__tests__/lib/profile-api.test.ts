import { describe, expect, it, vi } from 'vitest';

import { createProfileApi } from '@/lib/profile/api';

import type { ProfileRow } from '@/types/database';

const mockProfile: ProfileRow = {
  id: 'user-1',
  name: 'テストユーザー',
  handle: 'test_user',
  avatar_url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

function createMockClient() {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };

  const storage = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: {
          publicUrl:
            'https://example.supabase.co/storage/v1/object/public/avatars/user-1/avatar.jpg',
        },
      }),
    }),
  };

  const client = {
    from: vi.fn().mockReturnValue(chainable),
    storage,
    _chain: chainable,
  };

  // biome-ignore lint/suspicious/noExplicitAny: テスト用モック
  return client as any;
}

describe('createProfileApi', () => {
  describe('updateProfile', () => {
    it('name と handle を更新して ProfileRow を返す', async () => {
      const client = createMockClient();
      client._chain.single.mockResolvedValue({
        data: { ...mockProfile, name: '新しい名前', handle: 'new_handle' },
        error: null,
      });

      const api = createProfileApi(client);
      const result = await api.updateProfile('user-1', {
        name: '新しい名前',
        handle: 'New_Handle',
      });

      expect(result.name).toBe('新しい名前');
      expect(result.handle).toBe('new_handle');
      expect(client._chain.update).toHaveBeenCalledWith({
        name: '新しい名前',
        handle: 'new_handle',
      });
    });

    it('handle を lowercase に正規化する', async () => {
      const client = createMockClient();
      client._chain.single.mockResolvedValue({
        data: { ...mockProfile, handle: 'abc_123' },
        error: null,
      });

      const api = createProfileApi(client);
      await api.updateProfile('user-1', { handle: ' ABC_123 ' });

      expect(client._chain.update).toHaveBeenCalledWith({
        handle: 'abc_123',
      });
    });

    it('エラー時に throw する', async () => {
      const client = createMockClient();
      client._chain.single.mockResolvedValue({
        data: null,
        error: { code: '42501', message: 'permission denied' },
      });

      const api = createProfileApi(client);
      await expect(
        api.updateProfile('user-1', { name: 'test' }),
      ).rejects.toEqual({ code: '42501', message: 'permission denied' });
    });
  });

  describe('checkHandleAvailable', () => {
    it('他ユーザーが使用していなければ true', async () => {
      const client = createMockClient();
      client._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const api = createProfileApi(client);
      const result = await api.checkHandleAvailable('new_handle', 'user-1');

      expect(result).toBe(true);
      expect(client.from).toHaveBeenCalledWith('profiles');
    });

    it('他ユーザーが使用中なら false', async () => {
      const client = createMockClient();
      client._chain.maybeSingle.mockResolvedValue({
        data: { id: 'user-2' },
        error: null,
      });

      const api = createProfileApi(client);
      const result = await api.checkHandleAvailable('taken_handle', 'user-1');

      expect(result).toBe(false);
    });

    it('handle を lowercase で検索する', async () => {
      const client = createMockClient();
      client._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const api = createProfileApi(client);
      await api.checkHandleAvailable('TEST_Handle', 'user-1');

      expect(client._chain.eq).toHaveBeenCalledWith('handle', 'test_handle');
    });
  });

  describe('uploadAvatar', () => {
    it('アバターをアップロードして publicUrl を返す', async () => {
      const client = createMockClient();
      const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });

      const api = createProfileApi(client);
      const result = await api.uploadAvatar('user-1', file);

      expect(result).toBe(
        'https://example.supabase.co/storage/v1/object/public/avatars/user-1/avatar.jpg',
      );
      expect(client.storage.from).toHaveBeenCalledWith('avatars');
    });

    it('アップロードエラー時に throw する', async () => {
      const client = createMockClient();
      client.storage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          error: { message: 'File too large' },
        }),
        getPublicUrl: vi.fn(),
      });

      const file = new File(['test'], 'avatar.png', { type: 'image/png' });

      const api = createProfileApi(client);
      await expect(api.uploadAvatar('user-1', file)).rejects.toEqual({
        message: 'File too large',
      });
    });
  });
});
