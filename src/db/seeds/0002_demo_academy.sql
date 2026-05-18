-- Demo Academy seed data for Weldoo.
-- Safe to run multiple times; it avoids duplicate items by provider and title.
-- Requirement: at least one training provider profile must exist in public.training_providers.

with selected_providers as (
  select
    id,
    owner_profile_id,
    row_number() over (order by created_at asc) as provider_rank
  from public.training_providers
  order by created_at asc
  limit 3
),
provider_count as (
  select count(*)::int as total from selected_providers
),
template_items as (
  select *
  from (
    values
      (1, 'EN ISO 9606-1 TIG Welder Qualification Prep', 'Prepare for EN ISO 9606-1 qualification with a focused TIG welding programme covering joint preparation, welding parameters, visual inspection, and common test-piece defects.', 'online_course'::public.course_event_type, 'intermediate'::public.course_level, array['TIG', 'EN ISO 9606-1', 'qualification'], array['TIG', 'Stainless steel', 'Test pieces'], 'Online', 'https://example.com/weldoo-academy/tig-iso-9606', now() + interval '9 days', now() + interval '9 days' + interval '3 hours', '3 hours', 40, 'Free beta access'),
      (2, 'WPS and PQR Documentation Workshop', 'Hands-on workshop for welding coordinators and quality teams. Review how to structure WPS/PQR packs, avoid missing essential variables, and prepare documentation for audit.', 'workshop'::public.course_event_type, 'advanced'::public.course_level, array['WPS', 'PQR', 'ISO 15614-1', 'audit'], array['MIG/MAG', 'TIG', 'Carbon steel'], 'Barcelona, Spain', null, now() + interval '16 days', now() + interval '16 days' + interval '6 hours', '1 day', 18, 'EUR 240'),
      (3, 'NDT for Welded Joints: VT, PT and MT Basics', 'Introductory session on non-destructive testing for welded joints, including acceptance criteria, inspection reports, and coordination between welders and inspectors.', 'webinar'::public.course_event_type, 'basic'::public.course_level, array['NDT', 'VT', 'PT', 'MT', 'inspection'], array['Visual inspection', 'Magnetic particle testing'], 'Online', 'https://example.com/weldoo-academy/ndt-basics', now() + interval '21 days', now() + interval '21 days' + interval '90 minutes', '90 minutes', 120, 'Free'),
      (4, 'Industrial Pipe Welding Practice Day', 'In-person practice day for pipe welding positions, root pass control, heat input discipline, and defect prevention in industrial maintenance environments.', 'in_person_course'::public.course_event_type, 'intermediate'::public.course_level, array['Pipe welding', 'SMAW', 'TIG root', 'maintenance'], array['TIG', 'SMAW', 'Carbon steel'], 'Tarragona, Spain', null, now() + interval '28 days', now() + interval '28 days' + interval '8 hours', '1 day', 12, 'EUR 320'),
      (5, 'Welding Quality Forum: ISO 3834 in Practice', 'Sector event for welding engineers, quality managers, and industrial companies applying ISO 3834 in real production environments.', 'sector_event'::public.course_event_type, null::public.course_level, array['ISO 3834', 'quality', 'welding coordination'], array['Welding quality', 'Documentation'], 'Bilbao, Spain', null, now() + interval '35 days', now() + interval '35 days' + interval '5 hours', 'Half day', 80, 'EUR 95')
  ) as template(provider_rank, title, description, type, level, topics, welding_processes, location, online_url, starts_at, ends_at, duration_text, capacity, price_text)
)
insert into public.course_events (
  training_provider_id,
  created_by_profile_id,
  type,
  level,
  title,
  description,
  topics,
  welding_processes,
  location,
  online_url,
  external_registration_url,
  starts_at,
  ends_at,
  duration_text,
  capacity,
  price_text,
  status,
  published_at
)
select
  provider.id,
  provider.owner_profile_id,
  template.type,
  template.level,
  template.title,
  template.description,
  template.topics,
  template.welding_processes,
  template.location,
  template.online_url,
  template.online_url,
  template.starts_at,
  template.ends_at,
  template.duration_text,
  template.capacity,
  template.price_text,
  'published'::public.publication_status,
  now() - (template.provider_rank || ' days')::interval
from template_items template
cross join provider_count
join selected_providers provider
  on provider.provider_rank = ((template.provider_rank - 1) % greatest(provider_count.total, 1)) + 1
where provider_count.total > 0
  and not exists (
    select 1
    from public.course_events existing
    where existing.training_provider_id = provider.id
      and existing.title = template.title
  );
