'use client';

import { Loader2, UserIcon } from 'lucide-react';
import { useParams } from 'next/navigation';

import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/context/auth-context';
import { useToggleFollow } from '@/hooks/use-follow-mutations';
import { useUserProfile } from '@/hooks/use-user-profile';
import { cn } from '@/lib/cn';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const { data: user, isLoading } = useUserProfile(id);
  const toggleFollow = useToggleFollow();

  const isSelf = currentUser?.id === id;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <ScreenHeader title="" showBack />
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-text-secondary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <ScreenHeader title="" showBack />
        <EmptyState
          icon={UserIcon}
          title="ユーザーが見つかりません"
          description="存在しないユーザーです"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ScreenHeader title="" showBack />

      <div className="pb-8">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center mt-4 mb-3">
          <UserAvatar uri={user.avatarUrl} name={user.name} size={80} />
          <h2 className="text-xl font-bold text-text-primary mt-3">
            {user.name}
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">@{user.handle}</p>
        </div>

        {/* Follow counts */}
        <div className="flex justify-center mb-4 gap-4">
          <p className="text-sm text-text-primary">
            <span className="font-bold">{user.followingCount}</span> フォロー
          </p>
          <p className="text-sm text-text-primary">
            <span className="font-bold">{user.followerCount}</span> フォロワー
          </p>
        </div>

        {/* Follow button (hidden for self) */}
        {!isSelf && (
          <div className="px-4 mb-4 lg:px-0">
            <button
              type="button"
              disabled={toggleFollow.isPending}
              onClick={() =>
                toggleFollow.mutate({
                  targetId: user.id,
                  isCurrentlyFollowing: user.isFollowing ?? false,
                })
              }
              className={cn(
                'w-full rounded-lg py-2.5 text-sm font-bold transition-colors',
                user.isFollowing
                  ? 'bg-surface-light text-text-primary hover:bg-border'
                  : 'bg-accent text-white hover:bg-accent-hover',
                toggleFollow.isPending && 'opacity-50 cursor-not-allowed',
              )}
            >
              {user.isFollowing ? 'フォロー中' : 'フォローする'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
