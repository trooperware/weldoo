# MSG-001 Contact Request Validation

Users can send contact requests from Network cards and public profile pages with a short message, and existing requests keep button state consistent.

## Implementation Notes

- Network directory results now include open contact request state for the current user.
- Public professional, company, and training provider profiles load the same contact request state.
- The contact button switches to `Request sent` or `View request` when an open request already exists.
- The create endpoint blocks duplicate open requests in either direction and returns the existing request id and state when possible.
- Empty and overlong messages show client-side validation errors before submission.
- Unauthenticated users still receive the existing sign-in error from the API.

## Manual Validation

1. Sign in as a completed Weldoo user.
2. Open `/network`.
3. Click `Contact` on a profile card.
4. Click `Send request` with an empty message.
5. Confirm the modal shows `Write a short message before sending.` and the counter remains `0/1000`.
6. Type a short message and confirm the error clears and the counter updates.
7. Send the request.
8. Confirm the card button changes to `Request sent` and links to `/contact-requests?request=...`.
9. Open the same member's public profile and confirm the contact action also shows `Request sent`.
10. Sign in as the recipient.
11. Open `/contact-requests`.
12. Confirm the incoming request appears with the sender profile, message text, unread marker, and profile link.
13. Return to the sender profile from the recipient account and confirm the action shows `View request`.
14. Attempt to create the same request again from either direction and confirm the existing request state is shown instead of creating a duplicate.
15. Check `/network` and a public profile at a mobile viewport width and confirm the card/profile actions fit without horizontal overflow.

## Automated Checks Run

- `npm run lint`
- `npm run build`
- Unauthenticated POST to `/api/contact-requests` returns `Sign in to send a contact request.`

## Browser Validation Notes

- Desktop `/network` loaded successfully in the in-app browser with the signed-in session.
- The Network list showed 18 profiles and `Contact` buttons.
- The contact modal opened from the first card.
- Empty message validation, message counter, error clearing, and cancel behavior were verified without sending a real request.
- Mobile viewport validation in the in-app browser was attempted, but the browser control timed out during viewport resize.
