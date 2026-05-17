# Task 4.1 - Jobs Listing and Filters Validation

## Goal

Users can browse published jobs and narrow results with shareable URL filters.

## Implemented scope

- Jobs route at `/jobs`.
- Header `Jobs` navigation points to `/jobs`.
- Real data query from `jobs` joined with company summary data.
- Only `published` jobs are listed.
- Search by job title, description, location, and experience level.
- Filters kept in URL query parameters:
  - `q`
  - `location`
  - `process`
  - `contractType`
  - `workMode`
  - `travel`
  - `experience`
  - `company`
- Active filter pills with individual clear actions.
- Empty states for no jobs and no matching filters.

## Manual validation

1. Open `/jobs`.
2. Confirm the page loads without sign-in.
3. Confirm only published jobs appear.
4. Search for a visible job title, company keyword, location, or experience level.
5. Apply each filter and confirm the URL updates.
6. Refresh the page and confirm filters persist from the URL.
7. Clear individual filter pills and confirm results update.
8. Click the header `Jobs` item and confirm it opens `/jobs`.

## Notes

- Job detail remains Task 4.2.
- Company job creation and management remain Task 4.3.
- Applications remain Task 4.4.
- Saved jobs remain Task 4.5.
- The right-side detail pane is intentionally a placeholder until Task 4.2.
