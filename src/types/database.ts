export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
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
      activity_log: {
        Row: {
          action_type: string;
          content_type: string;
          created_at: string;
          genre: string;
          id: string;
          message: string | null;
          poster_url: string;
          rating: number | null;
          recipient_id: string | null;
          review: string | null;
          runtime: number;
          title: string;
          tmdb_id: number;
          user_id: string;
          year: number;
        };
        Insert: {
          action_type: string;
          content_type: string;
          created_at?: string;
          genre?: string;
          id?: string;
          message?: string | null;
          poster_url: string;
          rating?: number | null;
          recipient_id?: string | null;
          review?: string | null;
          runtime?: number;
          title: string;
          tmdb_id: number;
          user_id: string;
          year?: number;
        };
        Update: {
          action_type?: string;
          content_type?: string;
          created_at?: string;
          genre?: string;
          id?: string;
          message?: string | null;
          poster_url?: string;
          rating?: number | null;
          recipient_id?: string | null;
          review?: string | null;
          runtime?: number;
          title?: string;
          tmdb_id?: number;
          user_id?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_log_recipient_id_fkey';
            columns: ['recipient_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_log_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      follows: {
        Row: {
          created_at: string;
          follower_id: string;
          following_id: string;
        };
        Insert: {
          created_at?: string;
          follower_id: string;
          following_id: string;
        };
        Update: {
          created_at?: string;
          follower_id?: string;
          following_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'follows_follower_id_fkey';
            columns: ['follower_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'follows_following_id_fkey';
            columns: ['following_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          is_read: boolean;
          service_name: string | null;
          target_id: string;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          service_name?: string | null;
          target_id: string;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          service_name?: string | null;
          target_id?: string;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
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
      recommendations: {
        Row: {
          content_type: string;
          created_at: string;
          from_user_id: string;
          genre: string;
          id: string;
          message: string | null;
          poster_url: string;
          runtime: number;
          title: string;
          tmdb_id: number;
          to_user_id: string;
          year: number;
        };
        Insert: {
          content_type: string;
          created_at?: string;
          from_user_id: string;
          genre?: string;
          id?: string;
          message?: string | null;
          poster_url: string;
          runtime?: number;
          title: string;
          tmdb_id: number;
          to_user_id: string;
          year?: number;
        };
        Update: {
          content_type?: string;
          created_at?: string;
          from_user_id?: string;
          genre?: string;
          id?: string;
          message?: string | null;
          poster_url?: string;
          runtime?: number;
          title?: string;
          tmdb_id?: number;
          to_user_id?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'recommendations_from_user_id_fkey';
            columns: ['from_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recommendations_to_user_id_fkey';
            columns: ['to_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;

// ============================================================
// Type aliases
// ============================================================
type PublicSchema = Database['public'];

export type ActivityLogRow = PublicSchema['Tables']['activity_log']['Row'];
export type WatchlistItemRow = PublicSchema['Tables']['watchlist_items']['Row'];
export type WatchlistItemInsert =
  PublicSchema['Tables']['watchlist_items']['Insert'];
export type WatchlistItemUpdate =
  PublicSchema['Tables']['watchlist_items']['Update'];
export type ProfileRow = PublicSchema['Tables']['profiles']['Row'];
export type ProfileUpdate = PublicSchema['Tables']['profiles']['Update'];
export type FollowsRow = PublicSchema['Tables']['follows']['Row'];
export type FollowsInsert = PublicSchema['Tables']['follows']['Insert'];
export type NotificationRow = PublicSchema['Tables']['notifications']['Row'];
export type NotificationUpdate =
  PublicSchema['Tables']['notifications']['Update'];
export type RecommendationRow =
  PublicSchema['Tables']['recommendations']['Row'];
export type RecommendationInsert =
  PublicSchema['Tables']['recommendations']['Insert'];
