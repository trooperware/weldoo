# WEL-117 - LinkedIn OAuth Profile Import Validation

## Scope

Weldoo imports LinkedIn profile data only from the official OAuth/OpenID Connect data returned by Supabase Auth.

No LinkedIn page scraping is used.

## Required LinkedIn/Supabase Setup

LinkedIn app requirements:

- Product: Sign In with LinkedIn using OpenID Connect.
- Scopes: `openid profile email`.
- Redirect URI: the Supabase callback URL shown in Supabase Auth provider settings, usually `https://<project-ref>.supabase.co/auth/v1/callback`.

Supabase requirements:

- Enable LinkedIn OpenID Connect provider.
- Configure LinkedIn client ID and client secret.
- Add app redirect URLs for each environment:
  - `http://localhost:3000/auth/callback`
  - `https://<staging-domain>/auth/callback`
  - `https://<production-domain>/auth/callback`

## Imported Fields

When LinkedIn returns the field through Supabase Auth metadata, Weldoo uses it as an editable proposal:

- First name: displayed for review.
- Last name: displayed for review.
- Email: displayed for review as the Supabase Auth account email.
- Display name: prefilled from LinkedIn `name`/`full_name` or first + last name.
- Profile image: prefilled into `profiles.avatar_url` as an editable URL.
- Professional headline: prefilled into `profiles.headline` if LinkedIn/Supabase metadata includes it.

The current Weldoo profile model does not store first name and last name separately. They are used to build the editable display name unless a dedicated profile-name model is added later.

## Fallback Behavior

- If LinkedIn does not return a field, the corresponding Weldoo field remains empty or falls back to the authenticated email prefix.
- Users can edit imported display name, professional headline, profile image URL, role type, location, and organization name before saving onboarding.
- Imported data is persisted only when the user submits onboarding.

## Manual Validation

1. Ensure LinkedIn provider is configured in Supabase.
2. Open `/auth/sign-up`.
3. Click LinkedIn.
4. Complete the LinkedIn OAuth flow.
5. Confirm the app lands on `/onboarding`.
6. Confirm imported LinkedIn data appears in the review panel when available.
7. Edit display name, headline, and profile image URL.
8. Complete onboarding as `Professional / Welder`.
9. Confirm the public/profile UI shows the edited display name, headline, and avatar.
10. Repeat with a LinkedIn account that does not return an image or headline and confirm the form remains usable.

## Security and Privacy Notes

- Do not request or store LinkedIn access tokens unless a future approved API integration requires them.
- Do not assume full work history, skills, certifications, or profile history are available through OpenID Connect.
- Users must be able to review and edit imported data before Weldoo persists it.
- Existing Supabase RLS policies continue to protect profile ownership.
