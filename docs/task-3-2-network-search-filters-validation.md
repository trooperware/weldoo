# Task 3.2 - Network Search and Filters Validation

## Goal

Users can narrow the professional network directory using search and filters, with all filter state reflected in the URL.

## Implemented

- Search form on `/network`.
- URL query parameters:
  - `q` for name, headline, company, role, sector, description, or location text.
  - `type` for profile type.
  - `location` for location text.
  - `process` for professional welding process.
  - `availability` for professional availability.
  - `experience` for professional experience range.
- Filtered Supabase queries for professionals, companies, and training providers.
- Pagination preserves active filter parameters.
- `Clear` action resets the directory to `/network`.

## Manual QA

1. Open `/network`.
2. Search by a visible profile name and confirm results narrow.
3. Search by company sector or professional headline and confirm matching cards remain.
4. Filter by `Professionals`, `Companies`, and `Training providers`.
5. Filter by location and confirm the URL includes `location=...`.
6. Filter professionals by welding process.
7. Filter professionals by availability.
8. Filter professionals by experience range.
9. Use pagination while filters are active and confirm the URL preserves the filters.
10. Click `Clear` and confirm the directory returns to the unfiltered state.

## Notes

- Welding process, availability, and experience are professional-only filters. When they are active, company and training provider cards are intentionally excluded.
- Advanced faceted counts and autocomplete are deferred until the directory has enough data to justify them.
