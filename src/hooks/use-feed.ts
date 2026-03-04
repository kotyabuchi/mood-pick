'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useSupabaseClient } from './use-supabase';

import { useAuth } from '@/context/auth-context';
import { createActivityApi, feedKeys } from '@/lib/activity';

export function useFeed() {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createActivityApi(supabase), [supabase]);

  return useQuery({
    queryKey: feedKeys.list(),
    queryFn: () => api.fetchFeed(),
    enabled: !!user,
  });
}
