import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContentDetail, ContentType } from '@/types';
import type { Database } from '@/types/database';

interface SendRecommendationsParams {
  toUserIds: string[];
  content: ContentDetail;
  contentType: ContentType;
  message?: string;
}

function normalizeContentType(type: ContentType): 'movie' | 'tv' {
  return type === 'anime' ? 'tv' : type;
}

export function createRecommendationsApi(client: SupabaseClient<Database>) {
  async function sendRecommendations(
    fromUserId: string,
    params: SendRecommendationsParams,
  ): Promise<void> {
    const { toUserIds, content, contentType, message } = params;
    const normalizedType = normalizeContentType(contentType);

    const rows = toUserIds.map((toUserId) => ({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      tmdb_id: content.tmdbId,
      content_type: normalizedType,
      title: content.title,
      poster_url: content.posterUrl,
      year: content.year,
      genre: content.genre,
      runtime: content.runtime,
      message: message || null,
    }));

    const { error } = await client.from('recommendations').insert(rows);

    if (error) throw error;
  }

  return { sendRecommendations };
}
