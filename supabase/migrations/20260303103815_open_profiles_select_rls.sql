-- ============================================================
-- profiles SELECT RLS を全 authenticated ユーザーに開放
-- フォロー・ユーザー検索・フィード等で他ユーザーの公開情報が必要
-- ============================================================

-- 既存の自分のみ SELECT ポリシーを削除
drop policy if exists "profiles: select own" on public.profiles;

-- 全 authenticated ユーザーが SELECT 可能に変更
create policy "profiles: select authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- DOWN migration:
-- drop policy if exists "profiles: select authenticated" on public.profiles;
-- create policy "profiles: select own"
--   on public.profiles for select
--   to authenticated
--   using (auth.uid() = id);
