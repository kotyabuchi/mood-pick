'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useSupabaseClient } from './use-supabase';

import { useAuth } from '@/context/auth-context';
import { createFollowsApi, followKeys } from '@/lib/follows';

export function useFollowing(userId?: string) {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createFollowsApi(supabase), [supabase]);

  return useQuery({
    queryKey: followKeys.following(userId ?? ''),
    queryFn: () => api.fetchFollowing(userId ?? ''),
    enabled: !!user && !!userId,
  });
}

export function useFollowers(userId?: string) {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createFollowsApi(supabase), [supabase]);

  return useQuery({
    queryKey: followKeys.followers(userId ?? ''),
    queryFn: () => api.fetchFollowers(userId ?? '', user?.id),
    enabled: !!user && !!userId,
  });
}

export function useFollowCounts(userId?: string) {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createFollowsApi(supabase), [supabase]);

  return useQuery({
    queryKey: followKeys.counts(userId ?? ''),
    queryFn: () => api.fetchFollowCounts(userId ?? ''),
    enabled: !!user && !!userId,
  });
}

export function useIsFollowing(targetId?: string) {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createFollowsApi(supabase), [supabase]);

  return useQuery({
    queryKey: followKeys.isFollowing(user?.id ?? '', targetId ?? ''),
    queryFn: () => api.checkIsFollowing(user?.id ?? '', targetId ?? ''),
    enabled: !!user && !!targetId,
  });
}
