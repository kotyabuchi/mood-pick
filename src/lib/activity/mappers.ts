import type { ContentType, FeedActionType, FeedItem } from '@/types';
import type { ActivityLogRow, ProfileRow } from '@/types/database';

/**
 * activity_log の行 + profiles JOIN 結果から FeedItem を構築する。
 * Content の moodTags / attentionLevel / streaming / synopsis はフィード表示に不要なためデフォルト値。
 * TODO: AddToWatchlistDialog 経由で使用される場合は tmdbId で TMDb API から再取得すること。
 */
export function mapActivityRowToFeedItem(
  row: ActivityLogRow,
  profile: Pick<ProfileRow, 'id' | 'name' | 'handle' | 'avatar_url'> | null,
): FeedItem {
  return {
    id: row.id,
    user: {
      id: profile?.id ?? row.user_id,
      name: profile?.name ?? '',
      handle: profile?.handle ?? '',
      avatarUrl: profile?.avatar_url ?? null,
      followingCount: 0,
      followerCount: 0,
    },
    actionType: row.action_type as FeedActionType,
    content: {
      id: `tmdb-${row.content_type}-${row.tmdb_id}`,
      tmdbId: row.tmdb_id,
      title: row.title,
      type: row.content_type as ContentType,
      posterUrl: row.poster_url,
      year: row.year,
      genre: row.genre,
      runtime: row.runtime,
      synopsis: '',
      moodTags: [],
      attentionLevel: 'casual',
      streaming: [],
    },
    timestamp: row.created_at,
    rating: row.rating ?? undefined,
    review: row.review ?? undefined,
    message: row.message ?? undefined,
  };
}
