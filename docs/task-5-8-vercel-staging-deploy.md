# Task 5.8 - Vercel staging deploy

This document prepares Weldoo for the first shared Vercel deployment.

## Deployment Shape

- Repository root: `weldoo`
- Vercel Root Directory: `app`
- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave default for Next.js
- Runtime: Vercel-managed Node.js runtime

The app is a standard Next.js App Router project inside the `app/` folder. Do not deploy from the repository root unless Vercel is configured with `app` as the root directory.

## Required Vercel Environment Variables

Add these variables in Vercel Project Settings -> Environment Variables.

```text
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Optional for later server-only admin/background tasks:

```text
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in client components. It must remain server-only.

## Supabase Auth URL Configuration

In Supabase, open Authentication -> URL Configuration.

Set Site URL:

```text
https://your-vercel-domain.vercel.app
```

Add Redirect URLs:

```text
https://your-vercel-domain.vercel.app/**
https://*.vercel.app/**
http://localhost:3000/**
http://127.0.0.1:3002/**
```

Notes:

- The app sends explicit `emailRedirectTo` values for sign-up confirmation and password reset.
- Supabase requires those redirect URLs to be allow-listed.
- The wildcard Vercel URL is useful for preview deployments, but production should still have the exact production URL.

## Supabase Database and Storage

Apply migrations in this order before testing the deployed app:

1. `src/db/migrations/0001_initial_schema.sql`
2. `src/db/migrations/0002_row_level_security.sql`
3. `src/db/migrations/0003_profile_media_storage.sql`
4. `src/db/migrations/0004_feed_media_storage.sql`

Storage buckets created by migrations:

- `avatars`
- `covers`
- `post-images`

All three buckets are public-read and authenticated-user write restricted by user folder.

Optional demo data:

1. `src/db/seeds/0001_demo_jobs.sql`
2. `src/db/seeds/0002_demo_academy.sql`
3. `src/db/seeds/0003_demo_events.sql`

Seeds require at least one relevant owner profile:

- Jobs require a company profile.
- Academy/events require a training provider profile.

## Pre-Deploy Local Checks

Run from `app/`:

```bash
npm install
npm run lint
npm run build
```

The production health route `/api/dev/health` intentionally returns 404 in production.

## Vercel Deployment Steps

1. Push the current repository to GitHub/GitLab/Bitbucket.
2. In Vercel, create a new project from the repository.
3. Set Root Directory to `app`.
4. Confirm Framework Preset is `Next.js`.
5. Add the required environment variables.
6. Deploy.
7. Copy the generated Vercel URL.
8. Set `NEXT_PUBLIC_APP_URL` in Vercel to that URL.
9. Add the same URL to Supabase Auth Site URL and Redirect URLs.
10. Redeploy after changing environment variables.

## Post-Deploy Smoke Test

Use the deployed URL and test:

1. Home/feed loads without server error.
2. Sign up with a new email.
3. Email confirmation redirects to `/auth/callback?next=/onboarding`.
4. Onboarding can be completed.
5. Sign in redirects completed users to `/`.
6. Profile edit saves data.
7. Avatar and cover uploads work.
8. Feed post creation works.
9. Feed image upload works.
10. Network page loads and excludes the logged-in profile.
11. Contact request flow works.
12. Jobs listing loads demo/real data.
13. Save job and saved jobs page work.
14. Job application flow works.
15. Academy listing and detail load.
16. Course/event interest registration works.
17. Events listing loads `sector_event` items.
18. Event detail loads both in-person and virtual events.
19. Training provider Academy management works for provider users.
20. Sign out works.

## Known Staging Limitations

- OAuth buttons are visual only until the OAuth sprint is implemented.
- Integrated live video is not part of Phase 1.
- Advanced real-time notifications are not part of Phase 1.
- Admin area is planned for Sprint 6 and is not required for the first staging deploy.

## Official References

- Vercel project settings: https://vercel.com/docs/project-configuration/project-settings
- Vercel Next.js deployments: https://vercel.com/docs/concepts/next.js/overview
- Supabase redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
