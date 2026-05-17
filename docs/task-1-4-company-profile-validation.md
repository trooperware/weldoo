# Task 1.4 - Company Profile Edit Validation

## Scope

Company users can maintain a structured company profile and expose it through a public profile page.

## Implemented

- Private company profile edit route at `/company/edit`.
- Public company profile route at `/companies/[companyId]`.
- Server-side save endpoint at `/api/profile/company`.
- Zod validation for company name, sector, size, location, description, website, contact email, logo URL, and cover URL.
- Owner check before saving: only authenticated users with `profile_type = company` can edit company data.
- Dashboard and authenticated header link company users to the company edit page.

## Manual Validation

1. Sign in with a user that completed onboarding as `company`.
2. Open `/dashboard`.
3. Confirm the dashboard shows an `Edit company profile` action.
4. Open `/company/edit`.
5. Save a valid company profile.
6. Confirm the success message appears.
7. Open the public profile link returned by the form.
8. Confirm company name, sector, size, location, description, website, and contact email display correctly.
9. Sign in as a `professional` user and open `/company/edit`.
10. Confirm the user is redirected to `/dashboard`.

## Error Cases

- Empty company name shows a field-level validation error.
- Invalid website, logo, or cover URLs show field-level validation errors.
- Invalid contact email shows a field-level validation error.
- Non-company users receive a server-level authorization error if they submit directly to `/api/profile/company`.

## Notes

- The page uses the existing `companies` table and row-level security policies from Sprint 0.
- Logo and cover image fields currently accept URLs. Upload storage is intentionally left for a later media task.
