import { mapProfileRowToListUser } from './mappers';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@/types';
import type { Database, ProfileRow } from '@/types/database';

export function createFollowsApi(client: SupabaseClient<Database>) {
  async function fetchFollowing(userId: string): Promise<User[]> {
    const { data, error } = await client
      .from('follows')
      .select('following_id, profiles!follows_following_id_fkey(*)')
      .eq('follower_id', userId);

    if (error) throw error;

    return (data ?? [])
      .filter((row) => row.profiles !== null)
      .map((row) => {
        const profile = row.profiles as unknown as ProfileRow;
        return mapProfileRowToListUser(profile, true);
      });
  }

  async function fetchFollowers(
    userId: string,
    viewerId?: string,
  ): Promise<User[]> {
    const { data, error } = await client
      .from('follows')
      .select('follower_id, profiles!follows_follower_id_fkey(*)')
      .eq('following_id', userId);

    if (error) throw error;

    const followers = (data ?? [])
      .filter((row) => row.profiles !== null)
      .map((row) => {
        const profile = row.profiles as unknown as ProfileRow;
        return mapProfileRowToListUser(profile);
      });

    if (!viewerId || followers.length === 0) return followers;

    // Resolve isFollowing for each follower
    const { data: followingData } = await client
      .from('follows')
      .select('following_id')
      .eq('follower_id', viewerId)
      .in(
        'following_id',
        followers.map((f) => f.id),
      );

    const followingSet = new Set(
      (followingData ?? []).map((row) => row.following_id),
    );

    return followers.map((f) => ({
      ...f,
      isFollowing: followingSet.has(f.id),
    }));
  }

  async function fetchFollowCounts(
    userId: string,
  ): Promise<{ followingCount: number; followerCount: number }> {
    const [followingResult, followerResult] = await Promise.all([
      client
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId),
      client
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId),
    ]);

    if (followingResult.error) throw followingResult.error;
    if (followerResult.error) throw followerResult.error;

    return {
      followingCount: followingResult.count ?? 0,
      followerCount: followerResult.count ?? 0,
    };
  }

  async function checkIsFollowing(
    followerId: string,
    followingId: string,
  ): Promise<boolean> {
    const { data, error } = await client
      .from('follows')
      .select('follower_id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) throw error;
    return data !== null;
  }

  async function follow(
    followerId: string,
    followingId: string,
  ): Promise<void> {
    const { error } = await client
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });

    if (error) {
      // PK duplicate (23505) = already following → silent fail
      if (error.code === '23505') return;
      throw error;
    }
  }

  async function unfollow(
    followerId: string,
    followingId: string,
  ): Promise<void> {
    const { error } = await client
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  }

  async function fetchUserProfile(userId: string): Promise<ProfileRow | null> {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  return {
    fetchFollowing,
    fetchFollowers,
    fetchFollowCounts,
    checkIsFollowing,
    follow,
    unfollow,
    fetchUserProfile,
  };
}
