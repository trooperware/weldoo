# WEL-125 - FEED-002 Create post

## Scope

- Convert the feed composer into the latest prototype pattern: compact trigger in the feed, modal editor for writing the post.
- Keep the existing Supabase post creation endpoint.
- Support text plus optional image upload.
- Add a 1000 character counter and visible validation errors.
- Refresh the feed after a successful publish so the new post appears in the list.

## Manual validation

1. Sign in with a user that has completed onboarding.
2. Open `/`.
3. Confirm the feed shows the compact composer trigger with avatar, placeholder, and Photo / Video / Article actions.
4. Click the placeholder or any composer action.
5. Confirm the modal opens, focuses the text area, and shows `0 / 1000`.
6. Try submitting an empty post and confirm the submit button stays disabled.
7. Enter post text and confirm the counter updates.
8. Optionally upload a JPG, PNG, or WebP image under 5 MB.
9. Submit the post and confirm the modal closes, a success message appears, and the new post appears in the feed.
10. Reopen the composer and confirm the previous image selection was cleared.

## Notes

- Video and Article actions intentionally open the same composer modal for this MVP; full video/article post types remain future scope.
- The post body limit is now aligned with the prototype counter at 1000 characters.
