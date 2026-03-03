import { describe, expect, it } from 'vitest';

import {
  buildBackdropUrl,
  buildPosterUrl,
  genreIdsToMoodTags,
  inferAttentionLevel,
  isJapaneseAnime,
  mapMovieDetailToContent,
  mapSearchMovieToContent,
  mapSearchTvToContent,
  mapTvDetailToContent,
} from '@/lib/tmdb/mappers';

import type {
  TmdbMovieDetail,
  TmdbSearchMovieResult,
  TmdbSearchTvResult,
  TmdbTvDetail,
} from '@/types/tmdb';

describe('buildPosterUrl', () => {
  it('posterPathがnullの場合プレースホルダーを返す', () => {
    expect(buildPosterUrl(null)).toBe(
      'https://via.placeholder.com/500x750?text=No+Image',
    );
  });
  it('posterPathがある場合TMDb URLを返す', () => {
    expect(buildPosterUrl('/abc123.jpg')).toBe(
      'https://image.tmdb.org/t/p/w500/abc123.jpg',
    );
  });
  it('sizeパラメータを指定できる', () => {
    expect(buildPosterUrl('/abc.jpg', 'w780')).toBe(
      'https://image.tmdb.org/t/p/w780/abc.jpg',
    );
  });
});

describe('buildBackdropUrl', () => {
  it('backdropPathがnullの場合プレースホルダーを返す', () => {
    expect(buildBackdropUrl(null)).toBe(
      'https://via.placeholder.com/500x750?text=No+Image',
    );
  });
  it('backdropPathがある場合TMDb URLを返す', () => {
    expect(buildBackdropUrl('/bg123.jpg')).toBe(
      'https://image.tmdb.org/t/p/w1280/bg123.jpg',
    );
  });
});

describe('genreIdsToMoodTags', () => {
  it('アクション(28)はexcitedを含む', () => {
    const moods = genreIdsToMoodTags([28]);
    expect(moods).toContain('excited');
  });
  it('コメディ(35)はfunnyを含む', () => {
    const moods = genreIdsToMoodTags([35]);
    expect(moods).toContain('funny');
  });
  it('ドラマ(18)はsadとthinkを含む', () => {
    const moods = genreIdsToMoodTags([18]);
    expect(moods).toContain('sad');
    expect(moods).toContain('think');
  });
  it('最大3個までのタグを返す', () => {
    const moods = genreIdsToMoodTags([28, 35, 18, 10749, 878]);
    expect(moods.length).toBeLessThanOrEqual(3);
  });
  it('未知のジャンルIDは無視する', () => {
    const moods = genreIdsToMoodTags([99999]);
    expect(moods).toHaveLength(0);
  });
  it('空配列は空配列を返す', () => {
    expect(genreIdsToMoodTags([])).toEqual([]);
  });
});

describe('inferAttentionLevel', () => {
  it('60分以下の映画はcasual', () => {
    expect(inferAttentionLevel(60, 'movie')).toBe('casual');
  });
  it('61分以上の映画はfocused', () => {
    expect(inferAttentionLevel(61, 'movie')).toBe('focused');
  });
  it('30分以下のアニメはcasual', () => {
    expect(inferAttentionLevel(24, 'anime')).toBe('casual');
  });
  it('31分のアニメで60分以下はcasual', () => {
    expect(inferAttentionLevel(45, 'anime')).toBe('casual');
  });
  it('61分以上のアニメはfocused', () => {
    expect(inferAttentionLevel(90, 'anime')).toBe('focused');
  });
});

describe('isJapaneseAnime', () => {
  it('genreIdsに16を含み言語がjaならtrue', () => {
    expect(isJapaneseAnime([16], 'ja')).toBe(true);
  });
  it('genreIdsに16を含まなければfalse', () => {
    expect(isJapaneseAnime([28], 'ja')).toBe(false);
  });
  it('言語がja以外ならfalse', () => {
    expect(isJapaneseAnime([16], 'en')).toBe(false);
  });
});

describe('mapSearchMovieToContent', () => {
  const movieResult: TmdbSearchMovieResult = {
    id: 123,
    media_type: 'movie',
    title: 'テスト映画',
    original_title: 'Test Movie',
    original_language: 'ja',
    poster_path: '/poster.jpg',
    release_date: '2023-06-01',
    overview: 'テスト概要',
    genre_ids: [28, 35],
    vote_average: 7.5,
  };

  it('IDがtmdb-movie-{id}形式', () => {
    const content = mapSearchMovieToContent(movieResult);
    expect(content.id).toBe('tmdb-movie-123');
  });
  it('tmdbIdが設定される', () => {
    const content = mapSearchMovieToContent(movieResult);
    expect(content.tmdbId).toBe(123);
  });
  it('typeがmovie', () => {
    const content = mapSearchMovieToContent(movieResult);
    expect(content.type).toBe('movie');
  });
  it('タイトルが設定される', () => {
    const content = mapSearchMovieToContent(movieResult);
    expect(content.title).toBe('テスト映画');
  });
  it('yearがrelease_dateから取得される', () => {
    const content = mapSearchMovieToContent(movieResult);
    expect(content.year).toBe(2023);
  });
  it('posterUrlが生成される', () => {
    const content = mapSearchMovieToContent(movieResult);
    expect(content.posterUrl).toContain('/poster.jpg');
  });
  it('moodTagsがジャンルから生成される', () => {
    const content = mapSearchMovieToContent(movieResult);
    expect(content.moodTags.length).toBeGreaterThan(0);
  });
  it('release_dateが空の場合yearは0', () => {
    const noDate = { ...movieResult, release_date: '' };
    const content = mapSearchMovieToContent(noDate);
    expect(content.year).toBe(0);
  });
});

describe('mapSearchTvToContent', () => {
  const tvResult: TmdbSearchTvResult = {
    id: 456,
    media_type: 'tv',
    name: 'テストドラマ',
    original_name: 'Test Drama',
    original_language: 'en',
    poster_path: '/tv-poster.jpg',
    first_air_date: '2022-01-15',
    overview: 'ドラマ概要',
    genre_ids: [18],
    vote_average: 8.0,
  };

  it('IDがtmdb-tv-{id}形式', () => {
    const content = mapSearchTvToContent(tvResult);
    expect(content.id).toBe('tmdb-tv-456');
  });
  it('英語のドラマはtv type', () => {
    const content = mapSearchTvToContent(tvResult);
    expect(content.type).toBe('tv');
  });
  it('日本語のアニメジャンルはanime type', () => {
    const anime: TmdbSearchTvResult = {
      ...tvResult,
      original_language: 'ja',
      genre_ids: [16],
    };
    const content = mapSearchTvToContent(anime);
    expect(content.type).toBe('anime');
  });
  it('タイトルがnameから取得される', () => {
    const content = mapSearchTvToContent(tvResult);
    expect(content.title).toBe('テストドラマ');
  });
});

describe('mapMovieDetailToContent', () => {
  const movieDetail: TmdbMovieDetail = {
    id: 789,
    title: '詳細映画',
    original_language: 'ja',
    poster_path: '/detail-poster.jpg',
    release_date: '2024-03-01',
    overview: '詳細概要',
    runtime: 150,
    genres: [
      { id: 28, name: 'アクション' },
      { id: 35, name: 'コメディ' },
    ],
    vote_average: 8.5,
  };

  it('runtimeが設定される', () => {
    const content = mapMovieDetailToContent(movieDetail);
    expect(content.runtime).toBe(150);
  });
  it('genreが最初のジャンル名になる', () => {
    const content = mapMovieDetailToContent(movieDetail);
    expect(content.genre).toBe('アクション');
  });
  it('runtimeがnullの場合デフォルト120分', () => {
    const noRuntime = { ...movieDetail, runtime: null };
    const content = mapMovieDetailToContent(noRuntime);
    expect(content.runtime).toBe(120);
  });
  it('genresが空の場合デフォルトジャンル名', () => {
    const noGenres = { ...movieDetail, genres: [] };
    const content = mapMovieDetailToContent(noGenres);
    expect(content.genre).toBe('映画');
  });
});

describe('mapTvDetailToContent', () => {
  const tvDetail: TmdbTvDetail = {
    id: 101,
    name: '詳細ドラマ',
    original_language: 'en',
    poster_path: '/tv-detail.jpg',
    first_air_date: '2023-09-01',
    overview: 'TV詳細概要',
    episode_run_time: [45],
    genres: [{ id: 18, name: 'ドラマ' }],
    vote_average: 7.0,
    number_of_seasons: 3,
    number_of_episodes: 30,
  };

  it('runtimeがepisode_run_timeの最初の値', () => {
    const content = mapTvDetailToContent(tvDetail);
    expect(content.runtime).toBe(45);
  });
  it('episode_run_timeが空の場合デフォルト45分', () => {
    const noRuntime = { ...tvDetail, episode_run_time: [] };
    const content = mapTvDetailToContent(noRuntime);
    expect(content.runtime).toBe(45);
  });
  it('日本語アニメはanime type', () => {
    const anime: TmdbTvDetail = {
      ...tvDetail,
      original_language: 'ja',
      genres: [{ id: 16, name: 'アニメーション' }],
    };
    const content = mapTvDetailToContent(anime);
    expect(content.type).toBe('anime');
  });
  it('genresが空の場合デフォルトジャンル名', () => {
    const noGenres = { ...tvDetail, genres: [] };
    const content = mapTvDetailToContent(noGenres);
    expect(content.genre).toBe('ドラマ');
  });
});
