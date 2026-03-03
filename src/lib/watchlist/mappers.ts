import type {
  AttentionLevelId,
  Content,
  ContentType,
  MoodId,
  WatchlistItem,
  WatchStatus,
} from '@/types';
import type { WatchlistItemInsert, WatchlistItemRow } from '@/types/database';

export function mapRowToWatchlistItem(row: WatchlistItemRow): WatchlistItem {
  return {
    id: `tmdb-${row.type}-${row.tmdb_id}`,
    watchlistId: row.id,
    tmdbId: row.tmdb_id,
    title: row.title,
    type: row.type as ContentType,
    posterUrl: row.poster_url,
    year: row.year,
    genre: row.genre,
    runtime: row.runtime,
    synopsis: row.synopsis,
    moodTags: row.mood_tags as MoodId[],
    attentionLevel: row.attention_level as AttentionLevelId,
    streaming: [],
    status: row.status as WatchStatus,
    memo: row.memo,
    rating: row.rating,
    review: row.review,
    watchedAt: row.watched_at,
    droppedAt: row.dropped_at,
    createdAt: row.created_at,
  };
}

export function parseTmdbIdFromContentId(contentId: string): number | null {
  const match = contentId.match(/^tmdb-\w+-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

export function mapContentToInsertRow(
  content: Content,
  status: WatchStatus = 'want',
): WatchlistItemInsert {
  return {
    tmdb_id: content.tmdbId,
    title: content.title,
    type: content.type,
    poster_url: content.posterUrl,
    year: content.year,
    genre: content.genre,
    runtime: content.runtime,
    synopsis: content.synopsis,
    mood_tags: content.moodTags,
    attention_level: content.attentionLevel,
    status,
  };
}
