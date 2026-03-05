'use client';

import { cn } from '@/lib/cn';

import type { LucideIcon } from 'lucide-react';

interface MoodChipProps {
  mood: { id: string; icon: LucideIcon; label: string };
  selected: boolean;
  onPress: () => void;
}

export function MoodChip({ mood, selected, onPress }: MoodChipProps) {
  const Icon = mood.icon;
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 border text-xs font-semibold transition-colors',
        selected
          ? 'bg-accent-subtle border-accent text-accent'
          : 'bg-surface-light border-border text-text-secondary hover:border-text-secondary',
      )}
    >
      <Icon size={14} className="mr-1" aria-hidden="true" />
      {mood.label}
    </button>
  );
}
