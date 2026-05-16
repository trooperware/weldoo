# Weldoo App

Weldoo is a responsive web app for a vertical professional network for welders,
industrial companies, and training providers.

This project is the production-oriented Next.js foundation. Product features
should be implemented sprint by sprint using the documents in `docs/`.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint
- `src/` project structure

Planned integrations:

- Supabase for Postgres, Auth, Storage, and RLS
- OpenAI API for assistive product features
- Resend for transactional email
- Sentry and PostHog for production observability

## Local Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Run checks:

```bash
npm run lint
npm run build
```

## Important Note

The scaffold was created with `create-next-app`, but dependency installation
may require network access to npm. If `npm install` fails because the registry
is unavailable, retry once network access is available.

## Project Structure

```text
src/
  app/                  App Router routes and layouts
  components/
    ui/                 Shared UI primitives
    feed/               Feed-specific components
    profiles/           Profile-specific components
    jobs/               Job-specific components
    academy/            Academy/event components
  lib/
    auth/               Auth helpers
    permissions/        Authorization helpers
    supabase/           Supabase clients
    validators/         Zod schemas and form validators
  server/
    actions/            Server actions
    mutations/          Data mutations
    queries/            Data queries
  db/
    migrations/         SQL migrations
  types/                Shared TypeScript types
```

## Sprint 0 Checklist

1. Confirm stack and environment variables.
2. Extract design tokens from the prototype.
3. Create base UI components.
4. Design the initial Supabase schema.
5. Add Supabase client/server utilities.
6. Add RLS policies.
7. Validate the app shell on desktop and mobile.

## Documentation

The `docs/` folder contains:

- Functional MVP specification.
- Effort estimate.
- Codex task plan.
- Validation units.

