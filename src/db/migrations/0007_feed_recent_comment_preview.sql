-- Show the latest bounded comment preview per post while keeping comments in
-- chronological order inside each post card.

create or replace function public.feed_comment_preview(
  target_post_ids uuid[],
  preview_limit integer default 3
)
returns table (
  id uuid,
  post_id uuid,
  author_profile_id uuid,
  body text,
  status public.publication_status,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
  select id, post_id, author_profile_id, body, status, created_at, updated_at
  from (
    select
      c.id,
      c.post_id,
      c.author_profile_id,
      c.body,
      c.status,
      c.created_at,
      c.updated_at,
      row_number() over (
        partition by c.post_id
        order by c.created_at desc, c.id desc
      ) as row_number
    from public.comments c
    where c.post_id = any(target_post_ids)
      and c.status = 'published'
  ) ranked
  where row_number <= greatest(0, least(preview_limit, 10))
  order by post_id, created_at asc, id asc;
$$;

grant execute on function public.feed_comment_preview(uuid[], integer) to anon, authenticated;
