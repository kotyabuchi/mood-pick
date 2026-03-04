'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useSupabaseClient } from './use-supabase';

import { useAuth } from '@/context/auth-context';
import { createFollowsApi } from '@/lib/follows';
import { profileKeys } from '@/lib/profile';

export function useOwnProfile() {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createFollowsApi(supabase), [supabase]);

  return useQuery({
    queryKey: profileKeys.own(user?.id ?? ''),
    queryFn: () => api.fetchUserProfile(user?.id ?? ''),
    enabled: !!user,
  });
}
