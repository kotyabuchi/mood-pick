import { describe, expect, it, vi } from 'vitest';

import { createActivityApi } from '@/lib/activity/api';

import type { ActivityLogRow, ProfileRow } from '@/types/database';

const mockProfile: Pick<ProfileRow, 'id' | 'name' | 'handle' | 'avatar_url'> = {
  id: 'user-1',
  name: 'テストユーザー',
  handle: 'test_user',
  avatar_url: null,
};

const mockActivityRow: ActivityLogRow & {
  profiles: typeof mockProfile | null;
} = {
  id: 'act-1',
  user_id: 'user-1',
  tmdb_id: 12345,
  action_type: 'watched',
  rating: 5,
  review: '素晴らしい映画',
  message: null,
  recipient_id: null,
  title: 'テスト映画',
  poster_url: 'https://example.com/poster.jpg',
  content_type: 'movie',
  genre: 'SF',
  runtime: 120,
  year: 2024,
  created_at: '2025-01-01T00:00:00Z',
  profiles: mockProfile,
};

function createMockClient() {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn(),
  };

  const client = {
    from: vi.fn().mockReturnValue(chainable),
    _chain: chainable,
  };

  // biome-ignore lint/suspicious/noExplicitAny: テスト用モック
  return client as any;
}

describe('createActivityApi', () => {
  describe('fetchFeed', () => {
    it('activity_log を profiles JOIN で取得し FeedItem[] に変換する', async () => {
      const client = createMockClient();
      client._chain.limit.mockResolvedValue({
        data: [mockActivityRow],
        error: null,
      });

      const api = createActivityApi(client);
      const result = await api.fetchFeed();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'act-1',
        user: {
          id: 'user-1',
          name: 'テストユーザー',
          handle: 'test_user',
          avatarUrl: null,
          followingCount: 0,
          followerCount: 0,
        },
        actionType: 'watched',
        content: {
          id: 'tmdb-movie-12345',
          tmdbId: 12345,
          title: 'テスト映画',
          type: 'movie',
          posterUrl: 'https://example.com/poster.jpg',
          year: 2024,
          genre: 'SF',
          runtime: 120,
          synopsis: '',
          moodTags: [],
          attentionLevel: 'casual',
          streaming: [],
        },
        timestamp: '2025-01-01T00:00:00Z',
        rating: 5,
        review: '素晴らしい映画',
        message: undefined,
      });

      expect(client.from).toHaveBeenCalledWith('activity_log');
    });

    it('profiles が null の場合でも user_id をフォールバックする', async () => {
      const client = createMockClient();
      client._chain.limit.mockResolvedValue({
        data: [{ ...mockActivityRow, profiles: null }],
        error: null,
      });

      const api = createActivityApi(client);
      const result = await api.fetchFeed();

      expect(result[0].user.id).toBe('user-1');
      expect(result[0].user.name).toBe('');
    });

    it('data が null の場合は空配列を返す', async () => {
      const client = createMockClient();
      client._chain.limit.mockResolvedValue({
        data: null,
        error: null,
      });

      const api = createActivityApi(client);
      const result = await api.fetchFeed();

      expect(result).toEqual([]);
    });

    it('error がある場合は throw する', async () => {
      const client = createMockClient();
      client._chain.limit.mockResolvedValue({
        data: null,
        error: { message: 'DB error' },
      });

      const api = createActivityApi(client);
      await expect(api.fetchFeed()).rejects.toEqual({ message: 'DB error' });
    });

    it('created_at DESC, id DESC の順序でクエリする', async () => {
      const client = createMockClient();
      client._chain.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      const api = createActivityApi(client);
      await api.fetchFeed();

      expect(client._chain.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
      expect(client._chain.order).toHaveBeenCalledWith('id', {
        ascending: false,
      });
      expect(client._chain.limit).toHaveBeenCalledWith(50);
    });

    it('rating/review/message が null の場合は undefined になる', async () => {
      const client = createMockClient();
      client._chain.limit.mockResolvedValue({
        data: [
          {
            ...mockActivityRow,
            action_type: 'want',
            rating: null,
            review: null,
            message: null,
          },
        ],
        error: null,
      });

      const api = createActivityApi(client);
      const result = await api.fetchFeed();

      expect(result[0].rating).toBeUndefined();
      expect(result[0].review).toBeUndefined();
      expect(result[0].message).toBeUndefined();
    });
  });
});
