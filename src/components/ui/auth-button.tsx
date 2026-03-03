'use client';

import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/cn';

interface AuthButtonProps {
  title: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
}

export function AuthButton({
  title,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  type = 'button',
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      data-testid="auth-button"
      className={cn(
        'w-full py-4 rounded-lg flex items-center justify-center font-bold text-sm transition-colors',
        variant === 'primary'
          ? isDisabled
            ? 'bg-accent/50 text-white cursor-not-allowed'
            : 'bg-accent text-white hover:bg-accent-hover'
          : isDisabled
            ? 'border border-text-secondary/50 text-text-primary/50 cursor-not-allowed'
            : 'border border-text-secondary text-text-primary hover:bg-surface-light',
      )}
    >
      {loading ? (
        <Loader2
          size={20}
          className="animate-spin"
          data-testid="loading-indicator"
        />
      ) : (
        title
      )}
    </button>
  );
}
