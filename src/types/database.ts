export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          handle: string | null;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          handle?: string | null;
          id: string;
          name?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          handle?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      watchlist_items: {
        Row: {
          attention_level: string;
          created_at: string;
          dropped_at: string | null;
          genre: string;
          id: string;
          memo: string | null;
          mood_tags: string[];
          poster_url: string;
          rating: number | null;
          review: string | null;
          runtime: number;
          status: string;
          synopsis: string;
          title: string;
          tmdb_id: number;
          type: string;
          updated_at: string;
          user_id: string;
          watched_at: string | null;
          year: number;
        };
        Insert: {
          attention_level?: string;
          created_at?: string;
          dropped_at?: string | null;
          genre?: string;
          id?: string;
          memo?: string | null;
          mood_tags?: string[];
          poster_url?: string;
          rating?: number | null;
          review?: string | null;
          runtime?: number;
          status?: string;
          synopsis?: string;
          title: string;
          tmdb_id: number;
          type: string;
          updated_at?: string;
          user_id?: string;
          watched_at?: string | null;
          year?: number;
        };
        Update: {
          attention_level?: string;
          created_at?: string;
          dropped_at?: string | null;
          genre?: string;
          id?: string;
          memo?: string | null;
          mood_tags?: string[];
          poster_url?: string;
          rating?: number | null;
          review?: string | null;
          runtime?: number;
          status?: string;
          synopsis?: string;
          title?: string;
          tmdb_id?: number;
          type?: string;
          updated_at?: string;
          user_id?: string;
          watched_at?: string | null;
          year?: number;
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
