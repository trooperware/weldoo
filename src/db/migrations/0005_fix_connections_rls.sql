-- Restrict direct connection updates so Supabase clients cannot bypass
-- the application-level accept / reject / cancel rules.

drop policy if exists "connections_update_participant_or_admin" on public.connections;

create policy "connections_update_recipient_accept_reject"
on public.connections for update
to authenticated
using (
  recipient_profile_id = auth.uid()
  and status = 'pending'
)
with check (
  recipient_profile_id = auth.uid()
  and status in ('accepted', 'rejected')
);

create policy "connections_update_requester_cancel"
on public.connections for update
to authenticated
using (
  requester_profile_id = auth.uid()
  and status = 'pending'
)
with check (
  requester_profile_id = auth.uid()
  and status = 'cancelled'
);

create policy "connections_update_admin"
on public.connections for update
to authenticated
using (public.current_profile_is_admin())
with check (public.current_profile_is_admin());

create or replace function public.enforce_connection_update_rules()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if public.current_profile_is_admin() then
    return new;
  end if;

  if new.requester_profile_id <> old.requester_profile_id
    or new.recipient_profile_id <> old.recipient_profile_id
  then
    raise exception 'Connection participants cannot be changed.';
  end if;

  if old.status <> 'pending' then
    raise exception 'Only pending connections can be changed.';
  end if;

  if new.status in ('accepted', 'rejected')
    and old.recipient_profile_id <> auth.uid()
  then
    raise exception 'Only the recipient can accept or reject a connection.';
  end if;

  if new.status = 'cancelled'
    and old.requester_profile_id <> auth.uid()
  then
    raise exception 'Only the requester can cancel a connection.';
  end if;

  if new.status not in ('accepted', 'rejected', 'cancelled') then
    raise exception 'Invalid connection status transition.';
  end if;

  return new;
end;
$$;

drop trigger if exists connections_enforce_update_rules on public.connections;

create trigger connections_enforce_update_rules
before update on public.connections
for each row execute function public.enforce_connection_update_rules();
