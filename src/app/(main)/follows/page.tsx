'use client';

import { useCallback, useMemo, useState } from 'react';

import { ScreenHeader } from '@/components/ui/screen-header';
import { TabBarSegment } from '@/components/ui/tab-bar-segment';
import { UserRow } from '@/components/ui/user-row';
import { mockUsers } from '@/lib/mock-data';

import type { User } from '@/types';

const TABS = [
  { id: 'following', label: 'フォロー' },
  { id: 'followers', label: 'フォロワー' },
];

export default function FollowsPage() {
  const [activeTab, setActiveTab] = useState('following');
  const [users, setUsers] = useState<User[]>(mockUsers);

  const filteredUsers = useMemo(() => {
    if (activeTab === 'following') {
      return users.filter((u) => u.isFollowing);
    }
    return users;
  }, [activeTab, users]);

  const handleFollowToggle = useCallback((userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u,
      ),
    );
  }, []);

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
        {filteredUsers.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            showFollowButton
            onFollowToggle={() => handleFollowToggle(user.id)}
          />
        ))}
      </div>
    </div>
  );
}
