-- MSG-004 follow-up.
-- Restricts private messages to accepted Weldoo connections.

create or replace function public.profiles_have_accepted_connection(
  first_profile_id uuid,
  second_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.connections accepted_connection
    where accepted_connection.status = 'accepted'
      and (
        (
          accepted_connection.requester_profile_id = first_profile_id
          and accepted_connection.recipient_profile_id = second_profile_id
        )
        or (
          accepted_connection.requester_profile_id = second_profile_id
          and accepted_connection.recipient_profile_id = first_profile_id
        )
      )
  );
$$;

create or replace function public.message_sender_is_conversation_participant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.message_conversation_participants participant
    where participant.conversation_id = new.conversation_id
      and participant.profile_id = new.sender_profile_id
  ) then
    raise exception 'Message sender must be a conversation participant';
  end if;

  if exists (
    select 1
    from public.message_conversation_participants participant
    where participant.conversation_id = new.conversation_id
      and participant.profile_id <> new.sender_profile_id
      and not public.profiles_have_accepted_connection(
        new.sender_profile_id,
        participant.profile_id
      )
  ) then
    raise exception 'Private messages require an accepted connection.';
  end if;

  return new;
end;
$$;

create or replace function public.send_direct_message(
  recipient_profile_id uuid,
  message_body text
)
returns table (
  conversation_id uuid,
  message_id uuid,
  sender_profile_id uuid,
  body text,
  created_at timestamptz,
  deleted_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile_id uuid := auth.uid();
  normalized_body text := btrim(coalesce(message_body, ''));
  target_conversation_id uuid;
  inserted_message public.messages%rowtype;
begin
  if current_profile_id is null then
    raise exception 'Sign in to send a message.';
  end if;

  if recipient_profile_id is null or recipient_profile_id = current_profile_id then
    raise exception 'Choose another Weldoo member.';
  end if;

  if char_length(normalized_body) < 1 or char_length(normalized_body) > 4000 then
    raise exception 'Message must be between 1 and 4000 characters.';
  end if;

  if not public.profile_is_active(recipient_profile_id) then
    raise exception 'Recipient profile is not available.';
  end if;

  if not public.profiles_have_accepted_connection(
    current_profile_id,
    recipient_profile_id
  ) then
    raise exception 'Private messages require an accepted connection.';
  end if;

  select current_participant.conversation_id
  into target_conversation_id
  from public.message_conversation_participants current_participant
  join public.message_conversation_participants recipient_participant
    on recipient_participant.conversation_id = current_participant.conversation_id
  where current_participant.profile_id = current_profile_id
    and recipient_participant.profile_id = recipient_profile_id
  order by current_participant.created_at desc
  limit 1;

  if target_conversation_id is null then
    insert into public.message_conversations (created_by_profile_id)
    values (current_profile_id)
    returning id into target_conversation_id;

    insert into public.message_conversation_participants (
      conversation_id,
      last_read_at,
      profile_id
    )
    values
      (target_conversation_id, now(), current_profile_id),
      (target_conversation_id, null, recipient_profile_id);
  end if;

  insert into public.messages (body, conversation_id, sender_profile_id)
  values (normalized_body, target_conversation_id, current_profile_id)
  returning * into inserted_message;

  update public.message_conversation_participants
  set last_read_at = now()
  where message_conversation_participants.conversation_id = target_conversation_id
    and message_conversation_participants.profile_id = current_profile_id;

  return query
  select
    target_conversation_id,
    inserted_message.id,
    inserted_message.sender_profile_id,
    inserted_message.body,
    inserted_message.created_at,
    inserted_message.deleted_at;
end;
$$;

revoke all on function public.profiles_have_accepted_connection(uuid, uuid) from public;
revoke all on function public.send_direct_message(uuid, text) from public;
grant execute on function public.send_direct_message(uuid, text) to authenticated;
