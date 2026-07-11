import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Enums, TablesInsert } from "@/types/database";

type NotificationEventType = Enums<"notification_type">;

type NotificationEventInput = {
  actorProfileId?: string | null;
  body?: string | null;
  recipientProfileId: string;
  subject?: string | null;
  targetPath?: string | null;
  type: NotificationEventType;
};

const fallbackActorName = "A Weldoo member";

function normalizeTargetPath(path: string | null | undefined) {
  if (!path?.startsWith("/") || path.startsWith("//")) return "/notifications";
  return path;
}

function formatNotificationTitle(
  type: NotificationEventType,
  actorName: string,
  subject?: string | null,
) {
  if (type === "connection_request") return `${actorName} wants to connect`;
  if (type === "connection_accepted") {
    return `${actorName} accepted your connection request`;
  }
  if (type === "contact_request") return `${actorName} sent you a contact request`;
  if (type === "post_like") return `${actorName} liked your post`;
  if (type === "post_comment") return `${actorName} commented on your post`;
  if (type === "job_application") {
    return `${actorName} applied to ${subject ? `"${subject}"` : "your job"}`;
  }
  if (type === "course_event_interest") {
    return `${actorName} is interested in ${
      subject ? `"${subject}"` : "your course"
    }`;
  }

  return "New notification";
}

async function getActorName(actorProfileId: string | null | undefined) {
  if (!actorProfileId) return fallbackActorName;

  const adminSupabase = createSupabaseAdminClient();
  const { data, error } = await adminSupabase
    .from("profiles")
    .select("display_name")
    .eq("id", actorProfileId)
    .maybeSingle();

  if (error) throw error;

  return (data as { display_name?: string } | null)?.display_name ?? fallbackActorName;
}

export async function publishNotificationEvent(input: NotificationEventInput) {
  try {
    if (input.actorProfileId && input.actorProfileId === input.recipientProfileId) {
      return;
    }

    const actorName = await getActorName(input.actorProfileId);
    const notificationPayload: TablesInsert<"notifications"> = {
      actor_profile_id: input.actorProfileId ?? null,
      body: input.body ?? null,
      recipient_profile_id: input.recipientProfileId,
      target_path: normalizeTargetPath(input.targetPath),
      title: formatNotificationTitle(input.type, actorName, input.subject),
      type: input.type,
    };

    const adminSupabase = createSupabaseAdminClient();
    const { error } = await adminSupabase
      .from("notifications")
      .insert([notificationPayload] as never);

    if (error) throw error;
  } catch (error) {
    console.error("Could not publish notification event", {
      error,
      recipientProfileId: input.recipientProfileId,
      type: input.type,
    });
  }
}
