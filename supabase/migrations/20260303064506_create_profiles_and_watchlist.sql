-- ============================================================
-- profiles テーブル
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  handle text unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'ユーザープロフィール (auth.users と 1:1)';

alter table public.profiles enable row level security;

-- 自分のプロフィールのみ参照・更新可能
create policy "profiles: select own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles: insert own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- サインアップ時に自動でプロフィールを作成するトリガー
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at 自動更新トリガー
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- ============================================================
-- watchlist_items テーブル
-- ============================================================
create table public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  tmdb_id integer not null,
  title text not null,
  type text not null check (type in ('movie', 'tv', 'anime')),
  poster_url text not null default '',
  year integer not null default 0,
  genre text not null default '',
  runtime integer not null default 0,
  synopsis text not null default '',
  mood_tags text[] not null default '{}',
  attention_level text not null default 'casual' check (attention_level in ('focused', 'casual')),
  status text not null default 'want' check (status in ('want', 'watching', 'watched', 'dropped')),
  memo text,
  rating smallint check (rating is null or (rating >= 1 and rating <= 5)),
  review text,
  watched_at timestamptz,
  dropped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- 同一ユーザー・同一TMDb IDの重複を防止
  unique (user_id, tmdb_id)
);

comment on table public.watchlist_items is 'ウォッチリストアイテム';

-- インデックス
create index watchlist_items_user_status_idx on public.watchlist_items (user_id, status);
create index watchlist_items_tmdb_id_idx on public.watchlist_items (tmdb_id);

alter table public.watchlist_items enable row level security;

-- 自分のウォッチリストのみ CRUD 可能
create policy "watchlist_items: select own"
  on public.watchlist_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "watchlist_items: insert own"
  on public.watchlist_items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "watchlist_items: update own"
  on public.watchlist_items for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "watchlist_items: delete own"
  on public.watchlist_items for delete
  to authenticated
  using (auth.uid() = user_id);

-- updated_at 自動更新
create trigger watchlist_items_updated_at
  before update on public.watchlist_items
  for each row execute function public.update_updated_at();
