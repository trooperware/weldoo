-- Demo jobs seed for Weldoo development.
--
-- Safe to run more than once: it does not duplicate a demo job when a job with
-- the same title already exists for the selected company.
--
-- Requirement: at least one company profile must exist in public.companies.
-- Jobs are assigned across the first available companies.

with selected_companies as (
  select
    id,
    owner_profile_id,
    row_number() over (order by created_at asc, id asc) as rn
  from public.companies
  limit 4
),
company_count as (
  select count(*)::int as total
  from selected_companies
),
demo_templates as (
  select *
  from (
    values
      (
        1,
        'TIG Welder - Stainless Steel Assemblies',
        'Join an industrial fabrication team working on stainless steel assemblies for food-grade and pharmaceutical equipment. You will read technical drawings, prepare joints, perform TIG welding, and support quality checks with the welding coordinator.',
        'Prepare stainless steel components, perform TIG welding in workshop conditions, check weld appearance and dimensional tolerance, and document completed work.',
        'Experience with TIG welding on stainless steel, ability to read drawings, good workshop discipline, and familiarity with EN ISO quality expectations.',
        'Barcelona, Spain',
        'on_site'::public.work_mode,
        'full_time'::public.contract_type,
        32000,
        42000,
        array['TIG'],
        array['Stainless steel'],
        array['EN ISO 9606-1'],
        '3-5 years',
        false,
        array['Stable workshop schedule', 'Training budget', 'Protective equipment provided']
      ),
      (
        2,
        'MIG/MAG Welder - Structural Steel',
        'We are looking for a MIG/MAG welder for structural steel fabrication projects. The role includes welding beams, frames, and support structures according to WPS instructions and project drawings.',
        'Set up welding equipment, weld structural assemblies, follow WPS requirements, and coordinate with fitters and quality inspectors.',
        'MIG/MAG experience, structural steel background, ability to work with medium-thickness materials, and commitment to safety.',
        'Madrid, Spain',
        'on_site'::public.work_mode,
        'contract'::public.contract_type,
        28000,
        38000,
        array['MIG/MAG'],
        array['Carbon steel', 'Structural steel'],
        array['EN ISO 9606-1'],
        '3-5 years',
        true,
        array['Project bonus', 'Travel allowance', 'Overtime available']
      ),
      (
        3,
        'Welding Inspector - Pressure Equipment',
        'Support inspection activities for pressure equipment and welded components. The position works closely with production, NDT providers, and project engineering teams.',
        'Perform visual inspections, review welding documentation, coordinate NDT activities, and prepare quality records for client review.',
        'Background in welding inspection, understanding of WPS/PQR documentation, and experience with pressure equipment or similar regulated environments.',
        'Tarragona, Spain',
        'hybrid'::public.work_mode,
        'full_time'::public.contract_type,
        42000,
        56000,
        array['TIG', 'MIG/MAG', 'SMAW'],
        array['Carbon steel', 'Stainless steel'],
        array['CSWIP', 'IWI', 'VT Level 2'],
        '6-10 years',
        true,
        array['Hybrid schedule', 'Certification support', 'Private health insurance']
      ),
      (
        4,
        'Pipe Welder - Industrial Maintenance',
        'Industrial maintenance role for a pipe welder supporting shutdowns, repairs, and small installation works in manufacturing plants.',
        'Weld pipe spools, repair existing lines, support shutdown activities, and follow site safety procedures.',
        'Pipe welding experience, ability to work on-site, knowledge of TIG root and SMAW/FCAW filling, and availability for planned shutdowns.',
        'Valencia, Spain',
        'on_site'::public.work_mode,
        'temporary'::public.contract_type,
        30000,
        45000,
        array['TIG', 'SMAW'],
        array['Carbon steel', 'Stainless steel'],
        array['EN ISO 9606-1'],
        '3-5 years',
        true,
        array['Shutdown bonus', 'Accommodation support', 'Meal allowance']
      ),
      (
        5,
        'Robotic Welding Technician',
        'Help operate and improve robotic welding cells for medium-volume industrial production. The role combines welding process knowledge with robot cell operation and quality follow-up.',
        'Operate robotic welding cells, adjust parameters, support fixture changes, inspect first-off parts, and report process deviations.',
        'MIG/MAG process knowledge, experience with automated or robotic welding cells, and ability to troubleshoot production issues.',
        'Bilbao, Spain',
        'on_site'::public.work_mode,
        'full_time'::public.contract_type,
        36000,
        50000,
        array['MIG/MAG', 'Robotic welding'],
        array['Carbon steel', 'High-strength steel'],
        array['WPS/PQR'],
        '3-5 years',
        false,
        array['Shift premium', 'Automation training', 'Career progression']
      ),
      (
        6,
        'Welding Engineer - WPS/PQR Qualification',
        'Lead welding procedure qualification for industrial fabrication projects. You will prepare WPS documentation, coordinate PQR testing, and support production teams during implementation.',
        'Prepare and review WPS/PQR documentation, coordinate mechanical testing, support welder qualifications, and advise production on welding parameters.',
        'Welding engineering experience, strong knowledge of EN ISO standards, ability to coordinate tests and documentation, and clear communication with production teams.',
        'Remote / Spain',
        'remote'::public.work_mode,
        'freelance'::public.contract_type,
        55000,
        80000,
        array['TIG', 'MIG/MAG', 'SMAW'],
        array['Carbon steel', 'Stainless steel', 'Duplex'],
        array['IWE', 'IWT', 'EN ISO 15614'],
        '10+ years',
        false,
        array['Remote collaboration', 'Flexible workload', 'Project-based compensation']
      )
  ) as t(
    idx,
    title,
    description,
    responsibilities,
    requirements,
    location,
    work_mode,
    contract_type,
    salary_min,
    salary_max,
    welding_processes,
    materials,
    required_certifications,
    experience_level,
    travel_required,
    benefits
  )
)
insert into public.jobs (
  company_id,
  created_by_profile_id,
  title,
  description,
  responsibilities,
  requirements,
  location,
  work_mode,
  contract_type,
  salary_min,
  salary_max,
  salary_currency,
  welding_processes,
  materials,
  required_certifications,
  experience_level,
  travel_required,
  benefits,
  status,
  published_at
)
select
  company.id,
  company.owner_profile_id,
  template.title,
  template.description,
  template.responsibilities,
  template.requirements,
  template.location,
  template.work_mode,
  template.contract_type,
  template.salary_min,
  template.salary_max,
  'EUR',
  template.welding_processes,
  template.materials,
  template.required_certifications,
  template.experience_level,
  template.travel_required,
  template.benefits,
  'published'::public.publication_status,
  now() - ((template.idx - 1) || ' days')::interval
from demo_templates template
join company_count on company_count.total > 0
join selected_companies company
  on company.rn = ((template.idx - 1) % company_count.total) + 1
where not exists (
  select 1
  from public.jobs existing
  where existing.company_id = company.id
    and existing.title = template.title
);
