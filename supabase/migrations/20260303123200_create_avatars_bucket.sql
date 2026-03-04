INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg','image/png','image/webp']);

CREATE POLICY "avatars: upload own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars: update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars: delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars: read public" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- DOWN:
-- DROP POLICY "avatars: read public" ON storage.objects;
-- DROP POLICY "avatars: delete own" ON storage.objects;
-- DROP POLICY "avatars: update own" ON storage.objects;
-- DROP POLICY "avatars: upload own" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'avatars';
