import type { User } from '@/types';
import type { ProfileRow } from '@/types/database';

export function mapProfileRowToListUser(
  row: ProfileRow,
  isFollowing?: boolean,
): User {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle ?? '',
    avatarUrl: row.avatar_url,
    followingCount: 0,
    followerCount: 0,
    isFollowing,
  };
}

export function mapProfileRowToUser(
  row: ProfileRow,
  counts: { followingCount: number; followerCount: number },
  isFollowing?: boolean,
): User {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle ?? '',
    avatarUrl: row.avatar_url,
    followingCount: counts.followingCount,
    followerCount: counts.followerCount,
    isFollowing,
  };
}
