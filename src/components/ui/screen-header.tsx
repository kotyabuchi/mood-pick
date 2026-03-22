'use client';

import { CaretLeftIcon } from '@phosphor-icons/react/ssr';
import { useRouter } from 'next/navigation';

import type { ComponentType, ReactNode } from 'react';

type IconComponent = ComponentType<{
  size?: string | number;
  className?: string;
}>;

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  rightIcon?: IconComponent;
  onRightPress?: () => void;
  rightAction?: ReactNode;
}

export function ScreenHeader({
  title,
  onBack,
  showBack,
  rightIcon: RightIcon,
  onRightPress,
  rightAction,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = onBack ?? (() => router.back());

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <div className="w-10">
        {(showBack ?? !!onBack) && (
          <button
            type="button"
            onClick={handleBack}
            data-testid="back-button"
            className="text-text-primary hover:text-text-secondary transition-colors"
          >
            <CaretLeftIcon size={24} />
          </button>
        )}
      </div>
      <h1 className="text-lg font-bold text-text-primary flex-1 text-center">
        {title}
      </h1>
      <div className="w-10 flex justify-end">
        {rightAction ??
          (RightIcon && onRightPress && (
            <button
              type="button"
              onClick={onRightPress}
              data-testid="right-button"
              className="text-text-primary hover:text-text-secondary transition-colors"
            >
              <RightIcon size={24} />
            </button>
          ))}
      </div>
    </header>
  );
}
