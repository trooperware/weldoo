-- Add multi-image support for feed posts while keeping image_url as a legacy fallback.

alter table public.posts
add column if not exists image_urls text[] not null default '{}';

update public.posts
set image_urls = array[image_url]
where image_url is not null
  and image_urls = '{}';
