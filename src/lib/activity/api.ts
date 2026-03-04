import { mapActivityRowToFeedItem } from './mappers';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { FeedItem } from '@/types';
import type { Database, ProfileRow } from '@/types/database';

/**
 * DI パターン: Supabase クライアントを注入して Activity API を生成
 */
export function createActivityApi(client: SupabaseClient<Database>) {
  async function fetchFeed(): Promise<FeedItem[]> {
    const { data, error } = await client
      .from('activity_log')
      .select(
        '*, profiles!activity_log_user_id_fkey(id, name, handle, avatar_url)',
      )
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(50);

    if (error) throw error;

    return (data ?? []).map((row) => {
      const profile = row.profiles as unknown as Pick<
        ProfileRow,
        'id' | 'name' | 'handle' | 'avatar_url'
      > | null;
      return mapActivityRowToFeedItem(row, profile);
    });
  }

  return {
    fetchFeed,
  };
}
