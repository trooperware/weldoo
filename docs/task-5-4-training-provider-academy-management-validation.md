# Task 5.4 - Training provider Academy management validation

Task 5.4 adds the provider-side Academy management surface:

- `/training-provider/academy` management page.
- Create and edit course/event records.
- Save draft or publish directly.
- Move existing items to draft.
- Archive existing items with an in-app confirmation modal.
- Link from dashboard and training-provider profile menu.

## Validation Steps

1. Sign in as a `training_provider` user.
2. Open `/training-provider/academy`.
3. Confirm the page lists existing Academy items owned by the current provider.
4. Click `New Academy item`.
5. Submit an invalid form and confirm field-level validation errors appear.
6. Create a draft item with valid title, description, type, dates, duration, capacity, topics, and welding processes.
7. Confirm the item appears in the left list as `Draft`.
8. Edit the item and click `Publish`.
9. Confirm the item is visible in `/academy` and opens a public detail page.
10. Click `Move to draft` and confirm the public detail page is no longer visible.
11. Publish again, then click `Archive`.
12. Confirm the in-app confirmation modal appears before archiving.
13. Confirm archived items are not public but remain visible to the provider in the manager.
14. Sign in as a non-training-provider user and confirm `/training-provider/academy` redirects away.

## Acceptance Criteria

- Only training provider profiles can access the management page.
- Only the owner provider can create/update/archive its Academy items.
- Draft and archived Academy items are not visible in the public Academy listing.
- Published Academy items show on `/academy`.
- Archive action uses the platform modal, not a browser confirm.
- No payments or integrated live video are introduced in this task.

## Notes

- Structured modules, lessons, real progress, real enrollments, and calculated capacity remain planned in Task 5.6.
- Interest registration enhancements remain Task 5.5.
