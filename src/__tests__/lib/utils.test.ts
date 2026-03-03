import { describe, expect, it } from 'vitest';

import {
  daysFromNow,
  daysUntil,
  formatExpirationText,
  formatRelativeTime,
  getStreamingServiceInfo,
  groupByDate,
} from '@/lib/utils';

describe('daysUntil', () => {
  it('今日の日付を渡すと0を返す', () => {
    const today = new Date().toISOString();
    expect(daysUntil(today)).toBe(0);
  });
  it('明日の日付を渡すと1を返す', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    expect(daysUntil(tomorrow)).toBe(1);
  });
  it('昨日の日付を渡すと-1を返す', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(daysUntil(yesterday)).toBe(-1);
  });
  it('7日後の日付を渡すと7を返す', () => {
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();
    expect(daysUntil(nextWeek)).toBe(7);
  });
});

describe('daysFromNow', () => {
  it('0を渡すと今日のISO文字列を返す', () => {
    const result = daysFromNow(0);
    expect(new Date(result).toDateString()).toBe(new Date().toDateString());
  });
  it('正の数を渡すと未来の日付を返す', () => {
    const result = daysFromNow(3);
    expect(daysUntil(result)).toBe(3);
  });
  it('負の数を渡すと過去の日付を返す', () => {
    const result = daysFromNow(-5);
    expect(daysUntil(result)).toBe(-5);
  });
});

describe('formatRelativeTime', () => {
  it('1時間前の日時を渡すと「1時間前」を返す', () => {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    expect(formatRelativeTime(oneHourAgo)).toBe('1時間前');
  });
  it('3時間前の日時を渡すと「3時間前」を返す', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(formatRelativeTime(threeHoursAgo)).toBe('3時間前');
  });
  it('25時間前の日時を渡すと「昨日」を返す', () => {
    const yesterday = new Date(Date.now() - 25 * 3600000).toISOString();
    expect(formatRelativeTime(yesterday)).toBe('昨日');
  });
  it('3日前の日時を渡すと「3日前」を返す', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(formatRelativeTime(threeDaysAgo)).toBe('3日前');
  });
  it('7日前の日時を渡すと「1週間前」を返す', () => {
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    expect(formatRelativeTime(oneWeekAgo)).toBe('1週間前');
  });
  it('30分前の日時を渡すと「30分前」を返す', () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60000).toISOString();
    expect(formatRelativeTime(thirtyMinAgo)).toBe('30分前');
  });
});

describe('formatExpirationText', () => {
  it('今日の日付を渡すと「今日終了」を返す', () => {
    const today = new Date().toISOString();
    expect(formatExpirationText(today)).toBe('今日終了');
  });
  it('明日の日付を渡すと「明日終了」を返す', () => {
    const tomorrow = daysFromNow(1);
    expect(formatExpirationText(tomorrow)).toBe('明日終了');
  });
  it('3日後の日付を渡すと「あと3日」を返す', () => {
    const threeDays = daysFromNow(3);
    expect(formatExpirationText(threeDays)).toBe('あと3日');
  });
  it('8日以上先の日付を渡すと「M/D まで」形式を返す', () => {
    const farAway = daysFromNow(10);
    const result = formatExpirationText(farAway);
    expect(result).toMatch(/\d+\/\d+ まで/);
  });
});

describe('groupByDate', () => {
  it('空配列を渡すと全グループが空配列', () => {
    expect(groupByDate([])).toEqual({ today: [], yesterday: [], thisWeek: [] });
  });
  it('今日のタイムスタンプのアイテムはtodayに分類される', () => {
    const items = [{ timestamp: new Date().toISOString(), id: '1' }];
    const result = groupByDate(items);
    expect(result.today).toHaveLength(1);
    expect(result.yesterday).toHaveLength(0);
  });
  it('昨日のアイテムはyesterdayに分類される', () => {
    const now = new Date();
    const yesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
      12,
      0,
      0,
    );
    const items = [{ timestamp: yesterday.toISOString(), id: '1' }];
    const result = groupByDate(items);
    expect(result.yesterday).toHaveLength(1);
  });
  it('2-7日前のアイテムはthisWeekに分類される', () => {
    const items = [
      { timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), id: '1' },
    ];
    const result = groupByDate(items);
    expect(result.thisWeek).toHaveLength(1);
  });
});

describe('getStreamingServiceInfo', () => {
  it.each([
    ['netflix', 'Netflix', '#E50914'],
    ['prime', 'Prime Video', '#00A8E1'],
    ['disney', 'Disney+', '#0072D2'],
    ['u-next', 'U-NEXT', '#FFFFFF'],
    ['hulu', 'Hulu', '#1CE783'],
    ['abema', 'AbemaTV', '#333333'],
  ] as const)('%s → name=%s, color=%s', (service, name, color) => {
    const info = getStreamingServiceInfo(service);
    expect(info.name).toBe(name);
    expect(info.color).toBe(color);
  });
});
