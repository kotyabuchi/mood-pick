-- ============================================================
-- recommendations テーブル (おすすめ送信)
-- フォロー中の相手にコンテンツをおすすめする機能
-- ============================================================

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id   uuid not null references public.profiles(id) on delete cascade,
  tmdb_id      integer not null,
  content_type text not null check (content_type in ('movie', 'tv')),
  title        text not null,
  poster_url   text not null,
  year         integer not null default 0,
  genre        text not null default '',
  runtime      integer not null default 0,
  message      text,
  created_at   timestamptz not null default now(),

  constraint no_self_recommend check (from_user_id <> to_user_id)
);

comment on table public.recommendations is 'おすすめ送信。フォロー中の相手にコンテンツをおすすめする';

-- 受信側の一覧表示用
create index recommendations_to_user_idx
  on public.recommendations (to_user_id, created_at desc, id desc);

-- 送信側の一覧表示用
create index recommendations_from_user_idx
  on public.recommendations (from_user_id, created_at desc, id desc);

-- ============================================================
-- RLS
-- ============================================================
alter table public.recommendations enable row level security;

-- 送受信者のみ閲覧可
create policy "recommendations: select own"
  on public.recommendations for select
  to authenticated
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- 自分が送信者 + フォロー中の相手のみ INSERT 可
create policy "recommendations: insert own to followed"
  on public.recommendations for insert
  to authenticated
  with check (
    auth.uid() = from_user_id
    and exists (
      select 1 from public.follows
      where follows.follower_id = auth.uid()
        and follows.following_id = to_user_id
    )
  );

-- ============================================================
-- activity_log 追加ポリシー: 受信者もフィードで閲覧可
-- (既存ポリシー "activity_log: select own or followed" は user_id ベース)
-- ============================================================
create policy "activity_log: select as recipient"
  on public.activity_log for select
  to authenticated
  using (
    auth.uid() = recipient_id
    and action_type = 'recommend'
  );

-- ============================================================
-- トリガー関数: おすすめ作成時に activity_log + notifications に自動記録
-- ============================================================
create or replace function public.on_recommendation_created()
returns trigger language plpgsql
security definer set search_path = ''
as $$
declare
  sender_name text;
begin
  -- 送信者の表示名を取得
  select coalesce(name, handle, 'ユーザー')
    into sender_name
    from public.profiles
    where id = new.from_user_id;

  -- activity_log に記録
  insert into public.activity_log (
    user_id, tmdb_id, action_type, message, recipient_id,
    title, poster_url, content_type, genre, runtime, year
  ) values (
    new.from_user_id,
    new.tmdb_id,
    'recommend',
    new.message,
    new.to_user_id,
    new.title,
    new.poster_url,
    new.content_type,
    new.genre,
    new.runtime,
    new.year
  );

  -- notifications に記録
  insert into public.notifications (user_id, type, title, target_id)
  values (
    new.to_user_id,
    'recommendation',
    sender_name || 'さんがあなたに' || new.title || 'をおすすめしました',
    new.tmdb_id::text || '?type=' || new.content_type
  );

  return new;
end;
$$;

create trigger recommendation_created_notify
  after insert on public.recommendations
  for each row execute function public.on_recommendation_created();

-- ============================================================
-- DOWN migration (ロールバック):
-- drop trigger if exists recommendation_created_notify on public.recommendations;
-- drop function if exists public.on_recommendation_created();
-- drop policy if exists "activity_log: select as recipient" on public.activity_log;
-- drop policy if exists "recommendations: insert own to followed" on public.recommendations;
-- drop policy if exists "recommendations: select own" on public.recommendations;
-- drop table if exists public.recommendations;
-- ============================================================
