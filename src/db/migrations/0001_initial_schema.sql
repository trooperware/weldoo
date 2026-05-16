-- Weldoo Phase 1 initial schema.
-- Target: Supabase Postgres.
-- RLS policies are intentionally handled in the next migration/task.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Enums ----------------------------------------------------------------------

create type public.profile_type as enum (
  'professional',
  'company',
  'training_provider',
  'admin'
);

create type public.profile_status as enum (
  'onboarding',
  'active',
  'deactivated'
);

create type public.availability_status as enum (
  'available',
  'open_to_opportunities',
  'not_available'
);

create type public.connection_status as enum (
  'pending',
  'accepted',
  'rejected',
  'cancelled'
);

create type public.publication_status as enum (
  'draft',
  'published',
  'closed',
  'archived',
  'removed'
);

create type public.work_mode as enum (
  'on_site',
  'hybrid',
  'remote'
);

create type public.contract_type as enum (
  'full_time',
  'part_time',
  'contract',
  'temporary',
  'freelance'
);

create type public.application_status as enum (
  'submitted',
  'viewed',
  'contacted',
  'rejected'
);

create type public.course_event_type as enum (
  'online_course',
  'webinar',
  'in_person_course',
  'workshop',
  'sector_event'
);

create type public.course_level as enum (
  'basic',
  'intermediate',
  'advanced'
);

create type public.saved_item_type as enum (
  'post',
  'job',
  'course_event'
);

create type public.report_target_type as enum (
  'post',
  'comment',
  'profile',
  'job',
  'course_event'
);

create type public.report_status as enum (
  'open',
  'reviewed',
  'dismissed',
  'action_taken'
);

create type public.notification_type as enum (
  'connection_request',
  'connection_accepted',
  'post_like',
  'post_comment',
  'contact_request',
  'job_application',
  'course_event_interest'
);

-- Shared trigger --------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles -------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  profile_type public.profile_type not null,
  status public.profile_status not null default 'onboarding',
  display_name text not null,
  headline text,
  bio text,
  location text,
  website_url text,
  avatar_url text,
  cover_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) between 2 and 120),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 3000)
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table public.professional_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  years_experience integer,
  availability public.availability_status not null default 'open_to_opportunities',
  welding_processes text[] not null default '{}',
  materials text[] not null default '{}',
  positions text[] not null default '{}',
  certifications text[] not null default '{}',
  work_preferences text[] not null default '{}',
  travel_availability boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_years_experience_positive check (years_experience is null or years_experience >= 0)
);

create trigger professional_profiles_set_updated_at
before update on public.professional_profiles
for each row execute function public.set_updated_at();

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  sector text,
  company_size text,
  location text,
  description text,
  website_url text,
  contact_email text,
  logo_url text,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_name_length check (char_length(name) between 2 and 160),
  constraint companies_description_length check (description is null or char_length(description) <= 4000),
  constraint companies_contact_email_format check (contact_email is null or contact_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create table public.training_providers (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  location text,
  description text,
  website_url text,
  contact_email text,
  training_types text[] not null default '{}',
  logo_url text,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_providers_name_length check (char_length(name) between 2 and 160),
  constraint training_providers_description_length check (description is null or char_length(description) <= 4000),
  constraint training_providers_contact_email_format check (contact_email is null or contact_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

create trigger training_providers_set_updated_at
before update on public.training_providers
for each row execute function public.set_updated_at();

-- Feed -----------------------------------------------------------------------

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  image_url text,
  status public.publication_status not null default 'published',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_body_length check (char_length(body) between 1 and 5000)
);

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  status public.publication_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_body_length check (char_length(body) between 1 and 2000)
);

create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint likes_unique_post_profile unique (post_id, profile_id)
);

-- Saved items ----------------------------------------------------------------

create table public.saved_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  item_type public.saved_item_type not null,
  post_id uuid references public.posts(id) on delete cascade,
  job_id uuid,
  course_event_id uuid,
  created_at timestamptz not null default now(),
  constraint saved_items_one_target check (
    (case when post_id is not null then 1 else 0 end) +
    (case when job_id is not null then 1 else 0 end) +
    (case when course_event_id is not null then 1 else 0 end) = 1
  ),
  constraint saved_items_type_matches_target check (
    (item_type = 'post' and post_id is not null and job_id is null and course_event_id is null) or
    (item_type = 'job' and job_id is not null and post_id is null and course_event_id is null) or
    (item_type = 'course_event' and course_event_id is not null and post_id is null and job_id is null)
  )
);

-- Network and communication --------------------------------------------------

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_profile_id uuid not null references public.profiles(id) on delete cascade,
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.connection_status not null default 'pending',
  message text,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connections_no_self_request check (requester_profile_id <> recipient_profile_id),
  constraint connections_message_length check (message is null or char_length(message) <= 1000)
);

create trigger connections_set_updated_at
before update on public.connections
for each row execute function public.set_updated_at();

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  sender_profile_id uuid not null references public.profiles(id) on delete cascade,
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  constraint contact_requests_no_self_request check (sender_profile_id <> recipient_profile_id),
  constraint contact_requests_message_length check (char_length(message) between 1 and 1000)
);

-- Jobs -----------------------------------------------------------------------

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by_profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  responsibilities text,
  requirements text,
  location text,
  work_mode public.work_mode,
  contract_type public.contract_type,
  salary_min integer,
  salary_max integer,
  salary_currency char(3) not null default 'EUR',
  welding_processes text[] not null default '{}',
  materials text[] not null default '{}',
  required_certifications text[] not null default '{}',
  experience_level text,
  travel_required boolean not null default false,
  benefits text[] not null default '{}',
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_title_length check (char_length(title) between 3 and 180),
  constraint jobs_description_length check (char_length(description) between 20 and 10000),
  constraint jobs_salary_range check (
    salary_min is null or salary_max is null or salary_min <= salary_max
  )
);

alter table public.saved_items
  add constraint saved_items_job_id_fkey foreign key (job_id) references public.jobs(id) on delete cascade;

create trigger jobs_set_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  applicant_profile_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  cv_url text,
  external_cv_url text,
  status public.application_status not null default 'submitted',
  viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_applications_unique_job_applicant unique (job_id, applicant_profile_id),
  constraint job_applications_message_length check (message is null or char_length(message) <= 3000)
);

create trigger job_applications_set_updated_at
before update on public.job_applications
for each row execute function public.set_updated_at();

-- Academy --------------------------------------------------------------------

create table public.course_events (
  id uuid primary key default gen_random_uuid(),
  training_provider_id uuid not null references public.training_providers(id) on delete cascade,
  created_by_profile_id uuid not null references public.profiles(id) on delete cascade,
  type public.course_event_type not null,
  level public.course_level,
  title text not null,
  description text not null,
  agenda text,
  topics text[] not null default '{}',
  welding_processes text[] not null default '{}',
  location text,
  online_url text,
  external_registration_url text,
  recording_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  duration_text text,
  capacity integer,
  price_text text,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_events_title_length check (char_length(title) between 3 and 180),
  constraint course_events_description_length check (char_length(description) between 20 and 10000),
  constraint course_events_capacity_positive check (capacity is null or capacity > 0),
  constraint course_events_date_order check (starts_at is null or ends_at is null or starts_at <= ends_at)
);

alter table public.saved_items
  add constraint saved_items_course_event_id_fkey foreign key (course_event_id) references public.course_events(id) on delete cascade;

create trigger course_events_set_updated_at
before update on public.course_events
for each row execute function public.set_updated_at();

create table public.course_event_interests (
  id uuid primary key default gen_random_uuid(),
  course_event_id uuid not null references public.course_events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  note text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  constraint course_event_interests_unique_event_profile unique (course_event_id, profile_id),
  constraint course_event_interests_note_length check (note is null or char_length(note) <= 1000)
);

-- Notifications and moderation ----------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  type public.notification_type not null,
  title text not null,
  body text,
  target_path text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_title_length check (char_length(title) between 1 and 160),
  constraint notifications_body_length check (body is null or char_length(body) <= 1000)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_profile_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.report_target_type not null,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  course_event_id uuid references public.course_events(id) on delete cascade,
  reason text not null,
  note text,
  status public.report_status not null default 'open',
  reviewed_by_profile_id uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_reason_length check (char_length(reason) between 2 and 120),
  constraint reports_note_length check (note is null or char_length(note) <= 2000),
  constraint reports_one_target check (
    (case when post_id is not null then 1 else 0 end) +
    (case when comment_id is not null then 1 else 0 end) +
    (case when profile_id is not null then 1 else 0 end) +
    (case when job_id is not null then 1 else 0 end) +
    (case when course_event_id is not null then 1 else 0 end) = 1
  ),
  constraint reports_type_matches_target check (
    (target_type = 'post' and post_id is not null) or
    (target_type = 'comment' and comment_id is not null) or
    (target_type = 'profile' and profile_id is not null) or
    (target_type = 'job' and job_id is not null) or
    (target_type = 'course_event' and course_event_id is not null)
  )
);

create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

-- Indexes --------------------------------------------------------------------

create index profiles_profile_type_idx on public.profiles(profile_type);
create index profiles_status_idx on public.profiles(status);
create index profiles_location_idx on public.profiles(location);
create index profiles_display_name_trgm_idx on public.profiles using gin (display_name gin_trgm_ops);

create index professional_profiles_availability_idx on public.professional_profiles(availability);
create index professional_profiles_welding_processes_idx on public.professional_profiles using gin (welding_processes);
create index professional_profiles_materials_idx on public.professional_profiles using gin (materials);
create index professional_profiles_positions_idx on public.professional_profiles using gin (positions);

create index companies_owner_profile_id_idx on public.companies(owner_profile_id);
create index companies_name_idx on public.companies(name);
create index training_providers_owner_profile_id_idx on public.training_providers(owner_profile_id);
create index training_providers_name_idx on public.training_providers(name);

create index posts_author_profile_id_created_at_idx on public.posts(author_profile_id, created_at desc);
create index posts_status_created_at_idx on public.posts(status, created_at desc);
create index posts_tags_idx on public.posts using gin (tags);

create index comments_post_id_created_at_idx on public.comments(post_id, created_at);
create index comments_author_profile_id_idx on public.comments(author_profile_id);
create index likes_profile_id_idx on public.likes(profile_id);

create unique index saved_items_unique_post_idx
  on public.saved_items(profile_id, post_id)
  where post_id is not null;
create unique index saved_items_unique_job_idx
  on public.saved_items(profile_id, job_id)
  where job_id is not null;
create unique index saved_items_unique_course_event_idx
  on public.saved_items(profile_id, course_event_id)
  where course_event_id is not null;

create index connections_requester_profile_id_idx on public.connections(requester_profile_id);
create index connections_recipient_profile_id_idx on public.connections(recipient_profile_id);
create index connections_status_idx on public.connections(status);
create unique index connections_unique_active_pair_idx
  on public.connections(
    least(requester_profile_id, recipient_profile_id),
    greatest(requester_profile_id, recipient_profile_id)
  )
  where status in ('pending', 'accepted');

create index contact_requests_sender_profile_id_idx on public.contact_requests(sender_profile_id);
create index contact_requests_recipient_profile_id_created_at_idx on public.contact_requests(recipient_profile_id, created_at desc);
create unique index contact_requests_unique_open_pair_idx
  on public.contact_requests(sender_profile_id, recipient_profile_id)
  where archived_at is null;

create index jobs_company_id_idx on public.jobs(company_id);
create index jobs_status_created_at_idx on public.jobs(status, created_at desc);
create index jobs_location_idx on public.jobs(location);
create index jobs_work_mode_idx on public.jobs(work_mode);
create index jobs_contract_type_idx on public.jobs(contract_type);
create index jobs_welding_processes_idx on public.jobs using gin (welding_processes);
create index jobs_materials_idx on public.jobs using gin (materials);
create index jobs_required_certifications_idx on public.jobs using gin (required_certifications);

create index job_applications_job_id_created_at_idx on public.job_applications(job_id, created_at desc);
create index job_applications_applicant_profile_id_idx on public.job_applications(applicant_profile_id);
create index job_applications_status_idx on public.job_applications(status);

create index course_events_training_provider_id_idx on public.course_events(training_provider_id);
create index course_events_status_starts_at_idx on public.course_events(status, starts_at);
create index course_events_type_idx on public.course_events(type);
create index course_events_level_idx on public.course_events(level);
create index course_events_topics_idx on public.course_events using gin (topics);
create index course_events_welding_processes_idx on public.course_events using gin (welding_processes);

create index course_event_interests_event_id_created_at_idx on public.course_event_interests(course_event_id, created_at desc);
create index course_event_interests_profile_id_idx on public.course_event_interests(profile_id);

create index notifications_recipient_read_created_idx on public.notifications(recipient_profile_id, read_at, created_at desc);
create index reports_status_created_at_idx on public.reports(status, created_at desc);
create index reports_reporter_profile_id_idx on public.reports(reporter_profile_id);
create unique index reports_unique_open_post_idx
  on public.reports(reporter_profile_id, post_id)
  where post_id is not null and status = 'open';
create unique index reports_unique_open_comment_idx
  on public.reports(reporter_profile_id, comment_id)
  where comment_id is not null and status = 'open';
create unique index reports_unique_open_profile_idx
  on public.reports(reporter_profile_id, profile_id)
  where profile_id is not null and status = 'open';
create unique index reports_unique_open_job_idx
  on public.reports(reporter_profile_id, job_id)
  where job_id is not null and status = 'open';
create unique index reports_unique_open_course_event_idx
  on public.reports(reporter_profile_id, course_event_id)
  where course_event_id is not null and status = 'open';
