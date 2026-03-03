'use client';

import { UserAvatar } from './user-avatar';

import { cn } from '@/lib/cn';

import type { User } from '@/types';

interface UserRowProps {
  user: User;
  onClick?: () => void;
  showFollowButton?: boolean;
  onFollowToggle?: () => void;
}

export function UserRow({
  user,
  onClick,
  showFollowButton,
  onFollowToggle,
}: UserRowProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className="flex items-center py-2 px-4 cursor-pointer hover:bg-surface-light transition-colors rounded-lg"
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      <UserAvatar uri={user.avatarUrl} name={user.name} size={40} />
      <div className="flex-1 ml-3 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {user.name}
        </p>
        <p className="text-xs text-text-secondary">@{user.handle}</p>
      </div>
      {showFollowButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFollowToggle?.();
          }}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
            user.isFollowing
              ? 'bg-surface-light text-text-primary hover:bg-border'
              : 'bg-accent text-white hover:bg-accent-hover',
          )}
        >
          {user.isFollowing ? 'フォロー中' : 'フォローする'}
        </button>
      )}
    </div>
  );
}
