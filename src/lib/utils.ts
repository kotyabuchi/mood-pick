import type { StreamingService } from '@/types';

export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate);
  const now = new Date();
  const targetDate = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = targetDate.getTime() - nowDate.getTime();
  return Math.round(diffMs / 86400000);
}

export function daysFromNow(days: number): string {
  const date = new Date(Date.now() + days * 86400000);
  return date.toISOString();
}

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays >= 7) return '1週間前';
  if (diffDays >= 2) return `${diffDays}日前`;
  if (diffDays >= 1) return '昨日';
  if (diffHours >= 1) return `${diffHours}時間前`;
  return `${diffMin}分前`;
}

export function formatExpirationText(isoDate: string): string {
  const days = daysUntil(isoDate);
  if (days <= 0) return '今日終了';
  if (days === 1) return '明日終了';
  if (days <= 7) return `あと${days}日`;
  const date = new Date(isoDate);
  return `${date.getMonth() + 1}/${date.getDate()} まで`;
}

export function groupByDate<T extends { timestamp: string }>(
  items: T[],
): { today: T[]; yesterday: T[]; thisWeek: T[] } {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;

  const today: T[] = [];
  const yesterday: T[] = [];
  const thisWeek: T[] = [];

  for (const item of items) {
    const ts = new Date(item.timestamp).getTime();
    if (ts >= todayStart) {
      today.push(item);
    } else if (ts >= yesterdayStart) {
      yesterday.push(item);
    } else if (ts >= weekStart) {
      thisWeek.push(item);
    }
  }

  return { today, yesterday, thisWeek };
}

const STREAMING_SERVICE_MAP: Record<
  StreamingService,
  { name: string; color: string; textColor: string }
> = {
  netflix: { name: 'Netflix', color: '#E50914', textColor: '#FFFFFF' },
  prime: { name: 'Prime Video', color: '#00A8E1', textColor: '#FFFFFF' },
  disney: { name: 'Disney+', color: '#0072D2', textColor: '#FFFFFF' },
  'u-next': { name: 'U-NEXT', color: '#FFFFFF', textColor: '#000000' },
  hulu: { name: 'Hulu', color: '#1CE783', textColor: '#000000' },
  abema: { name: 'AbemaTV', color: '#333333', textColor: '#FFFFFF' },
};

export function getStreamingServiceInfo(service: StreamingService): {
  name: string;
  color: string;
  textColor: string;
} {
  return STREAMING_SERVICE_MAP[service];
}
