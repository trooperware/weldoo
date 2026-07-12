-- Includes conversation metadata updates in realtime inbox refreshes.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'message_conversations'
  ) then
    alter publication supabase_realtime add table public.message_conversations;
  end if;
end $$;
