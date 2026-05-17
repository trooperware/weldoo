# Task 2.4 - Comments Validation

## Scope

Authenticated users can add comments to feed posts, view published comments, and delete their own comments.

## Implemented

- Create comment endpoint at `/api/feed/posts/[postId]/comments`.
- Delete comment endpoint at `/api/feed/comments/[commentId]`.
- Feed query now loads published comments for visible posts.
- Comment list under each feed post with author, timestamp, and safe text rendering.
- Comment form for signed-in users.
- Empty comment state.
- Delete confirmation modal for own comments, with irreversible action warning.

## Manual Validation

1. Sign in with a completed profile.
2. Create or open a feed post.
3. Confirm the comments section appears.
4. Submit an empty comment and confirm a field-level error appears.
5. Add a valid comment.
6. Confirm it appears with author, timestamp, and content.
7. Refresh and confirm the comment persists.
8. Delete the comment.
9. Confirm the modal warns that the action is irreversible.
10. Confirm deletion and verify the comment disappears.

## Error Cases

- Signed-out users can view comments but cannot add comments.
- Users only see delete controls on their own comments.
- Direct API delete attempts for another user's comment return authorization errors.
- Comment bodies are rendered as text, not HTML.

## Notes

- Editing comments is not included in this MVP task.
- Report/comment moderation hooks remain Task 2.5.
