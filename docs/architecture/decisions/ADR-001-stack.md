# ADR-001: Initial Technology Stack

**Date**: 2026-06-12
**Status**: Accepted
**Authors**: Codex implementation + Claude Code review

## Context

Weldoo is a vertical professional network for welders. The MVP must move quickly, but the architecture must remain credible for a future target of 100k+ active users.

The product needs authentication, onboarding, public profiles, feed interactions, jobs, academy/events, media uploads, and future notification/messaging capabilities.

## Decision

Initial stack:

- **Application**: Next.js App Router, React, TypeScript
- **Styling**: Tailwind CSS with Weldoo UI primitives
- **Backend**: Next.js Route Handlers and Server Components
- **Database/Auth/Storage**: Supabase Postgres, Supabase Auth, Supabase Storage
- **Deployment**: Vercel
- **Repository**: GitHub
- **Planning**: Jira project `WEL`

## Positive Consequences

- Full-stack MVP in a single repository.
- Server Components reduce client JavaScript for data-heavy pages.
- Supabase provides fast setup for auth, Postgres, RLS, and object storage.
- Vercel gives simple preview/production deployments.
- TypeScript and App Router boundaries support gradual hardening sprint by sprint.

## Negative Consequences / Risks

- Supabase may become the first bottleneck if feed, search, notifications, and media workloads grow without dedicated architecture.
- Offset pagination is acceptable for MVP but should be replaced with cursor-based pagination for high-volume feeds and discovery pages.
- Real-time notifications and chat will need a dedicated design: queues, WebSocket/SSE service, or managed real-time infrastructure.
- Global users may experience database latency if everything depends on one primary region.
- At higher scale, backend services may need to split from the Next.js app into dedicated workers/APIs.

## Alternatives Considered

- **Separate React SPA + standalone API**: deferred to avoid operational complexity during MVP.
- **Remix**: not selected because the current codebase and team workflow are already aligned with Next.js.
- **Custom Postgres + custom auth from day one**: deferred because Supabase accelerates validation, but should be revisited before major scale.

## Review Trigger

Review this decision when one of these happens:

- Weldoo exceeds 10,000 daily active users
- Feed/search latency becomes product-visible
- Real-time messaging or notification infrastructure enters Phase 1 scope
- Supabase costs, RLS performance, or regional latency become limiting factors
