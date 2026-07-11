-- NOTIF-002: recipients can mark notifications as read without being able to
-- edit notification content, type, target, or ownership from the client.

revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;
