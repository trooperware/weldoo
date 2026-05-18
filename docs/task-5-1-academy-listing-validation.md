# Task 5.1 - Academy listing validation

## Scope

Task 5.1 adds the first Academy surface:

- Published course and event listing at `/academy`.
- Top navigation link from the app shell to Academy.
- Search by title, description, location, duration, or price.
- Quick filters for Webinar, Online, and Workshop.
- Advanced filters for type, level, location, welding process, topic, and provider.
- Empty state when there are no matching published items.
- Optional demo seed data in `src/db/seeds/0002_demo_academy.sql`.

This task does not include course detail pages, registration flows, provider course management, payments, or certificate verification.

## Required data

The page reads from `public.course_events` and displays only rows with `status = 'published'`.

If the database has no published course events yet:

1. Ensure at least one training provider profile exists.
2. Run `src/db/seeds/0002_demo_academy.sql` in the Supabase SQL editor.
3. Reload `/academy`.

The seed is idempotent and can be run more than once.

## Validation steps

1. Open `/academy`.
2. Confirm the top navigation Academy item opens the Academy listing.
3. Confirm published items appear as cards with:
   - type badge,
   - optional level badge,
   - provider name or fallback provider text,
   - date,
   - location or Online,
   - duration,
   - price,
   - short description,
   - process/topic tags.
4. Use the search field with a term such as `TIG`, `WPS`, or `Online`.
5. Confirm the URL updates with `?q=...` and the list narrows.
6. Click Webinar, Online, and Workshop quick filters.
7. Confirm the active filter pill appears and can be cleared.
8. Open More filters and test:
   - Type,
   - Level,
   - Location,
   - Welding process,
   - Topic,
   - Provider.
9. Search for a term with no results and confirm the empty state is shown.
10. Clear all filters and confirm the full published list returns.

## Acceptance criteria

- `/academy` loads for signed-in users without errors.
- Only published academy items are visible to normal users.
- Search and filters are reflected in the URL.
- Filter chips can be removed individually.
- The page has a usable empty state.
- `npm run lint` passes.
- `npm run build` passes.

## Known follow-up tasks

- Task 5.2: Academy item detail page.
- Task 5.3: Training provider course/event management.
- Task 5.4: Registration or external registration tracking.
