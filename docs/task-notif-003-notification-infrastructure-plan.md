# NOTIF-003 - Notification Infrastructure Plan

## Scope

NOTIF-003 introduces the application-side notification infrastructure for Phase 2 without adding email, push, or real-time delivery. The current Supabase `notifications` table remains the durable in-app inbox and read/unread source of truth.

## Events

Initial event coverage uses existing Phase 1 and Phase 2 user actions:

- `connection_request`: a member sends a network connection request.
- `connection_accepted`: a recipient accepts a network or contact-request connection.
- `contact_request`: a member sends a contact request with a short message.
- `post_like`: a member likes another member's post.
- `post_comment`: a member comments on another member's post.
- `job_application`: a professional applies to a company job.
- `course_event_interest`: a member registers interest in a training provider course or event.

Self-notifications are skipped.

## Creation Strategy

For the MVP, API routes emit notifications after the primary write succeeds. Notification failures are logged and do not roll back the business action. This keeps the user flow resilient while still persisting activity in Supabase.

The infrastructure is centralized in one notification service so the later Phase 2 implementation can replace direct inserts with background jobs or database/webhook workers without touching every route again.

## Read/Unread State

Unread state remains `read_at is null`. The existing dropdown and `/notifications` page query by `recipient_profile_id`, sort by `created_at desc`, and mark one or all notifications as read.

## Delivery Channels

Implemented now:

- In-app notification rows in Supabase.
- Header unread badge and dropdown/page display from existing NOTIF-002 work.

Explicitly out of scope for this task:

- Email notifications.
- Push notifications.
- Digest generation.
- Real-time subscriptions or websocket/SSE updates.

## Future Real-Time Support

The event service is the future integration point for:

- Queue-backed creation for high-volume events.
- Realtime Supabase channel broadcasts after insert.
- Deduplication windows for noisy events such as likes.
- User-level notification preferences and muting.

## Dependencies

- Existing `notifications` table and RLS from FND-002/NOTIF-002.
- Existing network, contact request, feed, jobs, and academy data models.
- EVT data model is treated as a future event-stream layer; this task does not create an event-log table.

## Migration And Release Risks

- No schema migration is required for the MVP infrastructure.
- Current `notification_type` enum already covers all initial in-app events.
- Direct API-route inserts can duplicate historical actions if a route retries after a partial response. High-volume deduplication should be added before enabling background retries.
- Notification creation uses service-role writes so RLS remains focused on recipient reads/updates. The service must only be called from server-side code.

## Manual Validation

1. Sign in with two test users.
2. From user A, send a connection request to user B and confirm user B sees a new unread notification.
3. From user B, accept the connection and confirm user A sees a `connection_accepted` notification.
4. From user A, send a contact request to user B and confirm user B sees it in notifications.
5. Like and comment on user B's post as user A and confirm user B receives feed notifications.
6. Apply to a company job and confirm the company owner receives a job application notification.
7. Register interest in a course/event and confirm the training provider owner receives an interest notification.
8. Mark one notification and then all notifications as read; confirm the unread badge updates.
