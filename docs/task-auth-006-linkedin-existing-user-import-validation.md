# WEL-118 - LinkedIn Profile Import for Existing Users Validation

## Scope

Existing Weldoo users can connect LinkedIn after signing up with email/password, Google, or another provider.

The import uses the official LinkedIn OpenID Connect flow through Supabase Auth identity linking. No LinkedIn page scraping is used.

## Required LinkedIn/Supabase Setup

LinkedIn app requirements:

- Product: Sign In with LinkedIn using OpenID Connect.
- Scopes: `openid profile email`.
- Redirect URI: the Supabase callback URL shown in Supabase Auth provider settings, usually `https://<project-ref>.supabase.co/auth/v1/callback`.

Supabase requirements:

- Enable LinkedIn OpenID Connect provider.
- Configure LinkedIn client ID and client secret.
- Enable manual identity linking in Supabase Auth settings.
- Add app redirect URLs for each environment:
  - `http://localhost:3000/auth/callback`
  - `https://<staging-domain>/auth/callback`
  - `https://<production-domain>/auth/callback`

## User Flow

1. A signed-in user opens `/settings`.
2. The user selects LinkedIn profile import.
3. If LinkedIn is not connected, the user clicks Connect LinkedIn.
4. Supabase starts the official LinkedIn OIDC identity-linking flow.
5. After successful linking, the user returns to `/settings/linkedin-import`.
6. Weldoo shows a review screen comparing current Weldoo values with LinkedIn values.
7. The user chooses which fields to import.
8. Weldoo updates only the selected fields.

## Importable Fields

When LinkedIn returns the field through Supabase Auth identity metadata, Weldoo can import it as an explicit user-selected update:

- Display name.
- Profile image URL.
- Professional headline, if returned.

These fields are displayed for review but not persisted separately in the current model:

- First name.
- Last name.
- Email.

Weldoo currently stores a single `profiles.display_name`. First and last name may be used to build the display name proposal when LinkedIn returns them.

## Fallback Behavior

- If LinkedIn does not return a field, the field is shown as unavailable and cannot be selected.
- Existing Weldoo data is never overwritten automatically.
- If LinkedIn is already connected, the user goes directly to the review screen.
- If identity linking is disabled in Supabase, the user sees a visible error on `/settings/linkedin-import`.
- If the LinkedIn identity is already linked to a different Weldoo account, Supabase rejects the linking flow and Weldoo shows the provider error.

## Disconnect Behavior

Supabase Auth supports unlinking identities when the user has more than one identity linked. Weldoo does not expose a disconnect action in this task because disconnecting a login method needs a separate confirmation UX and account-recovery review.

If needed during testing, disconnect LinkedIn from the Supabase dashboard or add a dedicated future task for identity disconnect with an explicit confirmation modal.

## Manual Validation

1. Sign in with an existing email/password or Google user.
2. Open `/settings`.
3. Confirm the LinkedIn profile import row is visible.
4. Open `/settings/linkedin-import`.
5. Click Connect LinkedIn.
6. Complete the LinkedIn OAuth flow.
7. Confirm the app returns to `/settings/linkedin-import`.
8. Confirm the review screen shows current Weldoo values next to LinkedIn values.
9. Select one available field and import it.
10. Confirm only the selected field changes in the Weldoo profile.
11. Repeat with no fields selected and confirm a visible validation error appears.
12. Repeat with a LinkedIn account that does not return image/headline and confirm unavailable fields cannot be selected.

## Security and Privacy Notes

- Do not store LinkedIn access tokens.
- Do not request or assume LinkedIn work history, skills, certifications, or full profile details.
- Do not import anything without explicit user consent.
- Profile updates use the authenticated Supabase user and existing RLS ownership constraints.
