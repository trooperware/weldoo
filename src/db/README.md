# Weldoo Database

This folder contains Supabase/Postgres migrations for the Weldoo MVP.

## Migration Order

1. `migrations/0001_initial_schema.sql`
   - Phase 1 tables, enums, foreign keys, constraints, and indexes.
   - Does not include RLS policies.

2. Next task: RLS policies.

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
- RLS is intentionally not included here so it can be reviewed and implemented as a dedicated security task.

## Applying Locally

Use Supabase CLI once configured:

```bash
supabase db reset
```

Or apply the SQL manually in a Supabase SQL editor during early prototyping.
