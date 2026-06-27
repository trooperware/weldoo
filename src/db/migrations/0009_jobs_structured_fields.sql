-- Structured job fields for company job management.
--
-- Keeps the original welding-oriented columns for backwards compatibility, but
-- adds generic fields used by the current prototype job model.

alter table public.jobs
  add column if not exists area text,
  add column if not exists skills text[] not null default '{}',
  add column if not exists tools text[] not null default '{}',
  add column if not exists external_apply_url text,
  add column if not exists application_mode text not null default 'weldoo',
  add column if not exists application_deadline date,
  add column if not exists salary_visible boolean not null default true;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'jobs_area_length'
  ) then
    alter table public.jobs
      add constraint jobs_area_length check (area is null or char_length(area) <= 120);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'jobs_external_apply_url_length'
  ) then
    alter table public.jobs
      add constraint jobs_external_apply_url_length check (
        external_apply_url is null or char_length(external_apply_url) <= 500
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'jobs_application_mode_valid'
  ) then
    alter table public.jobs
      add constraint jobs_application_mode_valid check (
        application_mode in ('weldoo', 'external', 'both')
      );
  end if;
end $$;

create index if not exists jobs_area_idx on public.jobs(area);
create index if not exists jobs_skills_gin_idx on public.jobs using gin(skills);
create index if not exists jobs_tools_gin_idx on public.jobs using gin(tools);
