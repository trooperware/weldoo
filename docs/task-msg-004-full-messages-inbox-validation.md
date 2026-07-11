# MSG-004 - Full Messages Inbox Validation

## Implementation Summary

- Added Phase 2 messages plan and migration risk notes in `docs/task-msg-004-full-messages-inbox-plan.md`.
- Added the Phase 2 Supabase migration for conversations, participants, messages, triggers, and RLS policies.
- Added message query helpers for inbox loading, recipient search, conversation creation/reuse, sending messages, read state updates, and unread message counts.
- Added JSON API routes for recipient search, conversation creation, message replies, and read-state updates.
- Added `/messages` as the full messages inbox, separate from `/contact-requests`.
- Updated the header message icon to open `/messages` and show combined unread contact request plus unread message count.

## Checks Run

- `npm run lint` - passed.
- `npm run build` - passed.

## Browser Validation

Validated in the in-app browser against `http://localhost:3000/messages`.

- Desktop/default viewport:
  - `/messages` route loads with page title `Messages | Weldoo`.
  - The inbox shell renders instead of crashing.
  - Because the active database does not yet have the Phase 2 migration applied, the UI shows a visible migration/server error state.
- Mobile viewport `390x844`:
  - Inbox header, `Messages` title, and `New` compose button render.
  - No horizontal overflow was detected.
  - The compose modal opens and shows recipient search plus message textarea.

## Prototype Alignment Follow-Up

Validated the `/messages` desktop and mobile UI against the prototype messages screen.

- Desktop:
  - Left logged-in profile panel is present.
  - The top `Messages` bar is separate from the inbox card.
  - The compose action is a single round icon button using the edit/compose icon.
  - The conversation search field uses the search icon.
  - Empty detail uses the message icon and the prototype copy.
  - The duplicate text `New message` button in the empty state was removed.
  - Conversation detail actions use round star and more buttons.
  - Message rows use avatar, sender name, time, and plain message text like the prototype.
  - Quick replies use indigo outlined pill buttons.
  - Send uses a round icon button.
- Mobile:
  - `Messages`, search, and the round compose icon are visible.
  - No horizontal overflow was detected.
- Browser console:
  - No errors were reported during the final desktop/mobile audit.

Note: this environment currently has no conversations for the signed-in user, so active conversation controls were reviewed from implementation and are ready to validate visually once a real or test conversation exists.

## Manual Validation After Applying Migration

1. Apply `src/db/migrations/0010_messages_phase2.sql` to the target Supabase environment.
2. Sign in as User A and open `/messages`.
3. Open `New message`, search for User B, select the recipient, write a short message, and send it.
4. Confirm User A sees the conversation with the sent message and the header badge does not count their own sent message as unread.
5. Sign in as User B and confirm the header badge includes the unread message.
6. Open `/messages` as User B and confirm the conversation appears unread, then becomes read after selecting it.
7. Send a quick reply from User B and confirm User A can see it.
8. Use the conversation search to filter by participant name and message text.
9. Repeat the inbox flow on a mobile viewport and confirm list/detail overlay behavior: select a conversation, use `Back`, and send a reply.

## Release Notes

- Database migration and RLS must be applied before enabling the full inbox in an environment.
- Current local browser validation could not exercise a real message thread because the active database schema did not yet include the new Phase 2 message tables.
- Contact requests remain available at `/contact-requests`; this task does not merge the contact request model into the messages model.
