-- Weldoo profile media storage.
-- Target: Supabase Storage.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    2097152,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'covers',
    'covers',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "profile_media_select_public"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('avatars', 'covers'));

create policy "profile_media_insert_own_folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('avatars', 'covers')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "profile_media_update_own_folder"
on storage.objects for update
to authenticated
using (
  bucket_id in ('avatars', 'covers')
  and owner = auth.uid()
)
with check (
  bucket_id in ('avatars', 'covers')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "profile_media_delete_own_folder"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('avatars', 'covers')
  and owner = auth.uid()
);
