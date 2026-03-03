/** TMDb search/multi のレスポンス項目（映画） */
export interface TmdbSearchMovieResult {
  id: number;
  media_type: 'movie';
  title: string;
  original_title: string;
  original_language: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  genre_ids: number[];
  vote_average: number;
}

/** TMDb search/multi のレスポンス項目（TV） */
export interface TmdbSearchTvResult {
  id: number;
  media_type: 'tv';
  name: string;
  original_name: string;
  original_language: string;
  poster_path: string | null;
  first_air_date: string;
  overview: string;
  genre_ids: number[];
  vote_average: number;
}

/** TMDb search/multi のレスポンス項目（人物 - フィルタアウト用） */
export interface TmdbSearchPersonResult {
  id: number;
  media_type: 'person';
  name: string;
}

export type TmdbSearchMultiResult =
  | TmdbSearchMovieResult
  | TmdbSearchTvResult
  | TmdbSearchPersonResult;

/** ページネーション付きレスポンス */
export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/** 映画詳細 */
export interface TmdbMovieDetail {
  id: number;
  title: string;
  original_language: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  vote_average: number;
}

/** TV詳細 */
export interface TmdbTvDetail {
  id: number;
  name: string;
  original_language: string;
  poster_path: string | null;
  first_air_date: string;
  overview: string;
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  vote_average: number;
  number_of_seasons: number;
  number_of_episodes: number;
}

/** APIエラー */
export interface TmdbApiError {
  status_code: number;
  status_message: string;
}
