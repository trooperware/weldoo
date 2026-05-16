-- Weldoo Phase 1 row level security policies.
-- Target: Supabase Postgres.

-- Helper functions -----------------------------------------------------------

create or replace function public.current_profile_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and profile_type = 'admin'
      and status = 'active'
  );
$$;

create or replace function public.current_profile_owns_company(company_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.companies
    where id = company_uuid
      and owner_profile_id = auth.uid()
  );
$$;

create or replace function public.current_profile_owns_training_provider(provider_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.training_providers
    where id = provider_uuid
      and owner_profile_id = auth.uid()
  );
$$;

create or replace function public.profile_is_active(profile_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = profile_uuid
      and status = 'active'
  );
$$;

create or replace function public.post_is_visible(post_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.posts
    where id = post_uuid
      and status = 'published'
  );
$$;

create or replace function public.job_is_visible(job_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.jobs
    where id = job_uuid
      and status = 'published'
  );
$$;

create or replace function public.course_event_is_visible(course_event_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.course_events
    where id = course_event_uuid
      and status = 'published'
  );
$$;

create or replace function public.comment_is_visible(comment_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.comments
    where id = comment_uuid
      and status = 'published'
      and public.post_is_visible(post_id)
  );
$$;

create or replace function public.prevent_connection_participants_change()
returns trigger
language plpgsql
as $$
begin
  if new.requester_profile_id <> old.requester_profile_id
    or new.recipient_profile_id <> old.recipient_profile_id then
    raise exception 'Connection participants cannot be changed';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_contact_request_participants_change()
returns trigger
language plpgsql
as $$
begin
  if new.sender_profile_id <> old.sender_profile_id
    or new.recipient_profile_id <> old.recipient_profile_id then
    raise exception 'Contact request participants cannot be changed';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_job_application_relationship_change()
returns trigger
language plpgsql
as $$
begin
  if new.job_id <> old.job_id
    or new.applicant_profile_id <> old.applicant_profile_id then
    raise exception 'Job application relationships cannot be changed';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_course_event_interest_relationship_change()
returns trigger
language plpgsql
as $$
begin
  if new.course_event_id <> old.course_event_id
    or new.profile_id <> old.profile_id then
    raise exception 'Course event interest relationships cannot be changed';
  end if;

  return new;
end;
$$;

revoke all on function public.current_profile_is_admin() from public;
revoke all on function public.current_profile_owns_company(uuid) from public;
revoke all on function public.current_profile_owns_training_provider(uuid) from public;
revoke all on function public.profile_is_active(uuid) from public;
revoke all on function public.post_is_visible(uuid) from public;
revoke all on function public.job_is_visible(uuid) from public;
revoke all on function public.course_event_is_visible(uuid) from public;
revoke all on function public.comment_is_visible(uuid) from public;

grant execute on function public.current_profile_is_admin() to anon, authenticated;
grant execute on function public.current_profile_owns_company(uuid) to anon, authenticated;
grant execute on function public.current_profile_owns_training_provider(uuid) to anon, authenticated;
grant execute on function public.profile_is_active(uuid) to anon, authenticated;
grant execute on function public.post_is_visible(uuid) to anon, authenticated;
grant execute on function public.job_is_visible(uuid) to anon, authenticated;
grant execute on function public.course_event_is_visible(uuid) to anon, authenticated;
grant execute on function public.comment_is_visible(uuid) to anon, authenticated;

create trigger connections_prevent_participants_change
before update on public.connections
for each row execute function public.prevent_connection_participants_change();

create trigger contact_requests_prevent_participants_change
before update on public.contact_requests
for each row execute function public.prevent_contact_request_participants_change();

create trigger job_applications_prevent_relationship_change
before update on public.job_applications
for each row execute function public.prevent_job_application_relationship_change();

create trigger course_event_interests_prevent_relationship_change
before update on public.course_event_interests
for each row execute function public.prevent_course_event_interest_relationship_change();

-- Role grants ----------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on
  public.profiles,
  public.professional_profiles,
  public.companies,
  public.training_providers,
  public.posts,
  public.comments,
  public.likes,
  public.jobs,
  public.course_events
to anon;

grant select, insert, update, delete on
  public.profiles,
  public.professional_profiles,
  public.companies,
  public.training_providers,
  public.posts,
  public.comments,
  public.likes,
  public.saved_items,
  public.connections,
  public.contact_requests,
  public.jobs,
  public.job_applications,
  public.course_events,
  public.course_event_interests,
  public.notifications,
  public.reports
to authenticated;

-- Enable RLS -----------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.companies enable row level security;
alter table public.training_providers enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.saved_items enable row level security;
alter table public.connections enable row level security;
alter table public.contact_requests enable row level security;
alter table public.jobs enable row level security;
alter table public.job_applications enable row level security;
alter table public.course_events enable row level security;
alter table public.course_event_interests enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- Profiles -------------------------------------------------------------------

create policy "profiles_select_active_or_own_or_admin"
on public.profiles for select
to anon, authenticated
using (
  status = 'active'
  or id = auth.uid()
  or public.current_profile_is_admin()
);

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own_or_admin"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.current_profile_is_admin())
with check (id = auth.uid() or public.current_profile_is_admin());

-- Professional profiles ------------------------------------------------------

create policy "professional_profiles_select_active_or_own_or_admin"
on public.professional_profiles for select
to anon, authenticated
using (
  public.profile_is_active(profile_id)
  or profile_id = auth.uid()
  or public.current_profile_is_admin()
);

create policy "professional_profiles_insert_own"
on public.professional_profiles for insert
to authenticated
with check (profile_id = auth.uid());

create policy "professional_profiles_update_own_or_admin"
on public.professional_profiles for update
to authenticated
using (profile_id = auth.uid() or public.current_profile_is_admin())
with check (profile_id = auth.uid() or public.current_profile_is_admin());

-- Companies ------------------------------------------------------------------

create policy "companies_select_public_or_owner_or_admin"
on public.companies for select
to anon, authenticated
using (
  public.profile_is_active(owner_profile_id)
  or owner_profile_id = auth.uid()
  or public.current_profile_is_admin()
);

create policy "companies_insert_owner"
on public.companies for insert
to authenticated
with check (owner_profile_id = auth.uid());

create policy "companies_update_owner_or_admin"
on public.companies for update
to authenticated
using (owner_profile_id = auth.uid() or public.current_profile_is_admin())
with check (owner_profile_id = auth.uid() or public.current_profile_is_admin());

create policy "companies_delete_owner_or_admin"
on public.companies for delete
to authenticated
using (owner_profile_id = auth.uid() or public.current_profile_is_admin());

-- Training providers ---------------------------------------------------------

create policy "training_providers_select_public_or_owner_or_admin"
on public.training_providers for select
to anon, authenticated
using (
  public.profile_is_active(owner_profile_id)
  or owner_profile_id = auth.uid()
  or public.current_profile_is_admin()
);

create policy "training_providers_insert_owner"
on public.training_providers for insert
to authenticated
with check (owner_profile_id = auth.uid());

create policy "training_providers_update_owner_or_admin"
on public.training_providers for update
to authenticated
using (owner_profile_id = auth.uid() or public.current_profile_is_admin())
with check (owner_profile_id = auth.uid() or public.current_profile_is_admin());

create policy "training_providers_delete_owner_or_admin"
on public.training_providers for delete
to authenticated
using (owner_profile_id = auth.uid() or public.current_profile_is_admin());

-- Feed -----------------------------------------------------------------------

create policy "posts_select_published_or_author_or_admin"
on public.posts for select
to anon, authenticated
using (
  status = 'published'
  or author_profile_id = auth.uid()
  or public.current_profile_is_admin()
);

create policy "posts_insert_author"
on public.posts for insert
to authenticated
with check (author_profile_id = auth.uid());

create policy "posts_update_author_or_admin"
on public.posts for update
to authenticated
using (author_profile_id = auth.uid() or public.current_profile_is_admin())
with check (author_profile_id = auth.uid() or public.current_profile_is_admin());

create policy "posts_delete_author_or_admin"
on public.posts for delete
to authenticated
using (author_profile_id = auth.uid() or public.current_profile_is_admin());

create policy "comments_select_visible_post_or_author_or_admin"
on public.comments for select
to anon, authenticated
using (
  (status = 'published' and public.post_is_visible(post_id))
  or author_profile_id = auth.uid()
  or public.current_profile_is_admin()
);

create policy "comments_insert_author_on_visible_post"
on public.comments for insert
to authenticated
with check (
  author_profile_id = auth.uid()
  and public.post_is_visible(post_id)
);

create policy "comments_update_author_or_admin"
on public.comments for update
to authenticated
using (author_profile_id = auth.uid() or public.current_profile_is_admin())
with check (author_profile_id = auth.uid() or public.current_profile_is_admin());

create policy "comments_delete_author_or_admin"
on public.comments for delete
to authenticated
using (author_profile_id = auth.uid() or public.current_profile_is_admin());

create policy "likes_select_visible_post_or_owner_or_admin"
on public.likes for select
to anon, authenticated
using (
  public.post_is_visible(post_id)
  or profile_id = auth.uid()
  or public.current_profile_is_admin()
);

create policy "likes_insert_own_on_visible_post"
on public.likes for insert
to authenticated
with check (
  profile_id = auth.uid()
  and public.post_is_visible(post_id)
);

create policy "likes_delete_own_or_admin"
on public.likes for delete
to authenticated
using (profile_id = auth.uid() or public.current_profile_is_admin());

-- Saved items ----------------------------------------------------------------

create policy "saved_items_select_own_or_admin"
on public.saved_items for select
to authenticated
using (profile_id = auth.uid() or public.current_profile_is_admin());

create policy "saved_items_insert_own"
on public.saved_items for insert
to authenticated
with check (
  profile_id = auth.uid()
  and (
    (item_type = 'post' and post_id is not null and public.post_is_visible(post_id))
    or (item_type = 'job' and job_id is not null and public.job_is_visible(job_id))
    or (
      item_type = 'course_event'
      and course_event_id is not null
      and public.course_event_is_visible(course_event_id)
    )
  )
);

create policy "saved_items_delete_own_or_admin"
on public.saved_items for delete
to authenticated
using (profile_id = auth.uid() or public.current_profile_is_admin());

-- Network and communication --------------------------------------------------

create policy "connections_select_participant_or_admin"
on public.connections for select
to authenticated
using (
  requester_profile_id = auth.uid()
  or recipient_profile_id = auth.uid()
  or public.current_profile_is_admin()
);

create policy "connections_insert_requester"
on public.connections for insert
to authenticated
with check (
  requester_profile_id = auth.uid()
  and recipient_profile_id <> auth.uid()
  and status = 'pending'
  and public.profile_is_active(recipient_profile_id)
);

create policy "connections_update_participant_or_admin"
on public.connections for update
to authenticated
using (
  requester_profile_id = auth.uid()
  or recipient_profile_id = auth.uid()
  or public.current_profile_is_admin()
)
with check (
  requester_profile_id = auth.uid()
  or recipient_profile_id = auth.uid()
  or public.current_profile_is_admin()
);

create policy "connections_delete_participant_or_admin"
on public.connections for delete
to authenticated
using (
  requester_profile_id = auth.uid()
  or recipient_profile_id = auth.uid()
  or public.current_profile_is_admin()
);

create policy "contact_requests_select_participant_or_admin"
on public.contact_requests for select
to authenticated
using (
  sender_profile_id = auth.uid()
  or recipient_profile_id = auth.uid()
  or public.current_profile_is_admin()
);

create policy "contact_requests_insert_sender"
on public.contact_requests for insert
to authenticated
with check (
  sender_profile_id = auth.uid()
  and recipient_profile_id <> auth.uid()
  and public.profile_is_active(recipient_profile_id)
);

create policy "contact_requests_update_participant_or_admin"
on public.contact_requests for update
to authenticated
using (
  sender_profile_id = auth.uid()
  or recipient_profile_id = auth.uid()
  or public.current_profile_is_admin()
)
with check (
  sender_profile_id = auth.uid()
  or recipient_profile_id = auth.uid()
  or public.current_profile_is_admin()
);

-- Jobs -----------------------------------------------------------------------

create policy "jobs_select_published_or_owner_or_admin"
on public.jobs for select
to anon, authenticated
using (
  status = 'published'
  or public.current_profile_owns_company(company_id)
  or public.current_profile_is_admin()
);

create policy "jobs_insert_company_owner"
on public.jobs for insert
to authenticated
with check (
  created_by_profile_id = auth.uid()
  and public.current_profile_owns_company(company_id)
);

create policy "jobs_update_company_owner_or_admin"
on public.jobs for update
to authenticated
using (
  public.current_profile_owns_company(company_id)
  or public.current_profile_is_admin()
)
with check (
  public.current_profile_owns_company(company_id)
  or public.current_profile_is_admin()
);

create policy "jobs_delete_company_owner_or_admin"
on public.jobs for delete
to authenticated
using (
  public.current_profile_owns_company(company_id)
  or public.current_profile_is_admin()
);

create policy "job_applications_select_applicant_or_company_owner_or_admin"
on public.job_applications for select
to authenticated
using (
  applicant_profile_id = auth.uid()
  or public.current_profile_is_admin()
  or exists (
    select 1
    from public.jobs
    where jobs.id = job_applications.job_id
      and public.current_profile_owns_company(jobs.company_id)
  )
);

create policy "job_applications_insert_applicant_on_visible_job"
on public.job_applications for insert
to authenticated
with check (
  applicant_profile_id = auth.uid()
  and public.job_is_visible(job_id)
);

create policy "job_applications_update_company_owner_or_admin"
on public.job_applications for update
to authenticated
using (
  public.current_profile_is_admin()
  or exists (
    select 1
    from public.jobs
    where jobs.id = job_applications.job_id
      and public.current_profile_owns_company(jobs.company_id)
  )
)
with check (
  public.current_profile_is_admin()
  or exists (
    select 1
    from public.jobs
    where jobs.id = job_applications.job_id
      and public.current_profile_owns_company(jobs.company_id)
  )
);

create policy "job_applications_delete_applicant_or_admin"
on public.job_applications for delete
to authenticated
using (applicant_profile_id = auth.uid() or public.current_profile_is_admin());

-- Academy --------------------------------------------------------------------

create policy "course_events_select_published_or_owner_or_admin"
on public.course_events for select
to anon, authenticated
using (
  status = 'published'
  or public.current_profile_owns_training_provider(training_provider_id)
  or public.current_profile_is_admin()
);

create policy "course_events_insert_provider_owner"
on public.course_events for insert
to authenticated
with check (
  created_by_profile_id = auth.uid()
  and public.current_profile_owns_training_provider(training_provider_id)
);

create policy "course_events_update_provider_owner_or_admin"
on public.course_events for update
to authenticated
using (
  public.current_profile_owns_training_provider(training_provider_id)
  or public.current_profile_is_admin()
)
with check (
  public.current_profile_owns_training_provider(training_provider_id)
  or public.current_profile_is_admin()
);

create policy "course_events_delete_provider_owner_or_admin"
on public.course_events for delete
to authenticated
using (
  public.current_profile_owns_training_provider(training_provider_id)
  or public.current_profile_is_admin()
);

create policy "course_event_interests_select_own_or_provider_owner_or_admin"
on public.course_event_interests for select
to authenticated
using (
  profile_id = auth.uid()
  or public.current_profile_is_admin()
  or exists (
    select 1
    from public.course_events
    where course_events.id = course_event_interests.course_event_id
      and public.current_profile_owns_training_provider(course_events.training_provider_id)
  )
);

create policy "course_event_interests_insert_own_on_visible_event"
on public.course_event_interests for insert
to authenticated
with check (
  profile_id = auth.uid()
  and public.course_event_is_visible(course_event_id)
);

create policy "course_event_interests_update_provider_owner_or_admin"
on public.course_event_interests for update
to authenticated
using (
  public.current_profile_is_admin()
  or exists (
    select 1
    from public.course_events
    where course_events.id = course_event_interests.course_event_id
      and public.current_profile_owns_training_provider(course_events.training_provider_id)
  )
)
with check (
  public.current_profile_is_admin()
  or exists (
    select 1
    from public.course_events
    where course_events.id = course_event_interests.course_event_id
      and public.current_profile_owns_training_provider(course_events.training_provider_id)
  )
);

create policy "course_event_interests_delete_own_or_admin"
on public.course_event_interests for delete
to authenticated
using (profile_id = auth.uid() or public.current_profile_is_admin());

-- Notifications and moderation ----------------------------------------------

create policy "notifications_select_recipient_or_admin"
on public.notifications for select
to authenticated
using (recipient_profile_id = auth.uid() or public.current_profile_is_admin());

create policy "notifications_update_recipient_or_admin"
on public.notifications for update
to authenticated
using (recipient_profile_id = auth.uid() or public.current_profile_is_admin())
with check (recipient_profile_id = auth.uid() or public.current_profile_is_admin());

create policy "notifications_delete_recipient_or_admin"
on public.notifications for delete
to authenticated
using (recipient_profile_id = auth.uid() or public.current_profile_is_admin());

create policy "reports_select_reporter_or_admin"
on public.reports for select
to authenticated
using (reporter_profile_id = auth.uid() or public.current_profile_is_admin());

create policy "reports_insert_reporter"
on public.reports for insert
to authenticated
with check (
  reporter_profile_id = auth.uid()
  and status = 'open'
  and (
    (target_type = 'post' and post_id is not null and public.post_is_visible(post_id))
    or (target_type = 'comment' and comment_id is not null and public.comment_is_visible(comment_id))
    or (target_type = 'profile' and profile_id is not null and public.profile_is_active(profile_id))
    or (target_type = 'job' and job_id is not null and public.job_is_visible(job_id))
    or (
      target_type = 'course_event'
      and course_event_id is not null
      and public.course_event_is_visible(course_event_id)
    )
  )
);

create policy "reports_update_admin"
on public.reports for update
to authenticated
using (public.current_profile_is_admin())
with check (public.current_profile_is_admin());

create policy "reports_delete_admin"
on public.reports for delete
to authenticated
using (public.current_profile_is_admin());
