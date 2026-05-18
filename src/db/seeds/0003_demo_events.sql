-- Demo Events seed data for Weldoo.
-- Safe to run multiple times; it avoids duplicate events by provider and title.
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
template_events as (
  select *
  from (
    values
      (
        1,
        'European Welding Quality Forum 2026',
        'A sector event for welding coordinators, quality managers, inspectors, and industrial companies implementing ISO 3834 and EN ISO 15614 in production environments.',
        array['ISO 3834', 'quality', 'welding coordination', 'audit'],
        array['Welding quality', 'Documentation', 'Visual inspection'],
        'Bilbao, Spain',
        null,
        now() + interval '18 days',
        now() + interval '18 days' + interval '6 hours',
        '1 day',
        180,
        'EUR 95',
        'https://example.com/weldoo-events/european-welding-quality-forum-2026'
      ),
      (
        2,
        'Industrial Welding Expo Barcelona',
        'Two-day meeting point for welders, fabrication companies, equipment suppliers, and training centres focused on production welding, automation, safety, and hiring.',
        array['expo', 'automation', 'hiring', 'safety'],
        array['MIG/MAG', 'TIG', 'Robotic welding', 'Carbon steel'],
        'Barcelona, Spain',
        null,
        now() + interval '26 days',
        now() + interval '27 days' + interval '8 hours',
        '2 days',
        750,
        'Free for professionals',
        'https://example.com/weldoo-events/industrial-welding-expo-barcelona'
      ),
      (
        3,
        'WPS and PQR Roundtable for Fabricators',
        'Practical roundtable for fabrication workshops and welding engineers reviewing WPS/PQR documentation, qualification ranges, and common audit findings.',
        array['WPS', 'PQR', 'ISO 15614-1', 'welding coordination'],
        array['MIG/MAG', 'TIG', 'Stainless steel', 'Carbon steel'],
        'Tarragona, Spain',
        null,
        now() + interval '31 days',
        now() + interval '31 days' + interval '4 hours',
        'Half day',
        60,
        'EUR 45',
        'https://example.com/weldoo-events/wps-pqr-roundtable'
      ),
      (
        4,
        'Remote Welding Inspection Summit',
        'Online sector event about remote inspection workflows, digital reports, image capture, traceability, and collaboration between welders and inspection teams.',
        array['remote inspection', 'NDT', 'traceability', 'digital reports'],
        array['Visual inspection', 'NDT', 'Documentation'],
        'Online',
        'https://example.com/weldoo-events/remote-welding-inspection-summit',
        now() + interval '39 days',
        now() + interval '39 days' + interval '3 hours',
        '3 hours',
        300,
        'Free',
        'https://example.com/weldoo-events/remote-welding-inspection-summit'
      ),
      (
        5,
        'Shipbuilding Welding Talent Day',
        'Industry event connecting shipyards, welding schools, and qualified welders for talks on naval fabrication, certification paths, and talent needs.',
        array['shipbuilding', 'talent', 'certification', 'hiring'],
        array['FCAW', 'SMAW', 'MIG/MAG', 'Aluminium'],
        'Vigo, Spain',
        null,
        now() + interval '47 days',
        now() + interval '47 days' + interval '7 hours',
        '1 day',
        220,
        'EUR 30',
        'https://example.com/weldoo-events/shipbuilding-welding-talent-day'
      ),
      (
        6,
        'Advanced TIG Community Meetup',
        'Community meetup for advanced TIG welders working with stainless steel, aluminium, orbital setups, heat input control, and high-spec fabrication.',
        array['TIG', 'community', 'stainless steel', 'aluminium'],
        array['TIG', 'Orbital TIG', 'Stainless steel', 'Aluminium'],
        'Valencia, Spain',
        null,
        now() + interval '54 days',
        now() + interval '54 days' + interval '4 hours',
        'Evening meetup',
        90,
        'Free',
        'https://example.com/weldoo-events/advanced-tig-community-meetup'
      )
  ) as template(
    provider_rank,
    title,
    description,
    topics,
    welding_processes,
    location,
    online_url,
    starts_at,
    ends_at,
    duration_text,
    capacity,
    price_text,
    external_registration_url
  )
)
insert into public.course_events (
  training_provider_id,
  created_by_profile_id,
  type,
  level,
  title,
  description,
  agenda,
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
  'sector_event'::public.course_event_type,
  null::public.course_level,
  template.title,
  template.description,
  'Welcome and registration
Keynote and sector update
Practical sessions and case studies
Networking and closing discussion',
  template.topics,
  template.welding_processes,
  template.location,
  template.online_url,
  template.external_registration_url,
  template.starts_at,
  template.ends_at,
  template.duration_text,
  template.capacity,
  template.price_text,
  'published'::public.publication_status,
  now() - (template.provider_rank || ' hours')::interval
from template_events template
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
