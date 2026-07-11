-- MSG-004 Phase 2 messages model.
-- Adds first-class conversations and messages separate from contact_requests.

create table public.message_conversations (
  id uuid primary key default gen_random_uuid(),
  created_by_profile_id uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger message_conversations_set_updated_at
before update on public.message_conversations
for each row execute function public.set_updated_at();

create table public.message_conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.message_conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  constraint message_conversation_participants_unique unique (conversation_id, profile_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.message_conversations(id) on delete cascade,
  sender_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  constraint messages_body_length check (char_length(body) between 1 and 4000)
);

create index message_conversations_last_message_at_idx
  on public.message_conversations(last_message_at desc nulls last, created_at desc);
create index message_conversation_participants_profile_id_idx
  on public.message_conversation_participants(profile_id, archived_at, last_read_at);
create index message_conversation_participants_conversation_id_idx
  on public.message_conversation_participants(conversation_id);
create index messages_conversation_id_created_at_idx
  on public.messages(conversation_id, created_at asc);
create index messages_sender_profile_id_idx
  on public.messages(sender_profile_id);

create or replace function public.current_profile_participates_in_conversation(conversation uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.message_conversation_participants participant
    where participant.conversation_id = conversation
      and participant.profile_id = auth.uid()
  );
$$;

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

create trigger messages_sender_is_participant
before insert or update on public.messages
for each row execute function public.message_sender_is_conversation_participant();

create or replace function public.sync_conversation_last_message_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.message_conversations
  set last_message_at = greatest(coalesce(last_message_at, new.created_at), new.created_at)
  where id = new.conversation_id;

  return new;
end;
$$;

create trigger messages_sync_conversation_last_message_at
after insert on public.messages
for each row execute function public.sync_conversation_last_message_at();

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

revoke all on function public.send_direct_message(uuid, text) from public;
grant execute on function public.send_direct_message(uuid, text) to authenticated;

alter table public.message_conversations enable row level security;
alter table public.message_conversation_participants enable row level security;
alter table public.messages enable row level security;

create policy "message_conversations_select_participant_or_admin"
on public.message_conversations for select
to authenticated
using (
  public.current_profile_participates_in_conversation(id)
  or public.current_profile_is_admin()
);

create policy "message_conversations_insert_active_profile"
on public.message_conversations for insert
to authenticated
with check (
  created_by_profile_id = auth.uid()
  and public.profile_is_active(created_by_profile_id)
);

create policy "message_conversations_update_participant_or_admin"
on public.message_conversations for update
to authenticated
using (
  public.current_profile_participates_in_conversation(id)
  or public.current_profile_is_admin()
)
with check (
  public.current_profile_participates_in_conversation(id)
  or public.current_profile_is_admin()
);

create policy "message_conversation_participants_select_participant_or_admin"
on public.message_conversation_participants for select
to authenticated
using (
  public.current_profile_participates_in_conversation(conversation_id)
  or public.current_profile_is_admin()
);

create policy "message_conversation_participants_insert_creator_or_admin"
on public.message_conversation_participants for insert
to authenticated
with check (
  exists (
    select 1
    from public.message_conversations conversation
    where conversation.id = conversation_id
      and conversation.created_by_profile_id = auth.uid()
  )
  or public.current_profile_is_admin()
);

create policy "message_conversation_participants_update_self_or_admin"
on public.message_conversation_participants for update
to authenticated
using (
  profile_id = auth.uid()
  or public.current_profile_is_admin()
)
with check (
  profile_id = auth.uid()
  or public.current_profile_is_admin()
);

create policy "messages_select_participant_or_admin"
on public.messages for select
to authenticated
using (
  public.current_profile_participates_in_conversation(conversation_id)
  or public.current_profile_is_admin()
);

create policy "messages_insert_participant_sender"
on public.messages for insert
to authenticated
with check (
  sender_profile_id = auth.uid()
  and public.current_profile_participates_in_conversation(conversation_id)
);

create policy "messages_update_sender_or_admin"
on public.messages for update
to authenticated
using (
  sender_profile_id = auth.uid()
  or public.current_profile_is_admin()
)
with check (
  sender_profile_id = auth.uid()
  or public.current_profile_is_admin()
);
