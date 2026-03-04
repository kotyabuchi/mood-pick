'use client';

import { useCallback, useMemo, useState } from 'react';
import { Check, Loader2, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/context/auth-context';
import { useContentDetail } from '@/hooks/use-content-detail';
import { useFollowing } from '@/hooks/use-follows';
import { useSendRecommendations } from '@/hooks/use-recommendation-mutations';
import { cn } from '@/lib/cn';

import type { ContentType, User } from '@/types';

function parseContentId(id: string): {
  tmdbId: number;
  type: ContentType;
} | null {
  const match = id.match(/^tmdb-(movie|tv|anime)-(\d+)$/);
  if (!match) return null;
  return {
    type: match[1] as ContentType,
    tmdbId: parseInt(match[2], 10),
  };
}

function normalizeType(type: ContentType): 'movie' | 'tv' {
  return type === 'anime' ? 'tv' : type;
}

export default function RecommendPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const parsed = useMemo(() => parseContentId(id), [id]);
  const fetchType = parsed ? normalizeType(parsed.type) : null;

  const { content, isLoading: contentLoading } = useContentDetail(
    parsed?.tmdbId ?? null,
    fetchType,
  );
  const {
    data: followingUsers,
    isLoading: usersLoading,
    isError: usersError,
  } = useFollowing(user?.id);

  const { mutate: sendRecommendations, isPending: isSending } =
    useSendRecommendations(user?.id);

  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(),
  );
  const [message, setMessage] = useState('');
  const [sendError, setSendError] = useState(false);

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

  const handleSend = useCallback(() => {
    if (!content || !parsed || selectedUserIds.size === 0) return;

    setSendError(false);
    sendRecommendations(
      {
        toUserIds: Array.from(selectedUserIds),
        content,
        contentType: parsed.type,
        message: message.trim() || undefined,
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: () => {
          setSendError(true);
        },
      },
    );
  }, [content, parsed, selectedUserIds, message, sendRecommendations, router]);

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

  const isLoading = contentLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col min-h-screen">
        <ScreenHeader title="友達におすすめ" showBack />
        <div
          className="flex justify-center py-20"
          data-testid="loading-spinner"
        >
          <Loader2 className="w-8 h-8 text-text-secondary animate-spin" />
        </div>
      </div>
    );
  }

  if (usersError || !content) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col min-h-screen">
        <ScreenHeader title="友達におすすめ" showBack />
        <div className="px-4 py-20 text-center" data-testid="error-message">
          <p className="text-text-secondary">読み込みに失敗しました</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-screen">
      <ScreenHeader title="友達におすすめ" showBack />

      {/* Content info */}
      <div className="px-4 pb-3 border-b border-border lg:px-0">
        <p className="text-sm font-bold text-text-primary">{content.title}</p>
      </div>

      {/* Header */}
      <div className="px-4 pt-3 pb-2 lg:px-0">
        <p className="text-sm font-bold text-text-primary">送る相手を選ぶ</p>
      </div>

      {/* User checklist */}
      <div className="flex-1 overflow-y-auto pb-2">
        {followingUsers && followingUsers.length > 0 ? (
          followingUsers.map(renderUserItem)
        ) : (
          <div data-testid="empty-users">
            <EmptyState
              icon={Users}
              title="フォロー中のユーザーがいません"
              description="ユーザーをフォローするとおすすめを送れます"
            />
          </div>
        )}
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
        {sendError && (
          <p className="text-xs text-red-500 mb-2" data-testid="send-error">
            送信に失敗しました。もう一度お試しください。
          </p>
        )}
        <button
          type="button"
          disabled={selectedUserIds.size === 0 || isSending}
          onClick={handleSend}
          className={cn(
            'w-full rounded-lg py-3 text-sm font-bold transition-colors',
            selectedUserIds.size > 0 && !isSending
              ? 'bg-accent text-white hover:bg-accent-hover'
              : 'bg-surface-light text-text-disabled cursor-not-allowed',
          )}
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            'おすすめを送る'
          )}
        </button>
      </div>
    </div>
  );
}
