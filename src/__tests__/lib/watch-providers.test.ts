import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getWatchProviders } from '@/lib/tmdb/client';

import type { TmdbWatchProvidersResponse } from '@/types/tmdb';

const mockJPRegion = {
  link: 'https://www.themoviedb.org/movie/550/watch?locale=JP',
  flatrate: [
    {
      logo_path: '/netflix.png',
      provider_id: 8,
      provider_name: 'Netflix',
      display_priority: 1,
    },
  ],
  rent: [
    {
      logo_path: '/amazon.png',
      provider_id: 10,
      provider_name: 'Amazon Video',
      display_priority: 2,
    },
  ],
};

const mockResponseWithJP: TmdbWatchProvidersResponse = {
  id: 550,
  results: {
    JP: mockJPRegion,
    US: {
      link: 'https://www.themoviedb.org/movie/550/watch?locale=US',
      flatrate: [],
    },
  },
};

const mockResponseWithoutJP: TmdbWatchProvidersResponse = {
  id: 550,
  results: {
    US: {
      link: 'https://www.themoviedb.org/movie/550/watch?locale=US',
      flatrate: [],
    },
  },
};

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponseWithJP),
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getWatchProviders', () => {
  it('JP リージョンデータがある場合、正しく返す', async () => {
    const result = await getWatchProviders(550, 'movie');

    expect(result).toEqual(mockJPRegion);
    expect(fetch).toHaveBeenCalledWith('/api/tmdb/movie/550/watch-providers', {
      signal: undefined,
    });
  });

  it('JP リージョンがない場合 null を返す', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponseWithoutJP),
    } as Response);

    const result = await getWatchProviders(550, 'movie');

    expect(result).toBeNull();
  });

  it('fetch エラー時に throw する', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    await expect(getWatchProviders(550, 'movie')).rejects.toThrow(
      'Network error',
    );
  });

  it('レスポンスが !ok の場合 throw する', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
      json: () => Promise.resolve({ error: 'Not found' }),
    } as Response);

    await expect(getWatchProviders(550, 'movie')).rejects.toThrow('Not found');
  });

  it('AbortSignal を fetch に渡す', async () => {
    const controller = new AbortController();

    await getWatchProviders(550, 'tv', controller.signal);

    expect(fetch).toHaveBeenCalledWith('/api/tmdb/tv/550/watch-providers', {
      signal: controller.signal,
    });
  });
});
