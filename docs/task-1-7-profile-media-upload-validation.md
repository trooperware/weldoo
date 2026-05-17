# Task 1.7 - Profile Media Upload Validation

## Scope

Profile forms support real image uploads for avatars, logos, and cover images through Supabase Storage.

## Implemented

- Storage migration at `src/db/migrations/0003_profile_media_storage.sql`.
- Public buckets:
  - `avatars`: JPG, PNG, WebP, max 2 MB.
  - `covers`: JPG, PNG, WebP, max 5 MB.
- Storage policies that allow public reads and authenticated writes only inside the current user's folder.
- Reusable upload component at `src/components/profile/profile-media-upload-field.tsx`.
- Upload controls connected to:
  - Professional avatar and cover.
  - Company logo and cover.
  - Training provider logo and cover.

## Manual Supabase Step

Apply `src/db/migrations/0003_profile_media_storage.sql` in the Supabase SQL editor before testing uploads.

## Manual Validation

1. Apply the storage migration.
2. Sign in as a professional user.
3. Open `/profile/edit`.
4. Upload a valid JPG, PNG, or WebP avatar smaller than 2 MB.
5. Confirm the upload success message appears.
6. Upload a valid cover image smaller than 5 MB.
7. Click `Save profile`.
8. Open the public profile and confirm avatar and cover render.
9. Repeat the same flow for company and training provider users.

## Error Cases

- Uploading a non-image file shows a client-side error.
- Uploading an avatar above 2 MB shows a client-side error.
- Uploading a cover above 5 MB shows a client-side error.
- Uploading while signed out shows a sign-in error.
- Saving still uses the existing profile API validation, so invalid stored URLs are rejected.

## Notes

- Files are uploaded before the profile is saved. If profile save fails after upload, the uploaded file can remain in Storage. Cleanup can be added later if needed.
- Storage paths are namespaced by authenticated user id.
