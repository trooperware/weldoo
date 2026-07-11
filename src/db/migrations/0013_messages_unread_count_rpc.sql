-- MSG-004 performance follow-up.
-- Counts unread messages in Postgres instead of loading all unread candidates in Next.js.

create or replace function public.get_unread_message_count(target_profile_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  unread_count integer;
begin
  if target_profile_id is null then
    return 0;
  end if;

  if target_profile_id <> auth.uid() and not public.current_profile_is_admin() then
    raise exception 'Only the current profile can read unread message counts.';
  end if;

  select count(*)::integer
  into unread_count
  from public.message_conversation_participants participant
  join public.messages message
    on message.conversation_id = participant.conversation_id
  where participant.profile_id = target_profile_id
    and message.sender_profile_id <> target_profile_id
    and message.deleted_at is null
    and message.created_at > coalesce(participant.last_read_at, '-infinity'::timestamptz);

  return coalesce(unread_count, 0);
end;
$$;

revoke all on function public.get_unread_message_count(uuid) from public;
grant execute on function public.get_unread_message_count(uuid) to authenticated;
