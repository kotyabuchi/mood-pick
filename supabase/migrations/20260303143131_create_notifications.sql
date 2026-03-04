-- ============================================================
-- notifications テーブル (ユーザー通知)
-- follow 時にトリガーで自動生成。expiring / recommendation は Phase 5 以降
-- ============================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('follow', 'expiring', 'recommendation')),
  title text not null,
  target_id text not null,
  service_name text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.notifications is 'ユーザー通知。follow はトリガー自動生成、expiring/recommendation は Phase 5 以降';

-- ページネーション用複合インデックス
create index notifications_user_created_idx
  on public.notifications (user_id, created_at desc, id desc);

-- 未読カウント用 partial index
create index notifications_user_unread_idx
  on public.notifications (user_id) where is_read = false;

-- ============================================================
-- RLS
-- ============================================================
alter table public.notifications enable row level security;

-- 自分の通知のみ SELECT 可能
create policy "notifications: select own"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

-- 自分の通知のみ UPDATE 可能 (既読化)
create policy "notifications: update own"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- INSERT はトリガー経由のみ (SECURITY DEFINER 関数から)
-- DELETE ポリシーなし (ユーザー直接削除不可)

-- ============================================================
-- フォロー時通知トリガー
-- ============================================================
create or replace function public.notify_on_follow()
returns trigger language plpgsql
security definer set search_path = ''
as $$
declare
  follower_name text;
begin
  -- フォロワーの表示名を取得
  select coalesce(name, handle, 'ユーザー')
    into follower_name
    from public.profiles
    where id = new.follower_id;

  insert into public.notifications (user_id, type, title, target_id)
  values (
    new.following_id,
    'follow',
    follower_name || 'さんがあなたをフォローしました',
    new.follower_id::text
  );

  return new;
end;
$$;

create trigger follow_notify
  after insert on public.follows
  for each row execute function public.notify_on_follow();

-- ============================================================
-- DOWN migration (ロールバック):
-- drop trigger if exists follow_notify on public.follows;
-- drop function if exists public.notify_on_follow();
-- drop policy if exists "notifications: update own" on public.notifications;
-- drop policy if exists "notifications: select own" on public.notifications;
-- drop table if exists public.notifications;
-- ============================================================
