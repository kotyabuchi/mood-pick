import { describe, expect, it, vi } from 'vitest';

import { createWatchlistApi } from '@/lib/watchlist/api';

function createMockClient() {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
  };

  const client = {
    from: vi.fn().mockReturnValue(chainable),
    _chain: chainable,
  };

  // biome-ignore lint/suspicious/noExplicitAny: テスト用モック
  return client as any;
}

describe('fetchWatchlist sortBy', () => {
  it('デフォルトで created_at DESC を指定する', async () => {
    const client = createMockClient();
    client._chain.eq.mockResolvedValue({ data: [], error: null });

    const api = createWatchlistApi(client);
    await api.fetchWatchlist('want');

    expect(client._chain.order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
  });

  it('sortBy=title で ascending: true を指定する', async () => {
    const client = createMockClient();
    client._chain.eq.mockResolvedValue({ data: [], error: null });

    const api = createWatchlistApi(client);
    await api.fetchWatchlist('want', { sortBy: 'title' });

    expect(client._chain.order).toHaveBeenCalledWith('title', {
      ascending: true,
    });
  });

  it('sortBy=watched_at で nullsFirst: false を指定する', async () => {
    const client = createMockClient();
    client._chain.eq.mockResolvedValue({ data: [], error: null });

    const api = createWatchlistApi(client);
    await api.fetchWatchlist('watched', { sortBy: 'watched_at' });

    expect(client._chain.order).toHaveBeenCalledWith('watched_at', {
      ascending: false,
      nullsFirst: false,
    });
  });

  it('sortBy=created_at で ascending: false を指定する', async () => {
    const client = createMockClient();
    client._chain.eq.mockResolvedValue({ data: [], error: null });

    const api = createWatchlistApi(client);
    await api.fetchWatchlist('want', { sortBy: 'created_at' });

    expect(client._chain.order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
  });

  it('エラー時に throw する', async () => {
    const client = createMockClient();
    client._chain.eq.mockResolvedValue({
      data: null,
      error: { message: 'DB error' },
    });

    const api = createWatchlistApi(client);
    await expect(api.fetchWatchlist('want')).rejects.toEqual({
      message: 'DB error',
    });
  });
});
