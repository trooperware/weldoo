# Task 2.1 - Feed Layout and Data Queries Validation

## Scope

The home page `/` is now the main Weldoo feed backed by Supabase data.

## Implemented

- Server-side feed query from `posts`, ordered by newest published posts first.
- Paginated feed with 10 posts per page.
- Post cards with:
  - author avatar
  - author name
  - author role
  - author headline
  - timestamp
  - post text
  - optional post image
  - tags
  - like count
  - comment count
  - saved state for signed-in users
- Empty state when there are no posts.
- Feed status sidebar showing current data source and next task.

## Manual Validation

1. Open `/`.
2. Confirm the page title is `Weldoo professional feed`.
3. If there are no posts, confirm the empty state appears.
4. Add test posts manually in Supabase or wait until Task 2.2.
5. Confirm posts appear newest first.
6. Confirm author name, role, timestamp, body, image, tags, likes, comments, and saved state display.
7. Add more than 10 published posts and confirm pagination appears.

## Notes

- Post creation, editing, deletion, and image upload are intentionally left for Task 2.2.
- Like/save actions are intentionally left for Task 2.3.
- Comments are intentionally left for Task 2.4.
