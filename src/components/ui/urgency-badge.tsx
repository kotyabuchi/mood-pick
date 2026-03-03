import { daysUntil, formatExpirationText } from '@/lib/utils';

interface UrgencyBadgeProps {
  expiresAt: string;
}

export function UrgencyBadge({ expiresAt }: UrgencyBadgeProps) {
  const days = daysUntil(expiresAt);

  if (days > 7 || days < 0) return null;

  return (
    <span className="inline-flex rounded-full bg-error px-1.5 py-0.5 text-[10px] font-bold text-white">
      {formatExpirationText(expiresAt)}
    </span>
  );
}
