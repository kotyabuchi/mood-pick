-- ============================================================
-- follows テーブル
-- ============================================================
create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id != following_id)
);

comment on table public.follows is 'フォロー関係 (follower_id が following_id をフォロー)';

-- インデックス (フォロワー一覧取得用)
create index follows_following_id_idx on public.follows (following_id);

alter table public.follows enable row level security;

-- 全 authenticated ユーザーがフォロー関係を参照可能
create policy "follows: select authenticated"
  on public.follows for select
  to authenticated
  using (true);

-- 自分のフォロー関係のみ INSERT 可能
create policy "follows: insert own"
  on public.follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

-- 自分のフォロー関係のみ DELETE 可能
create policy "follows: delete own"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);

-- DOWN migration:
-- drop table if exists public.follows;
