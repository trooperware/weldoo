# Task 1.6 - Public Profile Pages Validation

## Scope

Public profile pages are available for the three Phase 1 profile types:

- Professionals at `/professionals/[profileId]`.
- Companies at `/companies/[companyId]`.
- Training providers at `/training-providers/[providerId]`.

## Implemented

- Professional public profile page with headline, location, availability, experience, travel availability, website, welding processes, materials, certifications, avatar, cover image, and owner edit action.
- Company public profile page with SEO metadata, authenticated header state, owner edit action, and empty jobs state.
- Training provider public profile page with SEO metadata, authenticated header state, owner edit action, and empty courses/events state.
- Public profile link from the professional profile edit form after save.
- Optional authenticated header state on public pages so logged-in users do not see `Sign in`.

## Manual Validation

1. Sign in as a professional user.
2. Open `/profile/edit`.
3. Confirm `View public profile` is visible.
4. Open the public professional profile.
5. Confirm profile fields render correctly and the owner sees `Edit profile`.
6. Open a company public profile from a company edit form.
7. Confirm the company profile renders and shows `No public jobs yet`.
8. Open a training provider public profile from a provider edit form.
9. Confirm the provider profile renders and shows `No public courses or events yet`.
10. Open an invalid public profile URL and confirm the not found page appears.

## Error Cases

- Inactive or missing profiles should not render publicly because Supabase RLS hides them from anonymous/public reads.
- Non-owner visitors should not see the `Edit profile` action.
- Logged-in users should see authenticated header actions rather than `Sign in`.

## Notes

- Related posts, jobs, and courses/events are represented by empty states for now. The actual lists will be connected when feed, jobs, and course/event management are implemented.
- Image fields currently use external URLs. File upload/storage remains a later media task.
