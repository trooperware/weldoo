# WEL-126 - FEED-003 Edit and delete own post

## Scope

- Review the current edit and delete flow for feed posts.
- Keep edit and media handling intact.
- Ensure only the post owner can edit or delete from the UI and API.
- Ensure delete uses a Weldoo-styled confirmation modal and warns that the action is irreversible.
- Ensure validation and server errors remain visible to the user.

## Implementation notes

- The feed query only exposes owner controls when `currentUserId === author_profile_id`.
- The API checks the authenticated user against the post author before PATCH or DELETE.
- PATCH and DELETE also include `author_profile_id = current user` in the final database operation as a second guard.
- Deletion currently performs a hard delete of the user's own post. If Weldoo later needs audit, retention, or anonymization rules, the product policy should be confirmed before replacing hard delete with soft delete.

## Manual validation

1. Sign in with a user who owns at least one feed post.
2. Open `/`.
3. Confirm only your own posts show `Edit` and `Delete` controls.
4. Edit your post text and optionally keep, replace, or remove the image.
5. Save changes and confirm the updated post appears after refresh.
6. Open `Delete` on your own post.
7. Confirm the delete dialog uses Weldoo modal styling and says the action is irreversible.
8. Cancel the dialog and confirm the post remains.
9. Delete the post and confirm it disappears from the feed.
10. Sign in as another user and confirm posts you do not own do not show edit/delete controls.
