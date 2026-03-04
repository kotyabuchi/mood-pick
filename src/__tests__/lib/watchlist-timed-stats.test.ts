import { describe, expect, it, vi } from 'vitest';

import { createWatchlistApi } from '@/lib/watchlist/api';

function createMockClient() {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn(),
  };

  const client = {
    from: vi.fn().mockReturnValue(chainable),
    _chain: chainable,
  };

  // biome-ignore lint/suspicious/noExplicitAny: テスト用モック
  return client as any;
}

describe('fetchTimedWatchStats', () => {
  it('今月と今年の watched 件数を返す', async () => {
    const monthChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ count: 5, error: null }),
    };
    const yearChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ count: 20, error: null }),
    };

    const client = createMockClient();
    client.from.mockReturnValueOnce(monthChain).mockReturnValueOnce(yearChain);

    const api = createWatchlistApi(client);
    const result = await api.fetchTimedWatchStats();

    expect(result).toEqual({ thisMonth: 5, thisYear: 20 });
  });

  it('status=watched でフィルタする', async () => {
    const monthChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
    };
    const yearChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
    };

    const client = createMockClient();
    client.from.mockReturnValueOnce(monthChain).mockReturnValueOnce(yearChain);

    const api = createWatchlistApi(client);
    await api.fetchTimedWatchStats();

    expect(monthChain.eq).toHaveBeenCalledWith('status', 'watched');
    expect(yearChain.eq).toHaveBeenCalledWith('status', 'watched');
  });

  it('watched_at に対して gte フィルタを適用する', async () => {
    const now = new Date();
    const expectedMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();
    const expectedYearStart = new Date(now.getFullYear(), 0, 1).toISOString();

    const monthChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
    };
    const yearChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
    };

    const client = createMockClient();
    client.from.mockReturnValueOnce(monthChain).mockReturnValueOnce(yearChain);

    const api = createWatchlistApi(client);
    await api.fetchTimedWatchStats();

    expect(monthChain.gte).toHaveBeenCalledWith(
      'watched_at',
      expectedMonthStart,
    );
    expect(yearChain.gte).toHaveBeenCalledWith('watched_at', expectedYearStart);
  });

  it('月クエリのエラーを throw する', async () => {
    const monthChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({
        count: null,
        error: { message: 'DB error' },
      }),
    };
    const yearChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
    };

    const client = createMockClient();
    client.from.mockReturnValueOnce(monthChain).mockReturnValueOnce(yearChain);

    const api = createWatchlistApi(client);
    await expect(api.fetchTimedWatchStats()).rejects.toEqual({
      message: 'DB error',
    });
  });
});
