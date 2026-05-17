# Task 1.5 - Training Provider Profile Edit Validation

## Scope

Training provider users can maintain a structured organisation profile and expose it through a public profile page.

## Implemented

- Private training provider profile edit route at `/training-provider/edit`.
- Public training provider profile route at `/training-providers/[providerId]`.
- Server-side save endpoint at `/api/profile/training-provider`.
- Zod validation for organisation name, location, description, website, contact email, training types, logo URL, and cover URL.
- Owner check before saving: only authenticated users with `profile_type = training_provider` can edit training provider data.
- Dashboard and authenticated header link training provider users to their edit page.

## Manual Validation

1. Sign in with a user that completed onboarding as `training_provider`.
2. Open `/dashboard`.
3. Confirm the dashboard shows an `Edit training provider profile` action.
4. Open `/training-provider/edit`.
5. Save a valid training provider profile.
6. Confirm the success message appears.
7. Open the public profile link returned by the form.
8. Confirm organisation name, location, training types, description, website, and contact email display correctly.
9. Sign in as a `professional` or `company` user and open `/training-provider/edit`.
10. Confirm the user is redirected to `/dashboard`.

## Error Cases

- Empty organisation name shows a field-level validation error.
- Invalid website, logo, or cover URLs show field-level validation errors.
- Invalid contact email shows a field-level validation error.
- Non-training-provider users receive a server-level authorization error if they submit directly to `/api/profile/training-provider`.

## Notes

- The page uses the existing `training_providers` table and row-level security policies from Sprint 0.
- Logo and cover image fields currently accept URLs. Upload storage is intentionally left for a later media task.
