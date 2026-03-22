'use client';

import { useState } from 'react';
import { UsersIcon } from '@phosphor-icons/react/ssr';

import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { FORCE_SKELETON, UserListSkeleton } from '@/components/ui/skeletons';
import { TabBarSegment } from '@/components/ui/tab-bar-segment';
import { UserRow } from '@/components/ui/user-row';
import { useAuth } from '@/context/auth-context';
import { useToggleFollow } from '@/hooks/use-follow-mutations';
import { useFollowers, useFollowing } from '@/hooks/use-follows';

const TABS = [
  { id: 'following', label: 'フォロー' },
  { id: 'followers', label: 'フォロワー' },
];

export default function FollowsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('following');

  const { data: following = [], isLoading: isLoadingFollowing } = useFollowing(
    user?.id,
  );
  const { data: followers = [], isLoading: isLoadingFollowers } = useFollowers(
    user?.id,
  );

  const toggleFollow = useToggleFollow();

  const users = activeTab === 'following' ? following : followers;
  const isLoading =
    activeTab === 'following' ? isLoadingFollowing : isLoadingFollowers;

  return (
    <div className="max-w-4xl mx-auto">
      <ScreenHeader title="つながり" showBack />

      <div className="px-4 mb-2 lg:px-0">
        <TabBarSegment
          tabs={TABS}
          activeId={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <div className="pb-8">
        {FORCE_SKELETON || isLoading ? ( // TEMP: skeleton debug
          <UserListSkeleton />
        ) : users.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title={
              activeTab === 'following'
                ? 'まだ誰もフォローしていません'
                : 'まだフォロワーがいません'
            }
            description={
              activeTab === 'following'
                ? '気になるユーザーをフォローしてみましょう'
                : '他のユーザーにフォローされるとここに表示されます'
            }
          />
        ) : (
          users.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              showFollowButton={u.id !== user?.id}
              onFollowToggle={() =>
                toggleFollow.mutate({
                  targetId: u.id,
                  isCurrentlyFollowing: u.isFollowing ?? false,
                })
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
