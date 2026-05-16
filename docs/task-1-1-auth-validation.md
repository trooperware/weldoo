# Task 1.1 Auth Validation

## Scope

Implemented the first Supabase Auth foundation for Weldoo.

## Routes

- `/auth/sign-in`
- `/auth/sign-up`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/callback`
- `/dashboard`

## Implemented

- Sign in with email and password.
- Sign up with email confirmation redirect.
- Forgot password email flow.
- Reset password form for authenticated recovery sessions.
- Sign out action from the protected dashboard placeholder.
- Zod validation for auth forms.
- Field-level validation errors and form-level server errors.
- Protected `/dashboard` route that redirects unauthenticated users to sign in.

## Verification

Automated checks:

```bash
npm run lint
npm run build
```

Browser checks on `http://127.0.0.1:3002`:

- `/auth/sign-in` renders.
- `/auth/sign-up` renders.
- `/auth/forgot-password` renders.
- `/auth/reset-password` redirects to sign in without a recovery session.
- `/dashboard` redirects to `/auth/sign-in?redirectTo=/dashboard` when unauthenticated.
- Empty sign-up submission shows field validation errors.
- Home shell exposes a sign-in link.

## Supabase Setup Needed

Real sign in, sign up, and password reset require `.env.local` values:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The Supabase project must allow the configured redirect URLs.
