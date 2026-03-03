'use client';

import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabaseClient } from './use-supabase';

import { useAuth } from '@/context/auth-context';
import { createFollowsApi, followKeys } from '@/lib/follows';

import type { User } from '@/types';

export function useToggleFollow() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();
  const api = useMemo(() => createFollowsApi(supabase), [supabase]);

  return useMutation({
    mutationFn: async ({
      targetId,
      isCurrentlyFollowing,
    }: {
      targetId: string;
      isCurrentlyFollowing: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');
      if (isCurrentlyFollowing) {
        await api.unfollow(user.id, targetId);
      } else {
        await api.follow(user.id, targetId);
      }
    },
    onMutate: async ({ targetId, isCurrentlyFollowing }) => {
      if (!user) return;

      await queryClient.cancelQueries({ queryKey: followKeys.all });

      // Save previous state for rollback
      const prevFollowing = queryClient.getQueryData<User[]>(
        followKeys.following(user.id),
      );
      const prevFollowers = queryClient.getQueryData<User[]>(
        followKeys.followers(user.id),
      );
      const prevCounts = queryClient.getQueryData<{
        followingCount: number;
        followerCount: number;
      }>(followKeys.counts(user.id));
      const prevIsFollowing = queryClient.getQueryData<boolean>(
        followKeys.isFollowing(user.id, targetId),
      );

      // Optimistic update: isFollowing
      queryClient.setQueryData(
        followKeys.isFollowing(user.id, targetId),
        !isCurrentlyFollowing,
      );

      // Optimistic update: counts
      if (prevCounts) {
        queryClient.setQueryData(followKeys.counts(user.id), {
          ...prevCounts,
          followingCount:
            prevCounts.followingCount + (isCurrentlyFollowing ? -1 : 1),
        });
      }

      // Optimistic update: following list
      if (prevFollowing) {
        if (isCurrentlyFollowing) {
          queryClient.setQueryData(
            followKeys.following(user.id),
            prevFollowing.filter((u) => u.id !== targetId),
          );
        }
      }

      return { prevFollowing, prevFollowers, prevCounts, prevIsFollowing };
    },
    onError: (_err, { targetId }, context) => {
      if (!user || !context) return;

      queryClient.setQueryData(
        followKeys.following(user.id),
        context.prevFollowing,
      );
      queryClient.setQueryData(
        followKeys.followers(user.id),
        context.prevFollowers,
      );
      queryClient.setQueryData(followKeys.counts(user.id), context.prevCounts);
      queryClient.setQueryData(
        followKeys.isFollowing(user.id, targetId),
        context.prevIsFollowing,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: followKeys.all });
    },
  });
}
