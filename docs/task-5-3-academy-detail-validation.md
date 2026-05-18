# Task 5.3 - Academy detail validation

## Scope

Task 5.3 adds course/event detail pages and basic user actions:

- Detail route at `/academy/[courseEventId]`.
- `View course` links from the Academy listing.
- Provider summary.
- Type, level, date, time, duration, location, capacity, and price.
- Description, agenda when available, welding processes, and topics.
- Save course/event action.
- Register interest action.
- Optional external registration and recording links.
- Phase 1 webinar notice explaining that integrated live video is not included yet.

This task does not include provider-side management of interested users or course publishing forms.

## Validation steps

1. Open `/academy`.
2. Click `View course` on any course/event card.
3. Confirm the detail page URL is `/academy/[courseEventId]`.
4. Confirm `Back to Academy` returns to the listing.
5. Confirm the hero shows:
   - Type badge,
   - Level badge when available,
   - Title,
   - Description,
   - Date,
   - Time when available,
   - Duration,
   - Location or Online.
6. Confirm the body shows provider info and the `About this course/webinar` section.
7. Confirm `Agenda` appears only when the record has agenda content.
8. Confirm welding processes and topics appear as pills.
9. Click `Save course` while signed in.
10. Confirm the button changes to `Saved`.
11. Check Supabase `saved_items`:
    - `item_type = course_event`,
    - `course_event_id` matches the item,
    - `profile_id` matches the signed-in user.
12. Click `Register interest` while signed in.
13. Confirm the button changes to `Interest registered`.
14. Check Supabase `course_event_interests`:
    - `course_event_id` matches the item,
    - `profile_id` matches the signed-in user.
15. For webinar items, confirm the page does not embed live video and shows the Phase 1 external-link notice.

## Acceptance criteria

- Published Academy cards link to a real detail page.
- Non-existing or unpublished IDs return not found.
- Signed-in users can save a course/event once.
- Signed-in users can register interest once.
- Duplicate save/interest submissions do not create duplicate rows.
- Signed-out users see disabled save/interest actions.
- `npm run lint` passes.
- `npm run build` passes.

## Known follow-up tasks

- Task 5.4: Training provider course/event management.
- Task 5.5: Interested users list and richer interest registration with an optional note.
- Phase 2: Integrated live video for webinars.
