-- ============================================================
-- activity_log テーブル (フィード用アクティビティログ)
-- watchlist_items の変更をトリガーで自動記録
-- ============================================================

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tmdb_id integer not null,
  action_type text not null check (action_type in ('watched', 'watching', 'want', 'recommend')),
  rating smallint check (rating between 1 and 5),
  review text,
  message text,
  recipient_id uuid references public.profiles(id) on delete set null,
  -- 非正規化コンテンツ情報 (トリガーで watchlist_items からコピー)
  title text not null,
  poster_url text not null,
  content_type text not null,
  genre text not null default '',
  runtime integer not null default 0,
  year integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.activity_log is 'フィード用アクティビティログ。watchlist_items の変更をトリガーで自動記録';

-- ページネーション用複合インデックス
create index activity_log_feed_idx on public.activity_log (created_at desc, id desc);
-- ユーザー別検索用
create index activity_log_user_id_idx on public.activity_log (user_id);

-- ============================================================
-- RLS
-- ============================================================
alter table public.activity_log enable row level security;

-- Phase 3: フォロー中ユーザー + 自分のアクティビティのみ閲覧可
-- Phase 5 で recommend 対応の追加ポリシーを作成予定
create policy "activity_log: select own or followed"
  on public.activity_log for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.follows
      where follows.follower_id = auth.uid()
        and follows.following_id = activity_log.user_id
    )
  );

-- INSERT はトリガー経由のみ (SECURITY DEFINER 関数から)
-- ユーザー直接 INSERT 不可 (RLS 有効 + INSERT ポリシーなし = 拒否)

-- ============================================================
-- トリガー関数
-- ============================================================
create or replace function public.log_watchlist_activity()
returns trigger language plpgsql
security definer set search_path = ''
as $$
begin
  -- dropped はフィードに出さない
  if new.status = 'dropped' then
    return new;
  end if;

  insert into public.activity_log (
    user_id, tmdb_id, action_type, rating, review,
    title, poster_url, content_type, genre, runtime, year
  ) values (
    new.user_id,
    new.tmdb_id,
    new.status,
    case when new.status = 'watched' then new.rating else null end,
    case when new.status = 'watched' then new.review else null end,
    new.title,
    new.poster_url,
    new.type,
    new.genre,
    new.runtime,
    new.year
  );
  return new;
end;
$$;

-- INSERT トリガー (初回追加)
create trigger watchlist_insert_log
  after insert on public.watchlist_items
  for each row execute function public.log_watchlist_activity();

-- UPDATE トリガー (ステータス変更時のみ)
create trigger watchlist_status_change_log
  after update on public.watchlist_items
  for each row
  when (old.status is distinct from new.status)
  execute function public.log_watchlist_activity();

-- ============================================================
-- 既存データのバックフィル
-- トリガーは新規操作のみ対象。既存 watchlist_items からフィード初期データを生成
-- ============================================================
insert into public.activity_log (
  user_id, tmdb_id, action_type, rating, review,
  title, poster_url, content_type, genre, runtime, year, created_at
)
select
  w.user_id,
  w.tmdb_id,
  w.status,
  case when w.status = 'watched' then w.rating else null end,
  case when w.status = 'watched' then w.review else null end,
  w.title,
  w.poster_url,
  w.type,
  w.genre,
  w.runtime,
  w.year,
  coalesce(w.watched_at, w.updated_at, w.created_at)
from public.watchlist_items w
where w.status in ('want', 'watching', 'watched');

-- ============================================================
-- DOWN migration (ロールバック):
-- drop trigger if exists watchlist_status_change_log on public.watchlist_items;
-- drop trigger if exists watchlist_insert_log on public.watchlist_items;
-- drop function if exists public.log_watchlist_activity();
-- drop policy if exists "activity_log: select own or followed" on public.activity_log;
-- drop table if exists public.activity_log;
-- ============================================================
