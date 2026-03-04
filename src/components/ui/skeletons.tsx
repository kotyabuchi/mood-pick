import { cn } from '@/lib/cn';

// TEMP: skeleton debug — set to false to restore normal loading behavior
export const FORCE_SKELETON = false;

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('bg-surface-light rounded', className)} />;
}

// --- Poster Card Skeleton ---

function PosterCardSkeleton() {
  return (
    <div className="min-w-0">
      <div className="aspect-[2/3] bg-surface-light rounded-lg" />
      <div className="h-3 w-3/4 bg-surface-light rounded mt-2" />
    </div>
  );
}

// --- Carousel Section Skeleton ---

export function CarouselSectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div>
      <div className="h-5 w-24 bg-surface-light rounded mb-3" />
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
        {Array.from({ length: count }, (_, i) => (
          <PosterCardSkeleton key={`poster-${i.toString()}`} />
        ))}
      </div>
    </div>
  );
}

// --- Home Page Skeleton ---

export function HomePageSkeleton() {
  return (
    <div
      className="space-y-6 px-4 lg:px-0 animate-pulse"
      data-testid="skeleton"
    >
      <CarouselSectionSkeleton count={3} />
      <CarouselSectionSkeleton count={3} />
    </div>
  );
}

// --- Content Card Skeleton (horizontal) ---

function HorizontalCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-2">
      <div className="flex gap-3">
        <div className="w-20 h-[120px] bg-surface-light rounded shrink-0" />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="h-4 w-3/4 bg-surface-light rounded" />
            <div className="h-3 w-1/2 bg-surface-light rounded mt-2" />
            <div className="h-5 w-16 bg-surface-light rounded-full mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContentCardSkeleton({
  variant = 'horizontal',
}: {
  variant?: 'poster' | 'horizontal';
}) {
  if (variant === 'poster') {
    return <PosterCardSkeleton />;
  }
  return <HorizontalCardSkeleton />;
}

// --- List Page Skeleton ---

export function ListPageSkeleton() {
  return (
    <div className="animate-pulse" data-testid="skeleton">
      {/* Tab bar */}
      <div className="px-4 mb-4 lg:px-0">
        <div className="h-10 bg-surface-light rounded-lg" />
      </div>
      {/* Cards */}
      <div className="px-4 space-y-2 pb-8 lg:px-0">
        {Array.from({ length: 5 }, (_, i) => (
          <HorizontalCardSkeleton key={`card-${i.toString()}`} />
        ))}
      </div>
    </div>
  );
}

// --- Feed Card Skeleton ---

function FeedCardSkeletonItem() {
  return (
    <div className="bg-surface rounded-lg mx-4 mb-3 p-3 lg:mx-0">
      {/* Header */}
      <div className="flex items-center mb-2">
        <div className="w-9 h-9 bg-surface-light rounded-full shrink-0" />
        <div className="h-4 w-24 bg-surface-light rounded ml-2 flex-1" />
        <div className="h-3 w-12 bg-surface-light rounded" />
      </div>
      {/* Action text */}
      <div className="h-4 w-3/4 bg-surface-light rounded mb-2" />
      {/* Content thumbnail */}
      <div className="flex mb-2">
        <div className="w-[60px] h-[90px] bg-surface-light rounded shrink-0" />
        <div className="flex-1 ml-3 flex flex-col justify-center">
          <div className="h-4 w-2/3 bg-surface-light rounded" />
          <div className="h-3 w-1/3 bg-surface-light rounded mt-2" />
        </div>
      </div>
      {/* Button */}
      <div className="h-8 w-28 bg-surface-light rounded-full" />
    </div>
  );
}

export function FeedCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="animate-pulse" data-testid="skeleton">
      {Array.from({ length: count }, (_, i) => (
        <FeedCardSkeletonItem key={`feed-${i.toString()}`} />
      ))}
    </div>
  );
}

// --- Notification Skeleton ---

function NotificationSkeletonItem() {
  return (
    <div className="bg-surface rounded-lg mx-4 mb-2 p-3 lg:mx-0">
      <div className="h-4 w-3/4 bg-surface-light rounded" />
      <div className="h-3 w-16 bg-surface-light rounded mt-2" />
    </div>
  );
}

export function NotificationSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="animate-pulse" data-testid="skeleton">
      <div className="px-4 pt-4 pb-2 lg:px-0">
        <div className="h-5 w-12 bg-surface-light rounded" />
      </div>
      {Array.from({ length: count }, (_, i) => (
        <NotificationSkeletonItem key={`notif-${i.toString()}`} />
      ))}
    </div>
  );
}

// --- Profile Skeleton ---

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse" data-testid="skeleton">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center mt-4 mb-3">
        <div className="w-20 h-20 bg-surface-light rounded-full" />
        <div className="h-6 w-32 bg-surface-light rounded mt-3" />
        <div className="h-4 w-20 bg-surface-light rounded mt-1" />
      </div>
      {/* Follow counts */}
      <div className="flex justify-center mb-4 gap-4">
        <div className="h-4 w-20 bg-surface-light rounded" />
        <div className="h-4 w-20 bg-surface-light rounded" />
      </div>
      {/* Stats box */}
      <div className="bg-surface rounded-lg mx-4 p-4 mb-4 lg:mx-0">
        <div className="flex justify-around mb-3">
          <div className="flex flex-col items-center">
            <div className="h-6 w-8 bg-surface-light rounded" />
            <div className="h-3 w-12 bg-surface-light rounded mt-1" />
          </div>
          <div className="flex flex-col items-center">
            <div className="h-6 w-8 bg-surface-light rounded" />
            <div className="h-3 w-12 bg-surface-light rounded mt-1" />
          </div>
          <div className="flex flex-col items-center">
            <div className="h-6 w-8 bg-surface-light rounded" />
            <div className="h-3 w-12 bg-surface-light rounded mt-1" />
          </div>
        </div>
        <div className="border-t border-border pt-3 flex justify-center gap-6">
          <div className="h-3 w-16 bg-surface-light rounded" />
          <div className="h-3 w-16 bg-surface-light rounded" />
        </div>
      </div>
      {/* Carousel */}
      <div className="px-4 lg:px-0">
        <CarouselSectionSkeleton />
      </div>
    </div>
  );
}

// --- Detail Skeleton ---

export function DetailSkeleton() {
  return (
    <div className="relative min-h-screen animate-pulse" data-testid="skeleton">
      {/* Poster */}
      <div className="relative w-full aspect-[2/3] max-h-[60vh] bg-surface-light" />

      {/* Content */}
      <div className="px-4 -mt-4 relative z-10 max-w-4xl mx-auto lg:px-0">
        <div className="h-8 w-48 bg-surface-light rounded mb-2" />
        <div className="h-4 w-32 bg-surface-light rounded mb-4" />

        {/* Badges */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-20 bg-surface-light rounded-full" />
          <div className="h-6 w-20 bg-surface-light rounded-full" />
        </div>

        {/* Moods */}
        <div className="mb-4">
          <div className="h-4 w-16 bg-surface-light rounded mb-2" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-surface-light rounded-full" />
            <div className="h-8 w-24 bg-surface-light rounded-full" />
            <div className="h-8 w-24 bg-surface-light rounded-full" />
          </div>
        </div>

        {/* Synopsis */}
        <div>
          <div className="h-6 w-20 bg-surface-light rounded mb-2" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-surface-light rounded" />
            <div className="h-4 w-full bg-surface-light rounded" />
            <div className="h-4 w-3/4 bg-surface-light rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- User List Skeleton ---

function UserRowSkeleton() {
  return (
    <div className="flex items-center py-2 px-4">
      <div className="w-10 h-10 bg-surface-light rounded-full shrink-0" />
      <div className="flex-1 ml-3">
        <div className="h-4 w-24 bg-surface-light rounded" />
        <div className="h-3 w-16 bg-surface-light rounded mt-1" />
      </div>
      <div className="h-8 w-20 bg-surface-light rounded-full" />
    </div>
  );
}

export function UserListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="animate-pulse" data-testid="skeleton">
      {Array.from({ length: count }, (_, i) => (
        <UserRowSkeleton key={`user-${i.toString()}`} />
      ))}
    </div>
  );
}

// --- Profile Edit Skeleton ---

export function ProfileEditSkeleton() {
  return (
    <div className="animate-pulse px-4 lg:px-0" data-testid="skeleton">
      {/* Avatar */}
      <div className="flex flex-col items-center mt-4 mb-6">
        <div className="w-20 h-20 bg-surface-light rounded-full" />
      </div>
      {/* Inputs */}
      <div className="space-y-4">
        <div>
          <div className="h-4 w-12 bg-surface-light rounded mb-2" />
          <div className="h-12 bg-surface-light rounded-lg" />
        </div>
        <div>
          <div className="h-4 w-16 bg-surface-light rounded mb-2" />
          <div className="h-12 bg-surface-light rounded-lg" />
        </div>
        <div className="h-12 bg-surface-light rounded-lg" />
      </div>
    </div>
  );
}

// --- Recommend Page Skeleton ---

export function RecommendSkeleton() {
  return (
    <div className="animate-pulse" data-testid="skeleton">
      {/* Content info */}
      <div className="px-4 pb-3 border-b border-border lg:px-0">
        <div className="h-4 w-40 bg-surface-light rounded" />
      </div>
      {/* Header */}
      <div className="px-4 pt-3 pb-2 lg:px-0">
        <div className="h-4 w-28 bg-surface-light rounded" />
      </div>
      {/* User list */}
      {Array.from({ length: 4 }, (_, i) => (
        <UserRowSkeleton key={`rec-user-${i.toString()}`} />
      ))}
    </div>
  );
}
