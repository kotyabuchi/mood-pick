import { mapRowToWatchlistItem } from './mappers';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { WatchlistItem, WatchlistSortOption, WatchStatus } from '@/types';
import type {
  Database,
  WatchlistItemInsert,
  WatchlistItemUpdate,
} from '@/types/database';

/**
 * DI パターン: Supabase クライアントを注入して Watchlist API を生成
 */
export function createWatchlistApi(client: SupabaseClient<Database>) {
  async function fetchWatchlist(
    status?: WatchStatus,
    options?: {
      sortBy?: WatchlistSortOption;
      limit?: number;
      offset?: number;
    },
  ): Promise<WatchlistItem[]> {
    const sortBy = options?.sortBy ?? 'created_at';
    const ascending = sortBy === 'title';

    let query = client
      .from('watchlist_items')
      .select('*')
      .order(sortBy, {
        ascending,
        ...(sortBy === 'watched_at' ? { nullsFirst: false } : {}),
      });

    if (status) {
      query = query.eq('status', status);
    }

    if (options?.limit) {
      const from = options.offset ?? 0;
      query = query.range(from, from + options.limit - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data ?? []).map(mapRowToWatchlistItem);
  }

  async function fetchWatchlistItem(
    tmdbId: number,
  ): Promise<WatchlistItem | null> {
    const { data, error } = await client
      .from('watchlist_items')
      .select('*')
      .eq('tmdb_id', tmdbId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapRowToWatchlistItem(data) : null;
  }

  async function addWatchlistItem(
    item: WatchlistItemInsert,
  ): Promise<WatchlistItem> {
    const { data, error } = await client
      .from('watchlist_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return mapRowToWatchlistItem(data);
  }

  async function updateWatchlistItem(
    tmdbId: number,
    updates: WatchlistItemUpdate,
  ): Promise<WatchlistItem> {
    const { data, error } = await client
      .from('watchlist_items')
      .update(updates)
      .eq('tmdb_id', tmdbId)
      .select()
      .single();

    if (error) throw error;
    return mapRowToWatchlistItem(data);
  }

  async function removeWatchlistItem(tmdbId: number): Promise<void> {
    const { error } = await client
      .from('watchlist_items')
      .delete()
      .eq('tmdb_id', tmdbId);

    if (error) throw error;
  }

  async function fetchWatchlistStats(): Promise<{
    want: number;
    watching: number;
    watched: number;
    dropped: number;
  }> {
    const [wantResult, watchingResult, watchedResult, droppedResult] =
      await Promise.all([
        client
          .from('watchlist_items')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'want'),
        client
          .from('watchlist_items')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'watching'),
        client
          .from('watchlist_items')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'watched'),
        client
          .from('watchlist_items')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'dropped'),
      ]);

    if (wantResult.error) throw wantResult.error;
    if (watchingResult.error) throw watchingResult.error;
    if (watchedResult.error) throw watchedResult.error;
    if (droppedResult.error) throw droppedResult.error;

    return {
      want: wantResult.count ?? 0,
      watching: watchingResult.count ?? 0,
      watched: watchedResult.count ?? 0,
      dropped: droppedResult.count ?? 0,
    };
  }

  async function fetchTimedWatchStats(): Promise<{
    thisMonth: number;
    thisYear: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

    const [monthResult, yearResult] = await Promise.all([
      client
        .from('watchlist_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'watched')
        .gte('watched_at', startOfMonth),
      client
        .from('watchlist_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'watched')
        .gte('watched_at', startOfYear),
    ]);

    if (monthResult.error) throw monthResult.error;
    if (yearResult.error) throw yearResult.error;

    return {
      thisMonth: monthResult.count ?? 0,
      thisYear: yearResult.count ?? 0,
    };
  }

  return {
    fetchWatchlist,
    fetchWatchlistItem,
    addWatchlistItem,
    updateWatchlistItem,
    removeWatchlistItem,
    fetchWatchlistStats,
    fetchTimedWatchStats,
  };
}
