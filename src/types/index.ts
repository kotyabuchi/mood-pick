// === Literal Types ===
export type ContentType = 'movie' | 'tv' | 'anime';
export type WatchStatus = 'want' | 'watching' | 'watched' | 'dropped';
export type MoodId = 'excited' | 'sad' | 'funny' | 'think' | 'chill';
export type AttentionLevelId = 'focused' | 'casual';
export type DurationId = '30min' | '1hour' | '2hour' | 'unlimited';
export type StreamingService =
  | 'netflix'
  | 'prime'
  | 'disney'
  | 'u-next'
  | 'hulu'
  | 'abema';
export type PrivacySetting = 'private' | 'followers' | 'public';
export type NotificationType = 'expiring' | 'follow' | 'recommendation';
export type FeedActionType = 'watched' | 'watching' | 'want' | 'recommend';

// === Interfaces ===
export interface StreamingInfo {
  service: StreamingService;
  expiresAt: string | null;
  url: string;
}

export interface Content {
  id: string;
  tmdbId: number;
  title: string;
  type: ContentType;
  posterUrl: string;
  year: number;
  genre: string;
  runtime: number;
  synopsis: string;
  moodTags: MoodId[];
  attentionLevel: AttentionLevelId;
  streaming: StreamingInfo[];
}

export interface WatchlistItem extends Content {
  watchlistId: string;
  status: WatchStatus;
  memo: string | null;
  rating: number | null;
  review: string | null;
  watchedAt: string | null;
  droppedAt: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  followingCount: number;
  followerCount: number;
  isFollowing?: boolean;
}

export interface UserProfile extends User {
  stats: {
    watched: number;
    watching: number;
    want: number;
    thisMonth: number;
    thisYear: number;
  };
  recentWatched: WatchlistItem[];
  wantList?: WatchlistItem[];
}

export interface FeedItem {
  id: string;
  user: User;
  actionType: FeedActionType;
  content: Content;
  timestamp: string;
  rating?: number;
  review?: string;
  message?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  timestamp: string;
  isRead: boolean;
  targetId: string;
  serviceName?: string;
}

export interface SearchResult extends Content {
  isInWatchlist: boolean;
}

export interface PrivacySettings {
  wantListVisibility: PrivacySetting;
  watchedListVisibility: PrivacySetting;
  activityVisibility: PrivacySetting;
}

export interface NotificationSettings {
  expirationAlert: boolean;
  expirationAlert7Days: boolean;
  expirationAlert3Days: boolean;
  expirationAlertPreviousDay: boolean;
  followNotification: boolean;
  recommendationNotification: boolean;
}

// === Auth Types ===
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}
