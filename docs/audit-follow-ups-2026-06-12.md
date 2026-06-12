# Audit Follow-ups - 2026-06-12

This document tracks non-blocking actions from `docs/audit-2026-06-12.md` that should be scheduled after the blocking security and high-impact performance fixes.

## Planned Technical Debt

### Feed cursor pagination

- **Priority**: Medium
- **Reason**: The feed currently uses page/range pagination. This is acceptable for MVP validation but will degrade as posts grow.
- **Recommended task**: Replace page/range pagination with cursor-based pagination using `created_at` plus `id` as the stable cursor.
- **Suggested Jira**: `FEED - Cursor-based feed pagination`

### Supabase write payload typing cleanup

- **Priority**: Medium
- **Reason**: API routes use `as never` / `as never[]` as a Supabase typing workaround. Runtime behavior is not affected, but payload type safety is weakened.
- **Recommended task**: Regenerate database types and replace write payload casts with typed insert/update helpers once the Supabase client types are stable enough.
- **Suggested Jira**: `FND - Remove Supabase write payload escape casts`

### Minimum automated test baseline

- **Priority**: Low for MVP, high before broad release
- **Reason**: Manual validation docs exist, but critical auth/feed behavior is not covered by automated tests.
- **Recommended task**: Add Vitest integration tests for auth redirects, onboarding completion, create post, comment, like/save, and connection request status transitions.
- **Suggested Jira**: `FND - Automated test baseline for auth and feed`

### Full comment pagination

- **Priority**: Medium
- **Reason**: The feed now loads bounded comment previews and exact counts, but there is no dedicated "load all comments" flow.
- **Recommended task**: Add `GET /api/feed/posts/[postId]/comments` with cursor pagination and a UI action to load the full thread.
- **Suggested Jira**: `FEED - Paginated comment thread loading`
