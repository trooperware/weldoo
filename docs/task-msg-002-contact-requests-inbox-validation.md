# MSG-002 Contact Requests Inbox Validation

The contact requests inbox has been polished toward the prototype messages direction while keeping the existing contact request data model.

## Implementation Notes

- `/contact-requests` now presents contact requests as a messages inbox with a compact list pane and a conversation detail pane.
- Empty states now give a clear next action back to Network.
- Incoming requests show `Accept request`, `Decline`, `Mark as read`, and archive/restore actions.
- Accepting a contact request creates or accepts an existing connection between the two profiles, then archives and marks the contact request as read.
- Declining archives and marks the contact request as read without changing the contact request data model.
- Outgoing requests show a waiting state instead of recipient-only actions.
- Mobile layout shows the inbox list first and opens the detail view as a focused screen when a request is selected.

## Manual Validation

1. Sign in as a completed Weldoo user.
2. Open `/contact-requests` with no requests and confirm the empty inbox state is visible.
3. Open `/network`, send a contact request with a short message to another profile, then return to `/contact-requests`.
4. Confirm the outgoing request appears with `Sent` state and the message preview.
5. Sign in as the recipient.
6. Open `/contact-requests`.
7. Confirm the incoming request appears in the inbox with `New` state, unread styling, sender name, message preview, and timestamp.
8. Open the request and confirm the detail pane shows the message, sender profile link, and disabled reply composer.
9. Click `Mark as read` and confirm the unread state clears.
10. Send another request, open it as the recipient, and click `Decline`; confirm it moves to archived/reviewed state.
11. Send another request, open it as the recipient, and click `Accept request`; confirm the request archives and the two profiles are connected in Network.
12. Check desktop layout at a wide viewport: list and detail panes are side by side with no overflow.
13. Check mobile layout around 390px wide: the inbox list is visible first, there is no horizontal overflow, and opening a request shows a back action to return to the list.

## Automated Checks Run

- `npm run lint`
- `npm run build`
- `/contact-requests` rendered in the in-app browser at desktop width.
- `/contact-requests` rendered in the in-app browser at 390px width with no horizontal overflow.

## Browser Validation Notes

- The signed-in empty state was verified in the browser.
- Desktop and mobile viewport checks reported no horizontal overflow.
- A full accept/decline flow still needs manual validation with two realistic signed-in users because it changes contact and connection state.
