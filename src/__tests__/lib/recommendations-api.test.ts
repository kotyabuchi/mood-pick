import { describe, expect, it, vi } from 'vitest';

import { createRecommendationsApi } from '@/lib/recommendations/api';

import type { ContentDetail } from '@/types';

const mockContent: ContentDetail = {
  id: 'tmdb-movie-550',
  tmdbId: 550,
  title: 'ファイト・クラブ',
  type: 'movie',
  posterUrl: '/poster.jpg',
  year: 1999,
  genre: 'ドラマ',
  runtime: 139,
  synopsis: 'テスト概要',
  moodTags: ['excited'],
  attentionLevel: 'focused',
  streaming: [],
};

function createMockClient() {
  const chainable = {
    insert: vi.fn(),
  };

  const client = {
    from: vi.fn().mockReturnValue(chainable),
    _chain: chainable,
  };

  // biome-ignore lint/suspicious/noExplicitAny: テスト用モック
  return client as any;
}

describe('createRecommendationsApi', () => {
  describe('sendRecommendations', () => {
    it('recommendations テーブルに insert する', async () => {
      const client = createMockClient();
      client._chain.insert.mockResolvedValue({ error: null });

      const api = createRecommendationsApi(client);
      await api.sendRecommendations('user-1', {
        toUserIds: ['user-2', 'user-3'],
        content: mockContent,
        contentType: 'movie',
        message: 'おすすめ！',
      });

      expect(client.from).toHaveBeenCalledWith('recommendations');
      expect(client._chain.insert).toHaveBeenCalledWith([
        {
          from_user_id: 'user-1',
          to_user_id: 'user-2',
          tmdb_id: 550,
          content_type: 'movie',
          title: 'ファイト・クラブ',
          poster_url: '/poster.jpg',
          year: 1999,
          genre: 'ドラマ',
          runtime: 139,
          message: 'おすすめ！',
        },
        {
          from_user_id: 'user-1',
          to_user_id: 'user-3',
          tmdb_id: 550,
          content_type: 'movie',
          title: 'ファイト・クラブ',
          poster_url: '/poster.jpg',
          year: 1999,
          genre: 'ドラマ',
          runtime: 139,
          message: 'おすすめ！',
        },
      ]);
    });

    it('anime を tv に正規化する', async () => {
      const client = createMockClient();
      client._chain.insert.mockResolvedValue({ error: null });

      const api = createRecommendationsApi(client);
      await api.sendRecommendations('user-1', {
        toUserIds: ['user-2'],
        content: { ...mockContent, type: 'anime' },
        contentType: 'anime',
      });

      const insertArgs = client._chain.insert.mock.calls[0][0];
      expect(insertArgs[0].content_type).toBe('tv');
    });

    it('message が空の場合は null になる', async () => {
      const client = createMockClient();
      client._chain.insert.mockResolvedValue({ error: null });

      const api = createRecommendationsApi(client);
      await api.sendRecommendations('user-1', {
        toUserIds: ['user-2'],
        content: mockContent,
        contentType: 'movie',
      });

      const insertArgs = client._chain.insert.mock.calls[0][0];
      expect(insertArgs[0].message).toBeNull();
    });

    it('error がある場合は throw する', async () => {
      const client = createMockClient();
      client._chain.insert.mockResolvedValue({
        error: { message: 'RLS violation' },
      });

      const api = createRecommendationsApi(client);
      await expect(
        api.sendRecommendations('user-1', {
          toUserIds: ['user-2'],
          content: mockContent,
          contentType: 'movie',
        }),
      ).rejects.toEqual({ message: 'RLS violation' });
    });
  });
});
