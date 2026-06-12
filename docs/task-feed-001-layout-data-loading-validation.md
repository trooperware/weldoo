# FEED-001 - Feed layout and data loading

## Scope

Polish the main feed layout against the latest prototype while keeping the existing Supabase data loading and post interactions intact.

## Implemented changes

- Updated the left profile card to use the signed-in user's real app shell data instead of placeholder content.
- Added `headline` and `location` to the app shell auth payload so the feed can render profile context without an extra page-level profile query.
- Preserved the existing feed data loading through `getFeedPage`.
- Adjusted the post composer action row to match the prototype proportions more closely:
  - 40px avatar.
  - Rounded input.
  - Photo, Video, and Article actions with 18px icons and 13px text.
  - Publish action remains available only when the user starts composing.
- Kept existing post publish, image upload, like, save, comment, report, edit, and delete behavior.

## Database and RLS impact

- No database migration.
- No RLS policy changed.
- Existing Supabase post, comment, like, saved item, and profile queries are unchanged.

## Manual validation

1. Sign in with a user that has completed onboarding.
2. Open `/`.
3. Confirm the header, left profile card, composer, central feed column, post cards, and right sidebar align with the latest prototype direction.
4. Confirm the left card shows the current user name, avatar if present, headline/profile type, location, and the correct edit profile destination.
5. Create a text post and confirm it appears after publish.
6. Upload a post image and publish it.
7. Like and save a post, then refresh and confirm state persists.
8. Add a comment and confirm it remains visible.
9. Edit and delete one of your own posts, confirming the platform modal is used for deletion.
10. Check mobile width and confirm the layout collapses without horizontal overflow or bottom navigation overlap.

## Notes for later performance passes

- `getFeedPage` still loads posts plus related likes, comments, saved state, and profiles in separate Supabase queries. That is acceptable for the current MVP page size, but should be profiled again after production-like seed data is added.
- Infinite scrolling is still a future enhancement. Current pagination remains unchanged.
