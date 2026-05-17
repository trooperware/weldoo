# Task 2.3 - Likes and Saved Posts Validation

## Scope

Authenticated users can like/unlike and save/unsave feed posts.

## Implemented

- Like/unlike endpoint at `/api/feed/posts/[postId]/like`.
- Save/unsave endpoint at `/api/feed/posts/[postId]/save`.
- Feed post action buttons with optimistic UI.
- Rollback when the server returns an error.
- Feed query now returns:
  - like count
  - current user's liked state
  - current user's saved state
- Duplicate prevention uses existing database constraints:
  - `likes_unique_post_profile`
  - `saved_items_unique_post_idx`

## Manual Validation

1. Sign in with a completed profile.
2. Create or open a feed post.
3. Click `Like`.
4. Confirm the button changes to `Liked` and the count increases.
5. Refresh the page and confirm liked state persists.
6. Click `Liked`.
7. Confirm it returns to `Like` and the count decreases.
8. Click `Save`.
9. Confirm the button changes to `Saved`.
10. Refresh the page and confirm saved state persists.
11. Click `Saved`.
12. Confirm it returns to `Save`.

## Error Cases

- Signed-out users do not see like/save action buttons.
- Duplicate like attempts are prevented by the database constraint.
- Duplicate saved post attempts are prevented by the database constraint.
- UI state rolls back if the API call fails.

## Notes

- Saved post listing is not implemented yet. This task only stores and displays saved state in the feed.
- Comments remain Task 2.4.
