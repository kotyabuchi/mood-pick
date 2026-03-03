import {
  mapMovieDetailToContent,
  mapSearchMovieToContent,
  mapSearchTvToContent,
  mapTvDetailToContent,
} from './mappers';

import type { Content } from '@/types';
import type {
  TmdbMovieDetail,
  TmdbPaginatedResponse,
  TmdbSearchMovieResult,
  TmdbSearchMultiResult,
  TmdbSearchTvResult,
  TmdbTvDetail,
} from '@/types/tmdb';

/**
 * Route Handler 経由で TMDb API を呼び出す共通関数
 */
async function tmdbRouteHandlerFetch<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(path, { signal });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error ?? `API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * マルチ検索（映画+TV）— Route Handler 経由
 */
export async function searchMulti(
  query: string,
  page: number = 1,
  signal?: AbortSignal,
): Promise<Content[]> {
  if (query.length < 2) return [];

  const params = new URLSearchParams({ query, page: String(page) });
  const data = await tmdbRouteHandlerFetch<
    TmdbPaginatedResponse<TmdbSearchMultiResult>
  >(`/api/tmdb/search?${params}`, signal);

  return data.results
    .filter(
      (item): item is TmdbSearchMovieResult | TmdbSearchTvResult =>
        item.media_type === 'movie' || item.media_type === 'tv',
    )
    .map((item) =>
      item.media_type === 'movie'
        ? mapSearchMovieToContent(item)
        : mapSearchTvToContent(item),
    );
}

/**
 * 映画詳細取得 — Route Handler 経由
 */
export async function getMovieDetail(
  movieId: number,
  signal?: AbortSignal,
): Promise<Content> {
  const data = await tmdbRouteHandlerFetch<TmdbMovieDetail>(
    `/api/tmdb/movie/${movieId}`,
    signal,
  );
  return mapMovieDetailToContent(data);
}

/**
 * TV詳細取得 — Route Handler 経由
 */
export async function getTvDetail(
  tvId: number,
  signal?: AbortSignal,
): Promise<Content> {
  const data = await tmdbRouteHandlerFetch<TmdbTvDetail>(
    `/api/tmdb/tv/${tvId}`,
    signal,
  );
  return mapTvDetailToContent(data);
}
