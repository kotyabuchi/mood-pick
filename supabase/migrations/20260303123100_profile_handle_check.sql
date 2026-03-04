-- 既存データを正規化 (CHECK 追加前に不正値を解消)
-- 重複を先に解消: lower(trim(handle)) が他行と衝突する場合は NULL に退避
WITH normalized AS (
  SELECT id, lower(trim(handle)) AS new_handle,
         ROW_NUMBER() OVER (PARTITION BY lower(trim(handle)) ORDER BY created_at) AS rn
  FROM public.profiles
  WHERE handle IS NOT NULL
)
UPDATE public.profiles p
  SET handle = CASE WHEN n.rn = 1 THEN n.new_handle ELSE NULL END
  FROM normalized n
  WHERE p.id = n.id AND p.handle IS NOT NULL AND p.handle != n.new_handle;

-- 残りの正規化 (重複なしの行)
UPDATE public.profiles
  SET handle = lower(trim(handle))
  WHERE handle IS NOT NULL AND handle != lower(trim(handle));

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_handle_format_check
  CHECK (handle IS NULL OR handle ~ '^[a-z0-9_]{3,20}$');

-- DOWN: ALTER TABLE public.profiles DROP CONSTRAINT profiles_handle_format_check;
