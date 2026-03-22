'use client';

import { ArrowSquareOutIcon } from '@phosphor-icons/react/ssr';
import Image from 'next/image';

import { BottomSheet } from './bottom-sheet';

import { useWatchProviders } from '@/hooks/use-watch-providers';

import type { TmdbWatchProvider } from '@/types/tmdb';

interface WatchProvidersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tmdbId: number;
  contentType: 'movie' | 'tv';
}

const SECTION_LABELS: Record<string, string> = {
  flatrate: '定額',
  rent: 'レンタル',
  buy: '購入',
};

const SECTION_KEYS = ['flatrate', 'rent', 'buy'] as const;

function ProviderGrid({ providers }: { providers: TmdbWatchProvider[] }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {providers.map((provider) => (
        <div
          key={provider.provider_id}
          className="flex flex-col items-center gap-1.5"
        >
          <Image
            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
            alt={provider.provider_name}
            width={48}
            height={48}
            className="rounded-lg"
          />
          <span className="text-[10px] text-text-secondary text-center leading-tight line-clamp-2">
            {provider.provider_name}
          </span>
        </div>
      ))}
    </div>
  );
}

const SKELETON_KEYS = ['sk-1', 'sk-2', 'sk-3', 'sk-4'];

function SkeletonGrid() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-16 bg-surface-light rounded animate-pulse" />
      <div className="grid grid-cols-4 gap-3">
        {SKELETON_KEYS.map((key) => (
          <div key={key} className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 bg-surface-light rounded-lg animate-pulse" />
            <div className="h-2.5 w-10 bg-surface-light rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function WatchProvidersSheet({
  open,
  onOpenChange,
  tmdbId,
  contentType,
}: WatchProvidersSheetProps) {
  const {
    data: providers,
    isLoading,
    isError,
    refetch,
  } = useWatchProviders(tmdbId, contentType);

  const hasProviders =
    providers &&
    SECTION_KEYS.some((key) => providers[key] && providers[key].length > 0);

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="どこで見る？">
      {isLoading ? (
        <SkeletonGrid />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-text-secondary">
            配信情報の取得に失敗しました
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm text-accent font-semibold hover:underline"
          >
            再試行
          </button>
        </div>
      ) : !providers || !hasProviders ? (
        <p className="text-sm text-text-secondary text-center py-6">
          配信情報が見つかりません
        </p>
      ) : (
        <div className="space-y-5">
          {SECTION_KEYS.map((key) => {
            const list = providers[key];
            if (!list || list.length === 0) return null;
            return (
              <div key={key}>
                <p className="text-xs font-semibold text-text-secondary mb-2">
                  {SECTION_LABELS[key]}
                </p>
                <ProviderGrid providers={list} />
              </div>
            );
          })}

          <a
            href={providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-border text-sm font-semibold text-text-primary hover:bg-surface-light transition-colors"
          >
            JustWatchで開く
            <ArrowSquareOutIcon size={16} />
          </a>

          <p className="text-[10px] text-text-disabled text-center">
            配信情報はTMDb提供・JustWatch経由
          </p>
        </div>
      )}
    </BottomSheet>
  );
}
