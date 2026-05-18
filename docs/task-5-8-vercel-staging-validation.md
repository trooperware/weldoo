# Task 5.8 - Vercel staging validation

Task 5.8 prepares the first shared deployment.

## Acceptance Criteria

- Vercel can build the app from the `app` root directory.
- Required Supabase environment variables are documented.
- Supabase Auth callback URLs are documented for local, preview, and staging deployments.
- Storage bucket requirements are documented.
- A post-deploy smoke test is available.
- No secrets are committed to the repository.

## Manual Validation

1. Run `npm run lint`.
2. Run `npm run build`.
3. Confirm `.env.local` is not committed.
4. Create a Vercel project with Root Directory `app`.
5. Add Vercel environment variables.
6. Configure Supabase Auth URL Configuration.
7. Deploy.
8. Run the smoke test in `task-5-8-vercel-staging-deploy.md`.

## Expected Result

The staging deployment is shareable with external reviewers and supports the core Phase 1 flows already implemented.
