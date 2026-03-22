'use client';

import { useMemo } from 'react';

import { createClient } from '@/lib/supabase/client';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export function useSupabaseClient(): SupabaseClient<Database> {
  return useMemo(() => {
    // SSR（静的プリレンダリング）時は環境変数が未設定の場合があるため、
    // ブラウザ環境でのみ実際のクライアントを生成する。
    // useMemoはサーバー→クライアント間で状態を引き継がないため、
    // クライアント側では常に実際のクライアントが生成される。
    if (typeof window === 'undefined') return {} as SupabaseClient<Database>;
    return createClient();
  }, []);
}
