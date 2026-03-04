'use client';

import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabaseClient } from './use-supabase';

import { useAuth } from '@/context/auth-context';
import { followKeys } from '@/lib/follows';
import { createProfileApi, profileKeys } from '@/lib/profile';

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createProfileApi(supabase), [supabase]);

  return useMutation({
    mutationFn: (updates: {
      name?: string;
      handle?: string | null;
      avatar_url?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      return api.updateProfile(user.id, updates);
    },
    onSuccess: (data) => {
      if (!user) return;
      queryClient.setQueryData(profileKeys.own(user.id), data);
      queryClient.invalidateQueries({ queryKey: followKeys.all });
    },
  });
}

export function useUploadAvatar() {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createProfileApi(supabase), [supabase]);

  return useMutation({
    mutationFn: (file: File) => {
      if (!user) throw new Error('Not authenticated');
      return api.uploadAvatar(user.id, file);
    },
  });
}

export function useCheckHandle() {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createProfileApi(supabase), [supabase]);

  return useMutation({
    mutationFn: (handle: string) => {
      if (!user) throw new Error('Not authenticated');
      return api.checkHandleAvailable(handle, user.id);
    },
  });
}
