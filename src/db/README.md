# Weldoo Database

This folder contains Supabase/Postgres migrations for the Weldoo MVP.

## Migration Order

1. `migrations/0001_initial_schema.sql`
   - Phase 1 tables, enums, foreign keys, constraints, and indexes.

2. `migrations/0002_row_level_security.sql`
   - Enables RLS on all Phase 1 tables.
   - Adds table grants for `anon` and `authenticated`.
   - Adds ownership, participant, public-read, and admin policies.
   - Adds immutable relationship triggers for private relationship tables.

3. `migrations/0003_profile_media_storage.sql`
   - Creates public Supabase Storage buckets for avatars and cover images.
   - Limits uploads to JPG, PNG, and WebP.
   - Restricts writes to each user's own storage folder.

4. `migrations/0004_feed_media_storage.sql`
   - Creates a public Supabase Storage bucket for post images.
   - Limits uploads to JPG, PNG, and WebP.
   - Restricts writes to each user's own storage folder.

## Design Notes

- `profiles.id` references `auth.users(id)` so each authenticated user has one primary profile.
- `professional_profiles`, `companies`, and `training_providers` hold type-specific fields.
- Phase 1 certifications are self-declared text arrays. Official verification is deferred to Phase 2.
- Feed, jobs, academy, contact requests, notifications, and moderation are modelled as separate vertical slices.
- Duplicate prevention is handled with unique constraints or partial unique indexes:
  - likes per post/profile
  - saved items per target/profile
  - one active connection per unordered profile pair
  - one open contact request per sender/recipient pair
  - job applications per job/applicant
  - course/event interests per course/profile
  - open reports per reporter/target
- `publication_status` is reused for posts, comments, jobs, and course/events to keep early state management simple.
- RLS is enabled in a separate migration so the data model and access model can be reviewed independently.
- Public reads are limited to active profiles and published feed/job/course data.
- Profile media files are publicly readable, but authenticated users can only write inside their own folder.
- Private data such as saved items, connections, contact requests, notifications, applications, and interests is limited to the owner or the involved parties.
- Admin access is routed through `current_profile_is_admin()` rather than broad public policies.
- Relationship IDs in connections, contact requests, job applications, and course/event interests are immutable after creation.

## Applying Locally

Use Supabase CLI once configured:

```bash
supabase db reset
```

Or apply the SQL manually in a Supabase SQL editor during early prototyping.

## Development Seeds

Seed files live in `seeds/` and are intended for development/demo data only.

1. `seeds/0001_demo_jobs.sql`
   - Inserts realistic published welding-sector jobs.
   - Requires at least one existing company profile in `public.companies`.
   - Safe to run multiple times; it avoids duplicate jobs with the same title for the same company.

2. `seeds/0002_demo_academy.sql`
   - Inserts realistic published welding courses, webinars, workshops, and sector events.
   - Requires at least one existing training provider profile in `public.training_providers`.
   - Safe to run multiple times; it avoids duplicate academy items with the same title for the same provider.

Apply seed SQL manually in the Supabase SQL editor after migrations are applied and the required profile type exists.
