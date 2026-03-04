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
export type WatchlistSortOption = 'created_at' | 'title' | 'watched_at';
export type FeedActionType = 'watched' | 'watching' | 'want' | 'recommend';
export type NotificationType = 'expiring' | 'follow' | 'recommendation';

// === Domain Types ===
// TMDb + アプリ固有の構造。DB型 (database.ts) とは Mapper 経由で変換する。

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
  synopsis: string;
  moodTags: MoodId[];
  attentionLevel: AttentionLevelId;
  streaming: StreamingInfo[];
}

export interface ContentDetail extends Content {
  genre: string;
  runtime: number;
}

export interface WatchlistItem extends ContentDetail {
  watchlistId: string;
  status: WatchStatus;
  memo: string | null;
  rating: number | null;
  review: string | null;
  watchedAt: string | null;
  droppedAt: string | null;
  createdAt: string;
}

export interface SearchResult extends Content {
  isInWatchlist: boolean;
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
  content: ContentDetail;
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

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}
