'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md';
  editable?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  size = 'sm',
  editable = false,
  onChange,
}: StarRatingProps) {
  const iconSize = size === 'sm' ? 14 : 20;

  return (
    <div className="flex gap-0.5">
      {([1, 2, 3, 4, 5] as const).map((starValue) => {
        const isFilled = starValue <= rating;

        const star = (
          <Star
            key={starValue}
            size={iconSize}
            className={isFilled ? 'fill-warning text-warning' : 'text-warning'}
            data-testid={isFilled ? 'star-filled' : 'star-outline'}
          />
        );

        if (editable) {
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onChange?.(starValue)}
              data-testid={isFilled ? 'star-filled' : 'star-outline'}
            >
              <Star
                size={iconSize}
                className={
                  isFilled ? 'fill-warning text-warning' : 'text-warning'
                }
              />
            </button>
          );
        }

        return star;
      })}
    </div>
  );
}
