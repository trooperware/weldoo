# Header Profile Menu Validation

## Goal

Align the top-right profile avatar behavior with the prototype before messages and notifications are fully implemented.

## Implemented

- Header avatar opens a profile dropdown on desktop.
- Dropdown includes:
  - User summary with avatar initial, display name, and profile type label.
  - `My profile`, linked to the user's public profile when available.
  - `Settings`, linked to `/settings`.
  - `Log out`, using the existing Supabase sign-out action.
- Added `/settings` scaffold page so the dropdown option has a real destination.
- `getAppShellAuth()` now returns display name and public profile URL for professional, company, and training provider accounts.

## Manual QA

1. Sign in with a completed profile.
2. Open the app at desktop width.
3. Click the avatar in the top-right header.
4. Confirm the dropdown matches the prototype structure: header, `My profile`, `Settings`, divider, `Log out`.
5. Click `My profile` and confirm it opens the correct public profile.
6. Click `Settings` and confirm `/settings` loads.
7. Click `Log out` and confirm the session ends.

## Notes

- Messages and notifications remain planned separately.
- The settings page is intentionally a scaffold; full settings functionality is deferred.
