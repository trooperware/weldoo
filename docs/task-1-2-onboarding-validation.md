# Task 1.2 Onboarding Validation

## Scope

Implemented the first onboarding step for new Weldoo users.

## Implemented

- Protected `/onboarding` route.
- Profile type selection:
  - Professional / Welder
  - Company
  - Training provider
- Basic profile fields:
  - Display name
  - Location
  - Organization name for companies and training providers
- Creation/update of `profiles`.
- Creation/update of the matching type-specific record:
  - `professional_profiles`
  - `companies`
  - `training_providers`
- `/dashboard` redirects users back to `/onboarding` until onboarding is complete.
- Completed users are redirected from `/onboarding` to `/dashboard`.

## Automated Checks

```bash
npm run lint
npm run build
```

Both checks pass.

## Browser Checks

Checked while unauthenticated:

- `/onboarding` redirects to `/auth/sign-in?redirectTo=%2Fonboarding`.
- `/dashboard` still redirects to sign in if there is no session.

Checked with a real authenticated user:

- Professional onboarding submits successfully.
- User is redirected to `/dashboard`.
- Dashboard displays the authenticated email and `profile_type = professional`.

## Fix Applied During Validation

`FormData.get("organizationName")` returns `null` when the field is not rendered for professional users. The Zod schema now preprocesses `null` and empty strings to `undefined` for optional onboarding fields so hidden optional fields do not fail validation silently.

## Manual Validation With A Real User

Before testing, make sure both database migrations have been applied in Supabase:

- `src/db/migrations/0001_initial_schema.sql`
- `src/db/migrations/0002_row_level_security.sql`

Then validate:

1. Sign up or sign in with a confirmed Supabase Auth user.
2. Open `/onboarding`.
3. Select `Professional / Welder`.
4. Enter a display name and submit.
5. Confirm Supabase has:
   - one `profiles` row with `profile_type = professional`
   - one `professional_profiles` row for the same user id
6. Repeat with a fresh user for `Company`.
7. Confirm Supabase has:
   - one `profiles` row with `profile_type = company`
   - one `companies` row with `owner_profile_id` matching the user id
8. Repeat with a fresh user for `Training provider`.
9. Confirm Supabase has:
   - one `profiles` row with `profile_type = training_provider`
   - one `training_providers` row with `owner_profile_id` matching the user id
10. After completion, `/dashboard` should load instead of redirecting back to onboarding.

## Note

The current database TypeScript types are hand-written. A few onboarding mutations use narrow casts because the generated Supabase relationship metadata is not available yet. Replace `src/types/database.ts` with generated Supabase types once the cloud project schema is finalized.
