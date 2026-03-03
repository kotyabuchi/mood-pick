import type { AttentionLevelId, Content, ContentType, MoodId } from '@/types';
import type {
  TmdbMovieDetail,
  TmdbSearchMovieResult,
  TmdbSearchTvResult,
  TmdbTvDetail,
} from '@/types/tmdb';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const PLACEHOLDER_POSTER = 'https://via.placeholder.com/500x750?text=No+Image';

const GENRE_MOOD_MAP: Record<number, MoodId[]> = {
  28: ['excited'],
  12: ['excited'],
  16: ['funny', 'chill'],
  35: ['funny'],
  80: ['think', 'excited'],
  99: ['think'],
  18: ['sad', 'think'],
  10751: ['chill', 'funny'],
  14: ['excited', 'chill'],
  36: ['think'],
  27: ['excited'],
  10402: ['chill'],
  9648: ['think', 'excited'],
  10749: ['sad', 'chill'],
  878: ['think', 'excited'],
  10770: ['chill'],
  53: ['excited', 'think'],
  10752: ['think', 'sad'],
  37: ['excited'],
  10759: ['excited'],
  10762: ['chill', 'funny'],
  10763: ['think'],
  10764: ['chill'],
  10765: ['excited', 'think'],
  10766: ['sad', 'chill'],
  10767: ['chill'],
  10768: ['think', 'sad'],
};

export function buildPosterUrl(
  posterPath: string | null,
  size: string = 'w500',
): string {
  if (!posterPath) return PLACEHOLDER_POSTER;
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

export function buildBackdropUrl(
  backdropPath: string | null,
  size: string = 'w1280',
): string {
  if (!backdropPath) return PLACEHOLDER_POSTER;
  return `${TMDB_IMAGE_BASE}/${size}${backdropPath}`;
}

export function genreIdsToMoodTags(genreIds: number[]): MoodId[] {
  const moods = new Set<MoodId>();
  for (const id of genreIds) {
    const mapped = GENRE_MOOD_MAP[id];
    if (mapped) mapped.forEach((m) => moods.add(m));
  }
  return [...moods].slice(0, 3);
}

export function inferAttentionLevel(
  runtime: number,
  type: ContentType,
): AttentionLevelId {
  if (type === 'anime' && runtime <= 30) return 'casual';
  if (runtime <= 60) return 'casual';
  return 'focused';
}

export function isJapaneseAnime(
  genreIds: number[],
  originalLanguage: string,
): boolean {
  return genreIds.includes(16) && originalLanguage === 'ja';
}

export function mapSearchMovieToContent(item: TmdbSearchMovieResult): Content {
  const year = item.release_date
    ? parseInt(item.release_date.slice(0, 4), 10)
    : 0;
  return {
    id: `tmdb-movie-${item.id}`,
    tmdbId: item.id,
    title: item.title,
    type: 'movie',
    posterUrl: buildPosterUrl(item.poster_path),
    year,
    genre: '',
    runtime: 0,
    synopsis: item.overview,
    moodTags: genreIdsToMoodTags(item.genre_ids),
    attentionLevel: 'focused',
    streaming: [],
  };
}

export function mapSearchTvToContent(item: TmdbSearchTvResult): Content {
  const year = item.first_air_date
    ? parseInt(item.first_air_date.slice(0, 4), 10)
    : 0;
  const isAnime = isJapaneseAnime(item.genre_ids, item.original_language);
  return {
    id: `tmdb-tv-${item.id}`,
    tmdbId: item.id,
    title: item.name,
    type: isAnime ? 'anime' : 'tv',
    posterUrl: buildPosterUrl(item.poster_path),
    year,
    genre: '',
    runtime: 0,
    synopsis: item.overview,
    moodTags: genreIdsToMoodTags(item.genre_ids),
    attentionLevel: 'casual',
    streaming: [],
  };
}

export function mapMovieDetailToContent(movie: TmdbMovieDetail): Content {
  const year = movie.release_date
    ? parseInt(movie.release_date.slice(0, 4), 10)
    : 0;
  const runtime = movie.runtime ?? 120;
  const genreIds = movie.genres.map((g) => g.id);
  const genreName = movie.genres[0]?.name ?? '映画';
  return {
    id: `tmdb-movie-${movie.id}`,
    tmdbId: movie.id,
    title: movie.title,
    type: 'movie',
    posterUrl: buildPosterUrl(movie.poster_path),
    year,
    genre: genreName,
    runtime,
    synopsis: movie.overview,
    moodTags: genreIdsToMoodTags(genreIds),
    attentionLevel: inferAttentionLevel(runtime, 'movie'),
    streaming: [],
  };
}

export function mapTvDetailToContent(tv: TmdbTvDetail): Content {
  const year = tv.first_air_date
    ? parseInt(tv.first_air_date.slice(0, 4), 10)
    : 0;
  const runtime = tv.episode_run_time[0] ?? 45;
  const genreIds = tv.genres.map((g) => g.id);
  const genreName = tv.genres[0]?.name ?? 'ドラマ';
  const isAnime = isJapaneseAnime(genreIds, tv.original_language);
  return {
    id: `tmdb-tv-${tv.id}`,
    tmdbId: tv.id,
    title: tv.name,
    type: isAnime ? 'anime' : 'tv',
    posterUrl: buildPosterUrl(tv.poster_path),
    year,
    genre: genreName,
    runtime,
    synopsis: tv.overview,
    moodTags: genreIdsToMoodTags(genreIds),
    attentionLevel: inferAttentionLevel(runtime, isAnime ? 'anime' : 'tv'),
    streaming: [],
  };
}
