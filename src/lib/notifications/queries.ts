import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables, TablesUpdate } from "@/types/database";

export type NotificationDropdownItem = {
  actorAvatarUrl: string | null;
  actorInitials: string | null;
  actorName: string | null;
  body: string | null;
  createdAt: string;
  href: string;
  id: string;
  readAt: string | null;
  title: string;
  type: Tables<"notifications">["type"];
};

export type NotificationDropdownData = {
  items: NotificationDropdownItem[];
  unreadCount: number;
};

type NotificationRow = Pick<
  Tables<"notifications">,
  | "actor_profile_id"
  | "body"
  | "created_at"
  | "id"
  | "read_at"
  | "target_path"
  | "title"
  | "type"
>;

type ActorProfile = Pick<Tables<"profiles">, "avatar_url" | "display_name" | "id">;

function getInitials(name: string | null | undefined) {
  if (!name) return null;

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return null;
  return parts.map((part) => part.slice(0, 1).toUpperCase()).join("");
}

function normalizeTargetPath(path: string | null) {
  if (!path?.startsWith("/")) return "/notifications";
  if (path.startsWith("//")) return "/notifications";
  return path;
}

export function formatNotificationTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export async function getNotificationDropdownData(
  supabase: SupabaseClient<Database>,
  profileId?: string | null,
): Promise<NotificationDropdownData> {
  if (!profileId) return { items: [], unreadCount: 0 };

  const [itemsResult, unreadResult] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, actor_profile_id, type, title, body, target_path, read_at, created_at")
      .eq("recipient_profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_profile_id", profileId)
      .is("read_at", null),
  ]);

  if (itemsResult.error) throw new Error(itemsResult.error.message);
  if (unreadResult.error) throw new Error(unreadResult.error.message);

  const rows = (itemsResult.data ?? []) as NotificationRow[];
  const actorIds = [...new Set(rows.map((row) => row.actor_profile_id).filter(Boolean))] as string[];
  let actorMap = new Map<string, ActorProfile>();

  if (actorIds.length) {
    const { data: actors, error: actorsError } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", actorIds);

    if (actorsError) throw new Error(actorsError.message);
    const actorRows = (actors ?? []) as ActorProfile[];
    actorMap = new Map(actorRows.map((actor) => [actor.id, actor]));
  }

  return {
    items: rows.map((row) => {
      const actor = row.actor_profile_id ? actorMap.get(row.actor_profile_id) ?? null : null;

      return {
        actorAvatarUrl: actor?.avatar_url ?? null,
        actorInitials: getInitials(actor?.display_name),
        actorName: actor?.display_name ?? null,
        body: row.body,
        createdAt: row.created_at,
        href: normalizeTargetPath(row.target_path),
        id: row.id,
        readAt: row.read_at,
        title: row.title,
        type: row.type,
      };
    }),
    unreadCount: unreadResult.count ?? 0,
  };
}

export async function markNotificationRead(
  supabase: SupabaseClient<Database>,
  notificationId: string,
  profileId: string,
) {
  const updatePayload: TablesUpdate<"notifications"> = {
    read_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("notifications")
    .update(updatePayload as never)
    .eq("id", notificationId)
    .eq("recipient_profile_id", profileId)
    .is("read_at", null);

  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(
  supabase: SupabaseClient<Database>,
  profileId: string,
) {
  const updatePayload: TablesUpdate<"notifications"> = {
    read_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("notifications")
    .update(updatePayload as never)
    .eq("recipient_profile_id", profileId)
    .is("read_at", null);

  if (error) throw new Error(error.message);
}
