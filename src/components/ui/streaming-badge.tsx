import {
  daysUntil,
  formatExpirationText,
  getStreamingServiceInfo,
} from '@/lib/utils';

import type { StreamingService } from '@/types';

interface StreamingBadgeProps {
  service: StreamingService;
  expiresAt?: string | null;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

export function StreamingBadge({
  service,
  expiresAt,
  size = 'sm',
  onClick,
}: StreamingBadgeProps) {
  const info = getStreamingServiceInfo(service);
  const showExpiration =
    expiresAt && daysUntil(expiresAt) <= 7 && daysUntil(expiresAt) >= 0;

  const content = (
    <span
      className={`inline-flex items-center rounded-full px-1.5 py-0.5 font-semibold ${
        size === 'sm' ? 'text-[10px]' : 'text-xs'
      }`}
      style={{ backgroundColor: info.color, color: info.textColor }}
    >
      {info.name}
      {showExpiration && (
        <span className="ml-1">{formatExpirationText(expiresAt)}</span>
      )}
    </span>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick}>
        {content}
      </button>
    );
  }

  return content;
}
