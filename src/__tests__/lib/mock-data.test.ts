import { describe, expect, it } from 'vitest';

import {
  mockContents,
  mockCurrentUser,
  mockFeedItems,
  mockMoodSearchResults,
  mockNotifications,
  mockSearchResults,
  mockUsers,
  mockWatchlistItems,
} from '@/lib/mock-data';

describe('mockContents', () => {
  it('15件のコンテンツがある', () => {
    expect(mockContents).toHaveLength(15);
  });
  it('各コンテンツに必須フィールドがある', () => {
    for (const content of mockContents) {
      expect(content.id).toBeTruthy();
      expect(content.tmdbId).toBeGreaterThan(0);
      expect(content.title).toBeTruthy();
      expect(['movie', 'tv', 'anime']).toContain(content.type);
      expect(content.posterUrl).toBeTruthy();
      expect(content.year).toBeGreaterThan(0);
      expect(content.moodTags.length).toBeGreaterThan(0);
    }
  });
  it('映画、TV、アニメの3タイプが含まれる', () => {
    const types = new Set(mockContents.map((c) => c.type));
    expect(types.has('movie')).toBe(true);
    expect(types.has('tv')).toBe(true);
    expect(types.has('anime')).toBe(true);
  });
});

describe('mockWatchlistItems', () => {
  it('20件のウォッチリストアイテムがある', () => {
    expect(mockWatchlistItems).toHaveLength(20);
  });
  it('各ステータスのアイテムが含まれる', () => {
    const statuses = new Set(mockWatchlistItems.map((i) => i.status));
    expect(statuses.has('want')).toBe(true);
    expect(statuses.has('watching')).toBe(true);
    expect(statuses.has('watched')).toBe(true);
    expect(statuses.has('dropped')).toBe(true);
  });
  it('watchedアイテムにはratingがある', () => {
    const watched = mockWatchlistItems.filter((i) => i.status === 'watched');
    for (const item of watched) {
      expect(item.rating).toBeGreaterThanOrEqual(1);
      expect(item.rating).toBeLessThanOrEqual(5);
    }
  });
  it('watchingアイテムにはmemoがある', () => {
    const watching = mockWatchlistItems.filter((i) => i.status === 'watching');
    for (const item of watching) {
      expect(item.memo).toBeTruthy();
    }
  });
});

describe('mockUsers', () => {
  it('6人のユーザーがいる', () => {
    expect(mockUsers).toHaveLength(6);
  });
  it('各ユーザーに必須フィールドがある', () => {
    for (const user of mockUsers) {
      expect(user.id).toBeTruthy();
      expect(user.name).toBeTruthy();
      expect(user.handle).toBeTruthy();
    }
  });
  it('フォロー中とフォローしていないユーザーが混在する', () => {
    const following = mockUsers.filter((u) => u.isFollowing);
    const notFollowing = mockUsers.filter((u) => !u.isFollowing);
    expect(following.length).toBeGreaterThan(0);
    expect(notFollowing.length).toBeGreaterThan(0);
  });
});

describe('mockCurrentUser', () => {
  it('プロフィール情報が正しい', () => {
    expect(mockCurrentUser.id).toBeTruthy();
    expect(mockCurrentUser.name).toBeTruthy();
    expect(mockCurrentUser.handle).toBeTruthy();
    expect(mockCurrentUser.stats).toBeDefined();
    expect(mockCurrentUser.stats.watched).toBeGreaterThan(0);
  });
  it('recentWatchedが含まれる', () => {
    expect(mockCurrentUser.recentWatched.length).toBeGreaterThan(0);
  });
});

describe('mockFeedItems', () => {
  it('8件のフィードアイテムがある', () => {
    expect(mockFeedItems).toHaveLength(8);
  });
  it('各アクションタイプが含まれる', () => {
    const types = new Set(mockFeedItems.map((f) => f.actionType));
    expect(types.has('watched')).toBe(true);
    expect(types.has('watching')).toBe(true);
    expect(types.has('want')).toBe(true);
    expect(types.has('recommend')).toBe(true);
  });
  it('watchedにはratingがある', () => {
    const watched = mockFeedItems.filter((f) => f.actionType === 'watched');
    for (const item of watched) {
      expect(item.rating).toBeDefined();
    }
  });
  it('recommendにはmessageがある', () => {
    const recommend = mockFeedItems.filter((f) => f.actionType === 'recommend');
    for (const item of recommend) {
      expect(item.message).toBeTruthy();
    }
  });
});

describe('mockNotifications', () => {
  it('8件の通知がある', () => {
    expect(mockNotifications).toHaveLength(8);
  });
  it('未読通知が含まれる', () => {
    const unread = mockNotifications.filter((n) => !n.isRead);
    expect(unread.length).toBeGreaterThan(0);
  });
  it('各タイプの通知が含まれる', () => {
    const types = new Set(mockNotifications.map((n) => n.type));
    expect(types.has('expiring')).toBe(true);
    expect(types.has('follow')).toBe(true);
    expect(types.has('recommendation')).toBe(true);
  });
});

describe('mockSearchResults', () => {
  it('空文字を渡すと空配列を返す', () => {
    expect(mockSearchResults('')).toEqual([]);
  });
  it('タイトルに一致するコンテンツを返す', () => {
    const results = mockSearchResults('オッペンハイマー');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('オッペンハイマー');
  });
  it('一致しないクエリは空配列を返す', () => {
    const results = mockSearchResults('存在しない映画タイトル');
    expect(results).toHaveLength(0);
  });
  it('結果にisInWatchlistフラグが含まれる', () => {
    const results = mockSearchResults('DUNE');
    for (const result of results) {
      expect(typeof result.isInWatchlist).toBe('boolean');
    }
  });
});

describe('mockMoodSearchResults', () => {
  it('excitedムードでwantステータスのアイテムを返す', () => {
    const results = mockMoodSearchResults(['excited']);
    expect(results.length).toBeGreaterThan(0);
    for (const item of results) {
      expect(item.status).toBe('want');
      expect(item.moodTags).toContain('excited');
    }
  });
  it('複数ムードでOR検索される', () => {
    const results = mockMoodSearchResults(['sad', 'funny']);
    expect(results.length).toBeGreaterThan(0);
    for (const item of results) {
      expect(item.status).toBe('want');
      const hasMood =
        item.moodTags.includes('sad') || item.moodTags.includes('funny');
      expect(hasMood).toBe(true);
    }
  });
});
