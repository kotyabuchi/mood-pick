'use client';

import { useCallback, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { ScreenHeader } from '@/components/ui/screen-header';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/cn';
import { mockContents, mockUsers } from '@/lib/mock-data';

import type { User } from '@/types';

export default function RecommendPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const content = useMemo(() => mockContents.find((c) => c.id === id), [id]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(),
  );
  const [message, setMessage] = useState('');

  const handleToggleUser = useCallback((userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }, []);

  const renderUserItem = useCallback(
    (item: User) => {
      const isSelected = selectedUserIds.has(item.id);
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => handleToggleUser(item.id)}
          className="flex items-center w-full py-3 px-4 hover:bg-surface-light transition-colors lg:px-0"
        >
          <div
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 shrink-0',
              isSelected ? 'bg-accent border-accent' : 'border-text-secondary',
            )}
          >
            {isSelected && <Check size={16} className="text-white" />}
          </div>
          <UserAvatar uri={item.avatarUrl} name={item.name} size={40} />
          <div className="flex-1 ml-3 text-left min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              {item.name}
            </p>
            <p className="text-xs text-text-secondary">@{item.handle}</p>
          </div>
        </button>
      );
    },
    [selectedUserIds, handleToggleUser],
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-screen">
      <ScreenHeader title="友達におすすめ" showBack />

      {/* Content info */}
      {content && (
        <div className="px-4 pb-3 border-b border-border lg:px-0">
          <p className="text-sm font-bold text-text-primary">{content.title}</p>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-3 pb-2 lg:px-0">
        <p className="text-sm font-bold text-text-primary">送る相手を選ぶ</p>
      </div>

      {/* User checklist */}
      <div className="flex-1 overflow-y-auto pb-2">
        {mockUsers.map(renderUserItem)}
      </div>

      {/* Message input + Send button */}
      <div className="px-4 pb-4 border-t border-border pt-3 lg:px-0">
        <p className="text-xs text-text-secondary mb-1">メッセージ（任意）</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="一言メッセージを添える..."
          className="w-full bg-surface rounded-lg p-3 text-sm text-text-primary placeholder:text-text-disabled outline-none resize-none mb-3"
          rows={2}
        />
        <button
          type="button"
          disabled={selectedUserIds.size === 0}
          onClick={() => router.back()}
          className={cn(
            'w-full rounded-lg py-3 text-sm font-bold transition-colors',
            selectedUserIds.size > 0
              ? 'bg-accent text-white hover:bg-accent-hover'
              : 'bg-surface-light text-text-disabled cursor-not-allowed',
          )}
        >
          おすすめを送る
        </button>
      </div>
    </div>
  );
}
