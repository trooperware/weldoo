-- Weldoo feed media storage.
-- Target: Supabase Storage.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'post-images',
    'post-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "post_images_select_public"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'post-images');

create policy "post_images_insert_own_folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "post_images_update_own_folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'post-images'
  and owner = auth.uid()
)
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "post_images_delete_own_folder"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'post-images'
  and owner = auth.uid()
);
