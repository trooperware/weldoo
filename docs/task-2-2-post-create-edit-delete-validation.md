# Task 2.2 - Create, Edit, and Delete Posts Validation

## Scope

Authenticated users can publish feed posts, edit their own posts, and delete their own posts.

## Implemented

- Post composer on `/` for signed-in users.
- Server endpoint to create posts at `/api/feed/posts`.
- Server endpoint to edit/delete posts at `/api/feed/posts/[postId]`.
- Inline owner controls on feed cards.
- Delete confirmation that warns the user the action is irreversible.
- Text validation:
  - body is required
  - max body length is 5000 characters
  - max 12 tags
- Optional post image upload using Supabase Storage bucket `post-images`.
- Storage migration at `src/db/migrations/0004_feed_media_storage.sql`.
- Server-side ownership checks before edit/delete.
- Loading, success, and error states.

## Manual Supabase Step

Apply `src/db/migrations/0004_feed_media_storage.sql` in the Supabase SQL editor before testing post image uploads.

## Manual Validation

1. Sign in with any completed profile.
2. Open `/`.
3. Confirm the post composer appears.
4. Submit an empty post and confirm a field-level error appears.
5. Create a text-only post.
6. Confirm the new post appears in the feed after publish.
7. Edit the post text and tags.
8. Confirm the updated post appears after save.
9. Upload a valid JPG, PNG, or WebP post image below 5 MB and save.
10. Confirm the image renders in the feed.
11. Delete the post.
12. Confirm the browser asks for confirmation and says the action is irreversible.
13. Cancel once and confirm the post remains.
14. Delete again, confirm, and confirm it disappears from the feed.

## Error Cases

- Signed-out users see a sign-in prompt instead of the composer.
- Non-owner users do not see edit/delete controls.
- Direct API edit/delete attempts for another user's post return authorization errors.
- Invalid image types and oversized images show client-side errors.

## Notes

- Like/save actions remain Task 2.3.
- Comments remain Task 2.4.
- Uploaded post images are not automatically deleted when a post is deleted. Storage cleanup can be added later if needed.
