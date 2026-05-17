# Task 3.3 - Connections Validation

## Goal

Users can start and manage simple professional connection requests from the network directory.

## Implemented

- Connection request creation endpoint at `/api/network/connections`.
- Connection update endpoint at `/api/network/connections/[connectionId]`.
- Directory cards now show connection state:
  - `Connect` when no active relationship exists.
  - `Pending` for sent requests, clickable to cancel.
  - `Accept` / `Reject` for incoming requests.
  - `Connected` for accepted connections.
- Server-side authorization rules:
  - Users cannot connect with themselves.
  - Only active, onboarded users can send requests.
  - Only request recipients can accept or reject.
  - Only requesters can cancel.
  - Duplicate active requests are blocked by the existing database unique index.
- The directory query loads active connection state for visible cards.

## Manual QA

1. Sign in as a completed user.
2. Open `/network`.
3. Click `Connect` on another profile card.
4. Confirm the button changes to `Pending`.
5. Click `Pending` and confirm the request is cancelled and returns to `Connect`.
6. With a second user, send a request to the first user.
7. Sign back in as the first user.
8. Open `/network` and confirm the card shows `Accept` and `Reject`.
9. Accept the request and confirm both users see `Connected`.
10. Try sending a duplicate active request and confirm the app shows an error rather than creating another row.

## Notes

- This is the Phase 1 relationship model foundation.
- The optional note UI from the prototype is not implemented yet; it can be added when the contact request flow is built.
- Messaging and contact requests remain Task 3.4.
