'use client';

import { cn } from '@/lib/cn';

interface MoodChipProps {
  mood: { id: string; emoji: string; label: string };
  selected: boolean;
  onPress: () => void;
}

export function MoodChip({ mood, selected, onPress }: MoodChipProps) {
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
      <span className="mr-1">{mood.emoji}</span>
      {mood.label}
    </button>
  );
}
