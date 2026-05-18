# Task 5.5 - Academy interest registration validation

Task 5.5 improves Academy interest registration:

- Users register interest with an optional message.
- Duplicate interest registrations are prevented by the existing database constraint.
- Training providers can review interested users for their own Academy items.
- Provider interest list is available at `/training-provider/academy/interests`.

## Validation Steps

1. Sign in as a professional user.
2. Open a published Academy item.
3. Click `Register now`.
4. Confirm an in-app modal appears with an optional `Message` field.
5. Submit a short message.
6. Confirm the button changes to `Registered`.
7. Refresh the page and confirm the item still appears as registered.
8. Try to register interest again and confirm duplicate registration is not possible.
9. Sign in as the owning training provider.
10. Open `/training-provider/academy/interests`.
11. Confirm the interested user appears with:
    - user name
    - profile summary
    - Academy item title
    - registration date
    - optional message
12. Sign in as a different training provider and confirm they cannot see another provider's interests.

## Acceptance Criteria

- Registration works only for authenticated users.
- Optional message is stored in `course_event_interests.note`.
- Duplicate active interest for the same user and course/event is prevented.
- Training provider can only see interests for owned course/events.
- Public users cannot access the provider interests page.
- This does not introduce real-time chat, payments, or live video.
