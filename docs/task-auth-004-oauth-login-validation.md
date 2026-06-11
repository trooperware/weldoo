# WEL-116 - OAuth Login Validation

## Scope

Weldoo supports OAuth login and sign-up through Supabase Auth for:

- Google
- LinkedIn OpenID Connect (`linkedin_oidc`)

Email and password authentication remains unchanged.

## Supabase Configuration

In Supabase Dashboard, configure each environment separately: local, staging, and production.

### Auth URL Configuration

Set the Site URL to the public app URL:

- Local: `http://localhost:3000`
- Staging: the Vercel preview or staging URL
- Production: the production domain

Add these redirect URLs:

- `http://localhost:3000/auth/callback`
- `https://<staging-domain>/auth/callback`
- `https://<production-domain>/auth/callback`

The app uses `NEXT_PUBLIC_APP_URL` to generate OAuth callback URLs. Keep it aligned with the active environment.

### Google Provider

Enable Google in Supabase Auth providers.

Required provider setup:

- Google OAuth client ID
- Google OAuth client secret
- Authorized redirect URI from Supabase provider settings

Weldoo only requires standard profile/email information for login and onboarding prefill.

### LinkedIn Provider

Enable LinkedIn OpenID Connect in Supabase Auth providers.

Use the official LinkedIn developer application flow. Do not scrape LinkedIn pages.

Required provider setup:

- LinkedIn client ID
- LinkedIn client secret
- Authorized redirect URI from Supabase provider settings
- OpenID Connect scopes: `openid profile email`

Do not assume access to work history, skills, certifications, or full profile details unless LinkedIn grants the required official API scopes and the application is approved for them.

## Expected Behavior

1. A user clicks Google or LinkedIn from `/auth/sign-in` or `/auth/sign-up`.
2. Supabase redirects the user to the provider.
3. The provider returns to `/auth/callback`.
4. Weldoo exchanges the OAuth code for a Supabase session.
5. If the user has completed onboarding, Weldoo redirects to the feed `/`.
6. If the user has not completed onboarding, Weldoo redirects to `/onboarding`.
7. Onboarding prefills the display name from official OAuth metadata when available.

## Manual Validation

### Sign In

1. Open `/auth/sign-in`.
2. Click Google.
3. Complete provider authentication.
4. Confirm an existing onboarded user lands on `/`.
5. Repeat with LinkedIn.
6. Confirm email/password sign-in still works.

### Sign Up

1. Open `/auth/sign-up`.
2. Click Google.
3. Complete provider authentication with a new account.
4. Confirm the user lands on `/onboarding`.
5. Confirm display name is prefilled when provider metadata includes a name.
6. Complete onboarding.
7. Confirm the user lands on `/`.
8. Repeat with LinkedIn.

### Error States

1. Disable a provider in Supabase temporarily.
2. Click the corresponding OAuth button.
3. Confirm the user sees a visible OAuth error on the auth page.

## Security Notes

- OAuth starts from server actions.
- Supabase anon key remains the only public Supabase key used by auth clients.
- Service role key is not used by OAuth and must never be exposed to the browser.
- Profile creation and updates still go through existing Supabase RLS policies.
