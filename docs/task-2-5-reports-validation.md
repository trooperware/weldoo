# Task 2.5 - Reports and Moderation Hooks Validation

## Scope

Authenticated users can report feed posts and comments for later admin review.

## Implemented

- Report endpoint at `/api/feed/reports`.
- Report modal for posts.
- Report modal for comments.
- Required reason and optional note.
- Duplicate open reports are blocked by existing database unique indexes.
- Reports are stored in the existing `reports` table with `status = open`.

## Manual Validation

1. Sign in with a completed profile.
2. Create or open a feed post.
3. Click `Report` on the post.
4. Submit without a reason and confirm validation appears.
5. Select a reason, optionally add a note, and submit.
6. Confirm success message appears.
7. Try reporting the same post again and confirm duplicate report feedback appears.
8. Add a comment.
9. Click `Report` on the comment.
10. Submit a valid report and confirm success.

## Error Cases

- Signed-out users do not see report controls.
- Duplicate open reports return a clear message.
- RLS ensures only visible posts/comments can be reported.
- Admin review UI is not included here; this task only creates moderation hooks.

## Notes

- Admin moderation workflows are planned in the admin sprint.
- Reported content is not hidden automatically in this MVP task.
