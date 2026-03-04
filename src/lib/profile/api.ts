import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, ProfileRow } from '@/types/database';

export function createProfileApi(client: SupabaseClient<Database>) {
  async function updateProfile(
    userId: string,
    updates: {
      name?: string;
      handle?: string | null;
      avatar_url?: string;
    },
  ): Promise<ProfileRow> {
    const normalized = {
      ...updates,
      handle:
        updates.handle === null
          ? null
          : updates.handle
            ? updates.handle.toLowerCase().trim()
            : undefined,
    };

    const { data, error } = await client
      .from('profiles')
      .update(normalized)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function checkHandleAvailable(
    handle: string,
    currentUserId: string,
  ): Promise<boolean> {
    const { data, error } = await client
      .from('profiles')
      .select('id')
      .eq('handle', handle.toLowerCase())
      .neq('id', currentUserId)
      .maybeSingle();

    if (error) throw error;
    return data === null;
  }

  async function uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await client.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = client.storage.from('avatars').getPublicUrl(path);

    return publicUrl;
  }

  return {
    updateProfile,
    checkHandleAvailable,
    uploadAvatar,
  };
}
