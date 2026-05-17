# Task 3.1 - Network Directory Validation

## Goal

Users can browse a real directory of Weldoo profiles across professionals, companies, and training providers.

## Implemented

- Network route at `/network`.
- Server-side directory query using Supabase data from:
  - `profiles` for active professional profiles.
  - `professional_profiles` for welding-specific tags.
  - `companies`.
  - `training_providers`.
- Responsive profile cards with avatar/logo, name, type, headline/sector/training summary, location, and tags.
- Pagination with 12 profiles per page.
- Header `Network` navigation now points to `/network`.
- Empty state when no public profiles are available.

## Manual QA

1. Open `/network`.
2. Confirm the page renders inside the authenticated or anonymous app shell.
3. Confirm professional profiles show name, headline, location, availability/process/material tags when available.
4. Confirm companies show name, sector, company size, location, and logo/avatar when available.
5. Confirm training providers show name, location, training types, and logo/avatar when available.
6. Click each card type and confirm it opens the correct public profile page.
7. If more than 12 profiles exist, use `Next` and `Previous` and confirm pagination works.
8. Confirm the top navigation `Network` item opens `/network`.
9. Check mobile width and confirm cards stack without horizontal overflow.

## Notes

- Search and filters are intentionally deferred to Task 3.2.
- Connection requests and follow state are intentionally deferred to Task 3.3.
- The current directory merges the three profile sources server-side and sorts by creation date. This is acceptable for the MVP scale; a database view or RPC can replace it later if the directory grows.
