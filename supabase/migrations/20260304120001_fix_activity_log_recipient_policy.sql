-- activity_log の recipient ポリシーを recommend のみに限定
-- (元のポリシーは recipient_id のみだった → action_type = 'recommend' を追加)

drop policy if exists "activity_log: select as recipient" on public.activity_log;

create policy "activity_log: select as recipient"
  on public.activity_log for select
  to authenticated
  using (
    auth.uid() = recipient_id
    and action_type = 'recommend'
  );
