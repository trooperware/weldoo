-- Demo feed seed data for Weldoo development.
--
-- Safe to run multiple times: it avoids duplicate posts by author and body.
--
-- Requirement: at least one profile must exist in public.profiles.
-- Recommended: run after creating a few professional/company/training provider
-- profiles so the feed looks varied.

with selected_profiles as (
  select
    id,
    row_number() over (order by created_at asc, id asc) as profile_rank
  from public.profiles
  where status = 'active'
  order by created_at asc, id asc
  limit 8
),
profile_count as (
  select count(*)::int as total
  from selected_profiles
),
demo_posts as (
  select *
  from (
    values
      (1, 'Completed a TIG root and hot pass on 316L pipe spools this morning. We kept heat input inside the WPS range and the visual inspection came back clean before PT.', array['TIG','316L','WPS']),
      (2, 'Small reminder from today''s toolbox talk: fit-up quality saves more time than any parameter adjustment. Good bevel prep and consistent root gap made the whole shift easier.', array['fit-up','quality','workshop']),
      (3, 'We are reviewing a new PQR for S690QL structural components. Charpy results are the critical point this week, especially around the HAZ.', array['PQR','S690QL','HAZ']),
      (4, 'Ran a batch of MAG welds with pulse settings for thinner carbon steel brackets. Less spatter, cleaner bead profile, and faster cleanup for the finishing team.', array['MAG','pulse','carbon steel']),
      (5, 'Today''s lesson from inspection: if the weld map is unclear, stop and fix the documentation before production continues. Traceability is part of the weld.', array['inspection','traceability','weld map']),
      (6, 'Preparing qualification coupons for EN ISO 9606-1. Vertical-up position still separates careful travel speed from wishful thinking.', array['EN ISO 9606-1','qualification','vertical-up']),
      (7, 'Our robotic cell needed a fixture adjustment after a tolerance drift. The welding parameters were fine; the real issue was repeatability in the clamp.', array['robotic welding','fixtures','quality']),
      (8, 'Interesting case today: stainless discoloration was not only shielding gas flow. Torch angle and post-flow discipline mattered more than expected.', array['stainless steel','TIG','shielding gas']),
      (9, 'We finished a maintenance repair on a carbon steel line. TIG root, SMAW fill, visual check, pressure test preparation. Simple work, but only if every step is respected.', array['pipe welding','SMAW','maintenance']),
      (10, 'A good WPS is not a PDF stored in a folder. It has to be understood at the bench, especially when material thickness changes between batches.', array['WPS','production','training']),
      (11, 'NDT feedback from last week showed two recurring starts/stops issues. We changed the run-off tab procedure and the first results are already better.', array['NDT','starts stops','process improvement']),
      (12, 'Looking for examples of good visual acceptance criteria posters for workshop teams. We want something practical, not another dense standards extract.', array['VT','training','workshop']),
      (13, 'Aluminium MIG today: wire feeding and cleanliness did most of the work. When prep was right, the welds were boring in the best possible way.', array['aluminium','MIG','preparation']),
      (14, 'We tested a new extraction setup around the welding bay. Comfort improved, but the main win was better visibility during longer MAG runs.', array['safety','extraction','MAG']),
      (15, 'Reviewing ISO 3834 readiness with the quality team. The technical gaps are manageable; the habit of recording evidence is the bigger change.', array['ISO 3834','quality','documentation']),
      (16, 'First day mentoring a junior welder on TIG stainless. The biggest improvement came from slowing down and watching the puddle instead of chasing speed.', array['mentoring','TIG','stainless steel']),
      (17, 'A failed bend test is frustrating, but it is also useful data. We found lack of sidewall fusion tied to travel angle and joint access.', array['bend test','fusion','qualification']),
      (18, 'New batch of consumables arrived with slightly different handling notes. Storage and drying discipline are not optional if we want repeatable welds.', array['consumables','SMAW','quality']),
      (19, 'We are planning a short internal session on reading welding symbols. Many production errors start before anyone strikes an arc.', array['drawings','symbols','training']),
      (20, 'Duplex stainless job coming up next month. Any practical tips for keeping interpass temperature under control during longer assemblies?', array['duplex','interpass','stainless steel']),
      (21, 'The best part of today was watching production and inspection agree on the acceptance plan before welding started. No surprises at the end.', array['inspection','planning','quality']),
      (22, 'MAG fillet weld macro came back with solid penetration profile. Small parameter window, but once dialed in it was stable across the batch.', array['MAG','macro','fillet weld']),
      (23, 'We moved our welder qualification records into a cleaner structure. Searchable certificates are already saving time during audits.', array['certification','audit','records']),
      (24, 'Site work reminder: a good weld in unsafe conditions is still a failed job. Access, lighting, ventilation, and permits matter.', array['site work','safety','permits']),
      (25, 'Trying a shorter daily handover between fitters and welders. Ten minutes around drawings prevented two avoidable reworks today.', array['handover','drawings','rework']),
      (26, 'Procedure qualification record PQR-2026-018 is finally complete. Tensile, bend, hardness, and impact tests all accepted.', array['PQR','testing','qualification']),
      (27, 'We compared two anti-spatter routines today. The winner was the one that did not contaminate the weld area before painting.', array['anti-spatter','painting','MAG']),
      (28, 'One of our trainees passed the first visual inspection without repair. Good prep, steady position, and no rushing the cap pass.', array['training','visual inspection','welder qualification']),
      (29, 'Reminder for anyone moving into inspection: write reports so the next person can understand the defect location without calling you.', array['inspection report','NDT','quality']),
      (30, 'Heat tint removal on stainless is more than cosmetics for this client. The passivation step is now built into our job checklist.', array['stainless steel','passivation','checklist']),
      (31, 'A small change in torch maintenance reduced porosity alarms this week. Sometimes the root cause is not exotic.', array['porosity','maintenance','TIG']),
      (32, 'We are updating our onboarding path for new welders: drawings, WPS basics, safety permits, then supervised practice coupons.', array['onboarding','training','WPS']),
      (33, 'Today we rejected a part before welding because the material certificate did not match the drawing. Cheaper to stop early.', array['material certificate','traceability','quality']),
      (34, 'Working on a fixture for repeatable tack placement. Consistent tacks made the final weld sequence much easier to control.', array['fixtures','tack welding','distortion']),
      (35, 'For the next shutdown we are preparing QR access to WPS documents from the work packs. Less paper, fewer wrong revisions.', array['shutdown','WPS','documentation']),
      (36, 'Nice result from the team: 47 welds completed, zero repairs after VT, and all records uploaded before end of shift.', array['VT','production','records'])
  ) as template(idx, body, tags)
)
insert into public.posts (
  author_profile_id,
  body,
  status,
  tags,
  created_at,
  updated_at
)
select
  profile.id,
  template.body,
  'published'::public.publication_status,
  template.tags,
  now() - ((template.idx * 3) || ' hours')::interval,
  now() - ((template.idx * 3) || ' hours')::interval
from demo_posts template
cross join profile_count
join selected_profiles profile
  on profile.profile_rank = ((template.idx - 1) % greatest(profile_count.total, 1)) + 1
where profile_count.total > 0
  and not exists (
    select 1
    from public.posts existing
    where existing.author_profile_id = profile.id
      and existing.body = template.body
  );

with selected_profiles as (
  select
    id,
    row_number() over (order by created_at asc, id asc) as profile_rank
  from public.profiles
  where status = 'active'
  order by created_at asc, id asc
  limit 8
),
profile_count as (
  select count(*)::int as total
  from selected_profiles
),
demo_posts as (
  select *
  from (
    values
      (1, 'Completed a TIG root and hot pass on 316L pipe spools this morning. We kept heat input inside the WPS range and the visual inspection came back clean before PT.'),
      (2, 'Small reminder from today''s toolbox talk: fit-up quality saves more time than any parameter adjustment. Good bevel prep and consistent root gap made the whole shift easier.'),
      (3, 'We are reviewing a new PQR for S690QL structural components. Charpy results are the critical point this week, especially around the HAZ.'),
      (4, 'Ran a batch of MAG welds with pulse settings for thinner carbon steel brackets. Less spatter, cleaner bead profile, and faster cleanup for the finishing team.'),
      (5, 'Today''s lesson from inspection: if the weld map is unclear, stop and fix the documentation before production continues. Traceability is part of the weld.'),
      (6, 'Preparing qualification coupons for EN ISO 9606-1. Vertical-up position still separates careful travel speed from wishful thinking.'),
      (7, 'Our robotic cell needed a fixture adjustment after a tolerance drift. The welding parameters were fine; the real issue was repeatability in the clamp.'),
      (8, 'Interesting case today: stainless discoloration was not only shielding gas flow. Torch angle and post-flow discipline mattered more than expected.'),
      (9, 'We finished a maintenance repair on a carbon steel line. TIG root, SMAW fill, visual check, pressure test preparation. Simple work, but only if every step is respected.'),
      (10, 'A good WPS is not a PDF stored in a folder. It has to be understood at the bench, especially when material thickness changes between batches.'),
      (11, 'NDT feedback from last week showed two recurring starts/stops issues. We changed the run-off tab procedure and the first results are already better.'),
      (12, 'Looking for examples of good visual acceptance criteria posters for workshop teams. We want something practical, not another dense standards extract.'),
      (13, 'Aluminium MIG today: wire feeding and cleanliness did most of the work. When prep was right, the welds were boring in the best possible way.'),
      (14, 'We tested a new extraction setup around the welding bay. Comfort improved, but the main win was better visibility during longer MAG runs.'),
      (15, 'Reviewing ISO 3834 readiness with the quality team. The technical gaps are manageable; the habit of recording evidence is the bigger change.'),
      (16, 'First day mentoring a junior welder on TIG stainless. The biggest improvement came from slowing down and watching the puddle instead of chasing speed.'),
      (17, 'A failed bend test is frustrating, but it is also useful data. We found lack of sidewall fusion tied to travel angle and joint access.'),
      (18, 'New batch of consumables arrived with slightly different handling notes. Storage and drying discipline are not optional if we want repeatable welds.'),
      (19, 'We are planning a short internal session on reading welding symbols. Many production errors start before anyone strikes an arc.'),
      (20, 'Duplex stainless job coming up next month. Any practical tips for keeping interpass temperature under control during longer assemblies?'),
      (21, 'The best part of today was watching production and inspection agree on the acceptance plan before welding started. No surprises at the end.'),
      (22, 'MAG fillet weld macro came back with solid penetration profile. Small parameter window, but once dialed in it was stable across the batch.'),
      (23, 'We moved our welder qualification records into a cleaner structure. Searchable certificates are already saving time during audits.'),
      (24, 'Site work reminder: a good weld in unsafe conditions is still a failed job. Access, lighting, ventilation, and permits matter.'),
      (25, 'Trying a shorter daily handover between fitters and welders. Ten minutes around drawings prevented two avoidable reworks today.'),
      (26, 'Procedure qualification record PQR-2026-018 is finally complete. Tensile, bend, hardness, and impact tests all accepted.'),
      (27, 'We compared two anti-spatter routines today. The winner was the one that did not contaminate the weld area before painting.'),
      (28, 'One of our trainees passed the first visual inspection without repair. Good prep, steady position, and no rushing the cap pass.'),
      (29, 'Reminder for anyone moving into inspection: write reports so the next person can understand the defect location without calling you.'),
      (30, 'Heat tint removal on stainless is more than cosmetics for this client. The passivation step is now built into our job checklist.'),
      (31, 'A small change in torch maintenance reduced porosity alarms this week. Sometimes the root cause is not exotic.'),
      (32, 'We are updating our onboarding path for new welders: drawings, WPS basics, safety permits, then supervised practice coupons.'),
      (33, 'Today we rejected a part before welding because the material certificate did not match the drawing. Cheaper to stop early.'),
      (34, 'Working on a fixture for repeatable tack placement. Consistent tacks made the final weld sequence much easier to control.'),
      (35, 'For the next shutdown we are preparing QR access to WPS documents from the work packs. Less paper, fewer wrong revisions.'),
      (36, 'Nice result from the team: 47 welds completed, zero repairs after VT, and all records uploaded before end of shift.')
  ) as template(idx, body)
),
all_demo_posts as (
  select
    post.id,
    post.author_profile_id,
    row_number() over (order by post.created_at desc, post.id asc) as rn
  from public.posts post
  join demo_posts template on template.body = post.body
),
comment_templates as (
  select *
  from (
    values
      (1, 'Good reminder. We saw the same fit-up issue last month.'),
      (2, 'This is exactly the kind of shop-floor detail that helps teams improve.'),
      (3, 'Would be interesting to compare the WPS range you used.'),
      (4, 'Strong point on documentation. Audits expose this quickly.'),
      (5, 'Thanks for sharing. Useful for our training session this week.')
  ) as template(comment_rank, body)
),
comment_candidates as (
  select
    post.id as post_id,
    commenter.id as author_profile_id,
    comment_templates.body,
    post.rn,
    comment_templates.comment_rank
  from all_demo_posts post
  cross join comment_templates
  join profile_count on profile_count.total > 1
  join selected_profiles commenter
    on commenter.profile_rank =
      ((post.rn + comment_templates.comment_rank - 1) % profile_count.total) + 1
  where post.rn <= 18
    and commenter.id <> post.author_profile_id
    and comment_templates.comment_rank <= case when post.rn % 3 = 0 then 3 else 2 end
)
insert into public.comments (
  post_id,
  author_profile_id,
  body,
  status,
  created_at,
  updated_at
)
select
  candidate.post_id,
  candidate.author_profile_id,
  candidate.body,
  'published'::public.publication_status,
  now() - ((candidate.rn * 3 - candidate.comment_rank) || ' hours')::interval,
  now() - ((candidate.rn * 3 - candidate.comment_rank) || ' hours')::interval
from comment_candidates candidate
where not exists (
  select 1
  from public.comments existing
  where existing.post_id = candidate.post_id
    and existing.author_profile_id = candidate.author_profile_id
    and existing.body = candidate.body
);

with selected_profiles as (
  select
    id,
    row_number() over (order by created_at asc, id asc) as profile_rank
  from public.profiles
  where status = 'active'
  order by created_at asc, id asc
  limit 8
),
profile_count as (
  select count(*)::int as total
  from selected_profiles
),
all_demo_posts as (
  select
    post.id,
    post.author_profile_id,
    row_number() over (order by post.created_at desc, post.id asc) as rn
  from public.posts post
  where post.body in (
    select body
    from (
      values
        ('Completed a TIG root and hot pass on 316L pipe spools this morning. We kept heat input inside the WPS range and the visual inspection came back clean before PT.'),
        ('Small reminder from today''s toolbox talk: fit-up quality saves more time than any parameter adjustment. Good bevel prep and consistent root gap made the whole shift easier.'),
        ('We are reviewing a new PQR for S690QL structural components. Charpy results are the critical point this week, especially around the HAZ.'),
        ('Ran a batch of MAG welds with pulse settings for thinner carbon steel brackets. Less spatter, cleaner bead profile, and faster cleanup for the finishing team.'),
        ('Today''s lesson from inspection: if the weld map is unclear, stop and fix the documentation before production continues. Traceability is part of the weld.'),
        ('Preparing qualification coupons for EN ISO 9606-1. Vertical-up position still separates careful travel speed from wishful thinking.'),
        ('Our robotic cell needed a fixture adjustment after a tolerance drift. The welding parameters were fine; the real issue was repeatability in the clamp.'),
        ('Interesting case today: stainless discoloration was not only shielding gas flow. Torch angle and post-flow discipline mattered more than expected.'),
        ('We finished a maintenance repair on a carbon steel line. TIG root, SMAW fill, visual check, pressure test preparation. Simple work, but only if every step is respected.'),
        ('A good WPS is not a PDF stored in a folder. It has to be understood at the bench, especially when material thickness changes between batches.'),
        ('NDT feedback from last week showed two recurring starts/stops issues. We changed the run-off tab procedure and the first results are already better.'),
        ('Looking for examples of good visual acceptance criteria posters for workshop teams. We want something practical, not another dense standards extract.'),
        ('Aluminium MIG today: wire feeding and cleanliness did most of the work. When prep was right, the welds were boring in the best possible way.'),
        ('We tested a new extraction setup around the welding bay. Comfort improved, but the main win was better visibility during longer MAG runs.'),
        ('Reviewing ISO 3834 readiness with the quality team. The technical gaps are manageable; the habit of recording evidence is the bigger change.'),
        ('First day mentoring a junior welder on TIG stainless. The biggest improvement came from slowing down and watching the puddle instead of chasing speed.'),
        ('A failed bend test is frustrating, but it is also useful data. We found lack of sidewall fusion tied to travel angle and joint access.'),
        ('New batch of consumables arrived with slightly different handling notes. Storage and drying discipline are not optional if we want repeatable welds.'),
        ('We are planning a short internal session on reading welding symbols. Many production errors start before anyone strikes an arc.'),
        ('Duplex stainless job coming up next month. Any practical tips for keeping interpass temperature under control during longer assemblies?'),
        ('The best part of today was watching production and inspection agree on the acceptance plan before welding started. No surprises at the end.'),
        ('MAG fillet weld macro came back with solid penetration profile. Small parameter window, but once dialed in it was stable across the batch.'),
        ('We moved our welder qualification records into a cleaner structure. Searchable certificates are already saving time during audits.'),
        ('Site work reminder: a good weld in unsafe conditions is still a failed job. Access, lighting, ventilation, and permits matter.'),
        ('Trying a shorter daily handover between fitters and welders. Ten minutes around drawings prevented two avoidable reworks today.'),
        ('Procedure qualification record PQR-2026-018 is finally complete. Tensile, bend, hardness, and impact tests all accepted.'),
        ('We compared two anti-spatter routines today. The winner was the one that did not contaminate the weld area before painting.'),
        ('One of our trainees passed the first visual inspection without repair. Good prep, steady position, and no rushing the cap pass.'),
        ('Reminder for anyone moving into inspection: write reports so the next person can understand the defect location without calling you.'),
        ('Heat tint removal on stainless is more than cosmetics for this client. The passivation step is now built into our job checklist.'),
        ('A small change in torch maintenance reduced porosity alarms this week. Sometimes the root cause is not exotic.'),
        ('We are updating our onboarding path for new welders: drawings, WPS basics, safety permits, then supervised practice coupons.'),
        ('Today we rejected a part before welding because the material certificate did not match the drawing. Cheaper to stop early.'),
        ('Working on a fixture for repeatable tack placement. Consistent tacks made the final weld sequence much easier to control.'),
        ('For the next shutdown we are preparing QR access to WPS documents from the work packs. Less paper, fewer wrong revisions.'),
        ('Nice result from the team: 47 welds completed, zero repairs after VT, and all records uploaded before end of shift.')
    ) as demo_bodies(body)
  )
),
like_candidates as (
  select
    post.id as post_id,
    liker.id as profile_id
  from all_demo_posts post
  cross join profile_count
  join selected_profiles liker
    on liker.profile_rank = ((post.rn + 1) % greatest(profile_count.total, 1)) + 1
  where profile_count.total > 1
    and post.rn <= 24
    and liker.id <> post.author_profile_id
),
save_candidates as (
  select
    post.id as post_id,
    saver.id as profile_id
  from all_demo_posts post
  cross join profile_count
  join selected_profiles saver
    on saver.profile_rank = ((post.rn + 3) % greatest(profile_count.total, 1)) + 1
  where profile_count.total > 1
    and post.rn between 6 and 18
    and saver.id <> post.author_profile_id
)
insert into public.likes (post_id, profile_id)
select post_id, profile_id
from like_candidates
on conflict (post_id, profile_id) do nothing;

with selected_profiles as (
  select
    id,
    row_number() over (order by created_at asc, id asc) as profile_rank
  from public.profiles
  where status = 'active'
  order by created_at asc, id asc
  limit 8
),
profile_count as (
  select count(*)::int as total
  from selected_profiles
),
all_demo_posts as (
  select
    post.id,
    post.author_profile_id,
    row_number() over (order by post.created_at desc, post.id asc) as rn
  from public.posts post
  where post.body like 'Completed a TIG root and hot pass on 316L pipe spools%'
     or post.body like 'Small reminder from today%'
     or post.body like 'We are reviewing a new PQR%'
     or post.body like 'Ran a batch of MAG welds%'
     or post.body like 'Today''s lesson from inspection%'
     or post.body like 'Preparing qualification coupons%'
     or post.body like 'Our robotic cell needed%'
     or post.body like 'Interesting case today%'
     or post.body like 'We finished a maintenance repair%'
     or post.body like 'A good WPS is not a PDF%'
     or post.body like 'NDT feedback from last week%'
     or post.body like 'Looking for examples of good visual%'
     or post.body like 'Aluminium MIG today%'
     or post.body like 'We tested a new extraction setup%'
     or post.body like 'Reviewing ISO 3834%'
     or post.body like 'First day mentoring%'
     or post.body like 'A failed bend test%'
     or post.body like 'New batch of consumables%'
     or post.body like 'We are planning a short internal session%'
     or post.body like 'Duplex stainless job%'
     or post.body like 'The best part of today%'
     or post.body like 'MAG fillet weld macro%'
     or post.body like 'We moved our welder qualification%'
     or post.body like 'Site work reminder%'
     or post.body like 'Trying a shorter daily handover%'
     or post.body like 'Procedure qualification record%'
     or post.body like 'We compared two anti-spatter%'
     or post.body like 'One of our trainees%'
     or post.body like 'Reminder for anyone moving into inspection%'
     or post.body like 'Heat tint removal on stainless%'
     or post.body like 'A small change in torch maintenance%'
     or post.body like 'We are updating our onboarding path%'
     or post.body like 'Today we rejected a part%'
     or post.body like 'Working on a fixture%'
     or post.body like 'For the next shutdown%'
     or post.body like 'Nice result from the team%'
),
save_candidates as (
  select
    post.id as post_id,
    saver.id as profile_id
  from all_demo_posts post
  cross join profile_count
  join selected_profiles saver
    on saver.profile_rank = ((post.rn + 3) % greatest(profile_count.total, 1)) + 1
  where profile_count.total > 1
    and post.rn between 6 and 18
    and saver.id <> post.author_profile_id
)
insert into public.saved_items (
  profile_id,
  item_type,
  post_id
)
select
  profile_id,
  'post'::public.saved_item_type,
  post_id
from save_candidates
on conflict (profile_id, post_id) where post_id is not null do nothing;
