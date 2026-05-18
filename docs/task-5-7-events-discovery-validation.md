# Task 5.7 - Events discovery validation

Task 5.7 adds a dedicated Events discovery surface:

- Top navigation `Events` opens `/events`.
- `/events` lists only published `sector_event` rows from `public.course_events`.
- Event cards show title, provider, date, location, duration, capacity when available, and actions.
- `View event` and `Register interest` open the existing course/event detail page.
- Empty and filtered states are handled.

## Manual validation

1. Sign in as any user.
2. Open `/events` from the top navigation.
3. Confirm the page does not redirect to the feed.
4. Confirm only sector events appear, not online courses, webinars, workshops, or in-person courses.
5. Click `View event` on an event card.
6. Confirm the detail page opens and displays the event content.
7. Return to `/events`.
8. Click `Register interest`.
9. Confirm it opens the same detail page, where the interest flow is available.
10. Apply a filter pill and confirm the URL updates.
11. Clear filters and confirm all events return.

## Data checks

- Published events are readable by signed-in users.
- Draft or archived events are not listed.
- The page reuses `course_events` and does not require a new events table.

## Expected result

Events are discoverable from their own navigation item while still reusing the existing Academy detail and interest registration infrastructure.
