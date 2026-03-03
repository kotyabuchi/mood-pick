import { describe, expect, it, vi } from 'vitest';

import { createFollowsApi } from '@/lib/follows/api';

import type { ProfileRow } from '@/types/database';

const mockProfile: ProfileRow = {
  id: 'user-1',
  name: 'テストユーザー',
  handle: 'test_user',
  avatar_url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

const mockProfile2: ProfileRow = {
  id: 'user-2',
  name: 'ユーザー2',
  handle: 'user_two',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

function createMockClient() {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
  };

  const client = {
    from: vi.fn().mockReturnValue(chainable),
    _chain: chainable,
  };

  // biome-ignore lint/suspicious/noExplicitAny: テスト用モック
  return client as any;
}

describe('createFollowsApi', () => {
  describe('fetchFollowing', () => {
    it('profiles JOIN の結果を User[] にマッピングする', async () => {
      const client = createMockClient();
      client._chain.eq.mockResolvedValue({
        data: [{ following_id: 'user-2', profiles: mockProfile2 }],
        error: null,
      });

      const api = createFollowsApi(client);
      const result = await api.fetchFollowing('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'user-2',
        name: 'ユーザー2',
        handle: 'user_two',
        avatarUrl: 'https://example.com/avatar.jpg',
        followingCount: 0,
        followerCount: 0,
        isFollowing: true,
      });

      expect(client.from).toHaveBeenCalledWith('follows');
    });

    it('profiles が null の行を除外する', async () => {
      const client = createMockClient();
      client._chain.eq.mockResolvedValue({
        data: [
          { following_id: 'user-2', profiles: mockProfile2 },
          { following_id: 'user-orphan', profiles: null },
        ],
        error: null,
      });

      const api = createFollowsApi(client);
      const result = await api.fetchFollowing('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('user-2');
    });
  });

  describe('fetchFollowers', () => {
    it('profiles JOIN の結果を User[] にマッピングする', async () => {
      const client = createMockClient();
      client._chain.eq.mockResolvedValue({
        data: [{ follower_id: 'user-1', profiles: mockProfile }],
        error: null,
      });

      const api = createFollowsApi(client);
      const result = await api.fetchFollowers('user-2');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('user-1');
      expect(result[0].name).toBe('テストユーザー');
    });

    it('profiles が null の行を除外する', async () => {
      const client = createMockClient();
      client._chain.eq.mockResolvedValue({
        data: [
          { follower_id: 'user-1', profiles: mockProfile },
          { follower_id: 'user-orphan', profiles: null },
        ],
        error: null,
      });

      const api = createFollowsApi(client);
      const result = await api.fetchFollowers('user-2');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('user-1');
    });

    it('viewerId を渡すと isFollowing が解決される', async () => {
      const followersChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [
            { follower_id: 'user-1', profiles: mockProfile },
            { follower_id: 'user-2', profiles: mockProfile2 },
          ],
          error: null,
        }),
      };
      const isFollowingChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [{ following_id: 'user-1' }],
          error: null,
        }),
      };

      const client = createMockClient();
      client.from
        .mockReturnValueOnce(followersChain)
        .mockReturnValueOnce(isFollowingChain);

      const api = createFollowsApi(client);
      const result = await api.fetchFollowers('target-user', 'viewer-id');

      expect(result).toHaveLength(2);
      expect(result[0].isFollowing).toBe(true);
      expect(result[1].isFollowing).toBe(false);
    });
  });

  describe('follow', () => {
    it('正しい follower_id, following_id で insert する', async () => {
      const client = createMockClient();
      client._chain.insert.mockResolvedValue({ error: null });

      const api = createFollowsApi(client);
      await api.follow('user-1', 'user-2');

      expect(client.from).toHaveBeenCalledWith('follows');
      expect(client._chain.insert).toHaveBeenCalledWith({
        follower_id: 'user-1',
        following_id: 'user-2',
      });
    });

    it('PK重複 (23505) エラーを吸収する', async () => {
      const client = createMockClient();
      client._chain.insert.mockResolvedValue({
        error: { code: '23505', message: 'duplicate key' },
      });

      const api = createFollowsApi(client);
      await expect(api.follow('user-1', 'user-2')).resolves.toBeUndefined();
    });

    it('23505 以外のエラーは throw する', async () => {
      const client = createMockClient();
      client._chain.insert.mockResolvedValue({
        error: { code: '42501', message: 'permission denied' },
      });

      const api = createFollowsApi(client);
      await expect(api.follow('user-1', 'user-2')).rejects.toEqual({
        code: '42501',
        message: 'permission denied',
      });
    });
  });

  describe('unfollow', () => {
    it('正しい条件で delete する', async () => {
      const client = createMockClient();
      client._chain.eq.mockReturnValueOnce(client._chain);
      client._chain.eq.mockResolvedValueOnce({ error: null });

      const api = createFollowsApi(client);
      await api.unfollow('user-1', 'user-2');

      expect(client.from).toHaveBeenCalledWith('follows');
    });
  });

  describe('fetchFollowCounts', () => {
    it('count クエリのレスポンスを正しくパースする', async () => {
      const client = createMockClient();

      // Promise.all で2回 from() が呼ばれる
      const followingChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
      };
      const followerChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: 10, error: null }),
      };

      client.from
        .mockReturnValueOnce(followingChain)
        .mockReturnValueOnce(followerChain);

      const api = createFollowsApi(client);
      const result = await api.fetchFollowCounts('user-1');

      expect(result).toEqual({
        followingCount: 5,
        followerCount: 10,
      });
    });
  });

  describe('checkIsFollowing', () => {
    it('フォロー中なら true を返す', async () => {
      const client = createMockClient();
      client._chain.maybeSingle.mockResolvedValue({
        data: { follower_id: 'user-1' },
        error: null,
      });

      const api = createFollowsApi(client);
      const result = await api.checkIsFollowing('user-1', 'user-2');

      expect(result).toBe(true);
    });

    it('フォローしていなければ false を返す', async () => {
      const client = createMockClient();
      client._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const api = createFollowsApi(client);
      const result = await api.checkIsFollowing('user-1', 'user-2');

      expect(result).toBe(false);
    });
  });

  describe('fetchUserProfile', () => {
    it('profiles テーブルからユーザーを取得する', async () => {
      const client = createMockClient();
      client._chain.maybeSingle.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const api = createFollowsApi(client);
      const result = await api.fetchUserProfile('user-1');

      expect(result).toEqual(mockProfile);
      expect(client.from).toHaveBeenCalledWith('profiles');
    });

    it('存在しないユーザーは null を返す', async () => {
      const client = createMockClient();
      client._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const api = createFollowsApi(client);
      const result = await api.fetchUserProfile('non-existent');

      expect(result).toBeNull();
    });
  });
});
