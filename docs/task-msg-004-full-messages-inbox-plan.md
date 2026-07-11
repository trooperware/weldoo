# MSG-004 Full Messages Inbox Implementation Plan

MSG-004 is Phase 2 scope. It adds first-class messaging and must stay separate from the Phase 1 contact request flow.

## Scope

- Add a proper conversations/messages data model.
- Add RLS policies for conversation participants.
- Add a full Messages inbox UI based on the latest prototype direction.
- Support conversation search, thread selection, read state, quick replies, send message, and compose new message modal.
- Keep contact requests available at `/contact-requests` and do not reuse `contact_requests` as message storage.

## Data Model

Add these tables:

- `message_conversations`
  - `id`
  - `created_by_profile_id`
  - `created_at`
  - `updated_at`
  - `last_message_at`

- `message_conversation_participants`
  - `id`
  - `conversation_id`
  - `profile_id`
  - `last_read_at`
  - `archived_at`
  - `created_at`
  - unique `(conversation_id, profile_id)`

- `messages`
  - `id`
  - `conversation_id`
  - `sender_profile_id`
  - `body`
  - `created_at`
  - `edited_at`
  - `deleted_at`

Indexes:

- participants by profile and conversation.
- messages by conversation and creation time.
- conversations by `last_message_at`.

## RLS Plan

- Only active profiles can create conversations.
- A profile can select a conversation only when it is a participant.
- A profile can select participants only for conversations it participates in.
- A profile can insert a message only into a conversation it participates in.
- A sender can edit/delete only their own messages.
- Participants can update their own participant row for read/archive state.
- Admin policy follows existing `current_profile_is_admin()` conventions.

## API Plan

- `GET /api/messages/conversations`
  - query list/details through server-side lib functions.
- `POST /api/messages/conversations`
  - create or reuse a 1:1 conversation and optionally create the first message.
- `POST /api/messages/conversations/[conversationId]/messages`
  - append a message and update `last_message_at`.
- `PATCH /api/messages/conversations/[conversationId]/read`
  - mark participant as read.

## UI Plan

- Use `/messages` for the Phase 2 inbox.
- Keep `/contact-requests` for basic contact request inbox.
- Header message icon can point to `/messages` once Phase 2 is active.
- Desktop layout:
  - left conversation list and search.
  - right thread panel.
  - quick replies and composer.
  - compose modal.
- Mobile layout:
  - list-first.
  - selected conversation as a focused overlay/panel with a back action.

## Migration Risks

- Existing environments need the new migration applied before `/messages` is enabled.
- RLS must be tested with two non-admin users to avoid leaking conversation membership.
- Creating/using a 1:1 conversation should avoid duplicates at the application layer; a strict DB uniqueness constraint for unordered participant pairs is deferred unless needed.
- Full notifications integration is not included in this task. The initial unread count can remain based on unread contact requests until a later notification/message badge task expands it.

## Delivery Cut

1. Add schema and RLS migration.
2. Add TypeScript database types.
3. Add server-side message queries/actions.
4. Add `/messages` route and UI.
5. Keep `/contact-requests` unchanged except for navigation links if needed.
6. Document validation steps and run lint/build.
