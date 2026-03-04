'use client';

import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabaseClient } from './use-supabase';

import { feedKeys } from '@/lib/activity';
import { notificationKeys } from '@/lib/notifications';
import {
  createRecommendationsApi,
  recommendationKeys,
} from '@/lib/recommendations';

import type { ContentDetail, ContentType } from '@/types';

interface SendRecommendationsInput {
  toUserIds: string[];
  content: ContentDetail;
  contentType: ContentType;
  message?: string;
}

export function useSendRecommendations(userId?: string) {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createRecommendationsApi(supabase), [supabase]);

  return useMutation({
    mutationFn: (input: SendRecommendationsInput) => {
      if (!userId) throw new Error('User not authenticated');
      return api.sendRecommendations(userId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: recommendationKeys.all });
    },
  });
}
