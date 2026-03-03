'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useSupabaseClient } from './use-supabase';

import { useAuth } from '@/context/auth-context';
import {
  createFollowsApi,
  followKeys,
  mapProfileRowToUser,
} from '@/lib/follows';

import type { User } from '@/types';

export function useUserProfile(userId?: string) {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createFollowsApi(supabase), [supabase]);

  return useQuery({
    queryKey: [...followKeys.all, 'profile', userId] as const,
    queryFn: async (): Promise<User | null> => {
      if (!userId) return null;

      const [profile, counts, isFollowing] = await Promise.all([
        api.fetchUserProfile(userId),
        api.fetchFollowCounts(userId),
        user ? api.checkIsFollowing(user.id, userId) : Promise.resolve(false),
      ]);

      if (!profile) return null;

      return mapProfileRowToUser(profile, counts, isFollowing);
    },
    enabled: !!user && !!userId,
  });
}
