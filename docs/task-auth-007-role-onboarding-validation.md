# WEL-119 - Role Onboarding Validation

## Scope

Weldoo onboarding lets a signed-in user choose one role and creates the correct base and role-specific database records:

- Professional / Welder.
- Company.
- Training provider.

Completed users are redirected to the feed. Users who leave onboarding unfinished can return to `/onboarding` and continue with previously saved base data where available.

## Implementation Notes

- `/onboarding` is protected and redirects anonymous users to sign in.
- Completed users are redirected from `/onboarding` to `/`.
- The onboarding API validates all submitted fields with Zod.
- The base `profiles` row is saved first with `onboarding_completed = false`.
- The selected role-specific record is then created or updated.
- Only after the role-specific record succeeds does Weldoo set `profiles.onboarding_completed = true`.

This avoids a partially completed account if company or training-provider record creation fails.

## Role Persistence

Professional:

- `profiles.profile_type = professional`.
- `professional_profiles.profile_id = auth.uid()`.

Company:

- `profiles.profile_type = company`.
- `companies.owner_profile_id = auth.uid()`.
- `companies.name` is set from the organization field.

Training provider:

- `profiles.profile_type = training_provider`.
- `training_providers.owner_profile_id = auth.uid()`.
- `training_providers.name` is set from the organization field.

## Resumable Behavior

If a user returns to onboarding before completion:

- Existing base profile values prefill display name, headline, avatar URL, and location.
- Existing company or training-provider name/location prefill when the selected type matches.
- LinkedIn OAuth profile import values are used as fallback proposals when no Weldoo value exists.

## Manual Validation

### Professional

1. Create or sign in with a user that has not completed onboarding.
2. Open `/onboarding`.
3. Select `Professional / Welder`.
4. Fill display name, location, headline, and optional avatar URL.
5. Submit.
6. Confirm redirect to `/`.
7. Confirm `profiles.onboarding_completed = true`.
8. Confirm a `professional_profiles` row exists for the user.

### Company

1. Use a new user without completed onboarding.
2. Open `/onboarding`.
3. Select `Company`.
4. Leave organization name empty and submit.
5. Confirm the validation error is visible.
6. Fill organization name and submit.
7. Confirm redirect to `/`.
8. Confirm `profiles.profile_type = company`.
9. Confirm a `companies` row exists with `owner_profile_id = auth.uid()`.

### Training Provider

1. Use a new user without completed onboarding.
2. Open `/onboarding`.
3. Select `Training provider`.
4. Fill organization name and location.
5. Submit.
6. Confirm redirect to `/`.
7. Confirm `profiles.profile_type = training_provider`.
8. Confirm a `training_providers` row exists with `owner_profile_id = auth.uid()`.

### Resume

1. Start onboarding and save enough data to create or update a base profile but force a role-specific failure in a test environment.
2. Confirm the profile remains `onboarding_completed = false`.
3. Return to `/onboarding`.
4. Confirm saved base values prefill.
5. Fix the issue and complete onboarding.

## Security and RLS Notes

- All writes use the authenticated Supabase session.
- Existing RLS policies restrict profile, company, training-provider, and professional-profile writes to the owning user.
- No service-role key is used in the onboarding flow.
