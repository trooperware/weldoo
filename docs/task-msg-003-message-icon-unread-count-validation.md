# MSG-003 Message Icon Unread Count Validation

The header message icon badge is connected to real unread contact request data.

## Implementation Notes

- `getUnreadContactRequestCount` counts only incoming contact requests where `read_at` and `archived_at` are both `null`.
- The query uses a Supabase head/count query instead of loading request rows.
- The AppShell message icon shows no badge when the count is zero.
- When the count is above zero, the badge displays the real count and the link label includes the unread total.
- Counts over 99 are capped visually as `99+`.

## Manual Validation

1. Sign in as a completed Weldoo user with no unread incoming contact requests.
2. Confirm the message icon in the header has no badge.
3. From another user, send a contact request to the signed-in user.
4. Reload any app page and confirm the message icon shows the unread request count.
5. Open `/contact-requests`.
6. Mark the request as read, archive it, decline it, or accept it.
7. Reload any app page and confirm the message icon badge disappears.
8. Repeat with multiple unread requests and confirm the badge count matches the number of incoming unread, unarchived requests.
9. Check desktop and mobile widths: the badge remains attached to the message icon and does not overlap nearby header controls.

## Automated Checks Run

- `npm run lint`
- `npm run build`

## Browser Validation Notes

- `/contact-requests` was already verified at desktop and mobile widths during MSG-002.
- A full positive unread-count flow still needs manual validation with two realistic signed-in users because it requires creating unread contact request data.
