export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          handle: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          handle?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          name?: string;
          handle?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      watchlist_items: {
        Row: {
          id: string;
          user_id: string;
          tmdb_id: number;
          title: string;
          type: 'movie' | 'tv' | 'anime';
          poster_url: string;
          year: number;
          genre: string;
          runtime: number;
          synopsis: string;
          mood_tags: string[];
          attention_level: 'focused' | 'casual';
          status: 'want' | 'watching' | 'watched' | 'dropped';
          memo: string | null;
          rating: number | null;
          review: string | null;
          watched_at: string | null;
          dropped_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          tmdb_id: number;
          title: string;
          type: 'movie' | 'tv' | 'anime';
          poster_url?: string;
          year?: number;
          genre?: string;
          runtime?: number;
          synopsis?: string;
          mood_tags?: string[];
          attention_level?: 'focused' | 'casual';
          status?: 'want' | 'watching' | 'watched' | 'dropped';
          memo?: string | null;
          rating?: number | null;
          review?: string | null;
          watched_at?: string | null;
          dropped_at?: string | null;
        };
        Update: {
          status?: 'want' | 'watching' | 'watched' | 'dropped';
          memo?: string | null;
          rating?: number | null;
          review?: string | null;
          watched_at?: string | null;
          dropped_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'watchlist_items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type WatchlistItemRow = PublicSchema['Tables']['watchlist_items']['Row'];
export type WatchlistItemInsert =
  PublicSchema['Tables']['watchlist_items']['Insert'];
export type WatchlistItemUpdate =
  PublicSchema['Tables']['watchlist_items']['Update'];

export type ProfileRow = PublicSchema['Tables']['profiles']['Row'];
export type ProfileInsert = PublicSchema['Tables']['profiles']['Insert'];
export type ProfileUpdate = PublicSchema['Tables']['profiles']['Update'];
