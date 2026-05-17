# Task 3.4 - Contact Request Flow Validation

## Goal

Users can send a simple contact request to another profile before real-time chat exists.

## Implemented scope

- Contact request creation endpoint at `/api/contact-requests`.
- Contact request update endpoint at `/api/contact-requests/[contactRequestId]`.
- Contact modal from public professional, company, and training provider profiles.
- Contact modal from Network cards for signed-in users.
- Contact requests inbox at `/contact-requests`.
- Header message icon links to `/contact-requests` and shows the real unread incoming count.
- Messages page uses the prototype-style two-pane layout: conversation list, search field, active detail panel, and disabled reply area until advanced chat exists.
- Incoming requests can be marked as read, archived, and unarchived.
- Sent requests are visible for the sender.

## Manual validation

1. Sign in with a completed profile.
2. Open `/network`.
3. Confirm your own profile is not listed.
4. Open a different profile card or use its `Contact` button.
5. Send an empty message and confirm a validation error appears.
6. Send a valid short message.
7. Confirm the success state appears and duplicate open requests to the same profile are blocked.
8. Sign in as the recipient profile.
9. Open `/contact-requests` or click the header message icon.
10. Confirm the incoming request appears with sender, message, timestamp, and profile link.
11. Confirm the header message badge shows the unread incoming count.
12. Click `Mark as read` and confirm the `New` badge disappears and the header badge updates.
13. Click `Archive` and confirm the request is no longer counted as active unread.
14. Click `Unarchive` and confirm it returns to the conversation list.

## Notes

- This is intentionally not chat.
- No push, email, or real-time notification infrastructure is included here.
- Only recipients can mark, archive, or unarchive a contact request.
- The database already prevents open duplicate requests for the same sender/recipient pair.
