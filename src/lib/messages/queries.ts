import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables, TablesInsert } from "@/types/database";

type MessageConversationRow = Tables<"message_conversations">;
type MessageParticipantRow = Tables<"message_conversation_participants">;
type MessageRow = Tables<"messages">;
type ProfileRow = Tables<"profiles">;

export type MessageProfileSummary = Pick<
  ProfileRow,
  "avatar_url" | "display_name" | "headline" | "id" | "profile_type"
>;

export type MessageItem = Pick<
  MessageRow,
  "body" | "conversation_id" | "created_at" | "deleted_at" | "id" | "sender_profile_id"
>;

export type MessageConversationListItem = Pick<
  MessageConversationRow,
  "created_at" | "id" | "last_message_at" | "updated_at"
> & {
  archivedAt: string | null;
  lastMessage: MessageItem | null;
  lastReadAt: string | null;
  messages: MessageItem[];
  otherParticipant: MessageProfileSummary | null;
  participants: MessageProfileSummary[];
  unreadCount: number;
};

export type MessageRecipientSuggestion = MessageProfileSummary & {
  href: string | null;
};

function getUnreadCount(messages: MessageItem[], currentProfileId: string, lastReadAt: string | null) {
  const lastReadTime = lastReadAt ? new Date(lastReadAt).getTime() : 0;

  return messages.filter((message) => {
    if (message.sender_profile_id === currentProfileId) return false;
    if (message.deleted_at) return false;
    return new Date(message.created_at).getTime() > lastReadTime;
  }).length;
}

async function loadProfileMap(
  supabase: SupabaseClient<Database>,
  profileIds: string[],
) {
  if (!profileIds.length) return new Map<string, MessageProfileSummary>();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, headline, avatar_url, profile_type")
    .in("id", [...new Set(profileIds)]);

  if (error) throw new Error(error.message);

  return new Map(
    ((data ?? []) as MessageProfileSummary[]).map((profile) => [profile.id, profile]),
  );
}

export async function getMessagesInbox(
  supabase: SupabaseClient<Database>,
  currentProfileId: string,
) {
  const { data: currentParticipantRows, error: participantError } = await supabase
    .from("message_conversation_participants")
    .select("id, conversation_id, profile_id, last_read_at, archived_at, created_at")
    .eq("profile_id", currentProfileId)
    .order("created_at", { ascending: false });

  if (participantError) throw new Error(participantError.message);

  const currentParticipants = (currentParticipantRows ?? []) as MessageParticipantRow[];
  const conversationIds = currentParticipants.map((participant) => participant.conversation_id);

  if (!conversationIds.length) {
    return [];
  }

  const [conversationsResult, allParticipantsResult, messagesResult] = await Promise.all([
    supabase
      .from("message_conversations")
      .select("id, created_by_profile_id, last_message_at, created_at, updated_at")
      .in("id", conversationIds)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("message_conversation_participants")
      .select("id, conversation_id, profile_id, last_read_at, archived_at, created_at")
      .in("conversation_id", conversationIds),
    supabase
      .from("messages")
      .select("id, conversation_id, sender_profile_id, body, created_at, deleted_at")
      .in("conversation_id", conversationIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
  ]);

  if (conversationsResult.error) throw new Error(conversationsResult.error.message);
  if (allParticipantsResult.error) throw new Error(allParticipantsResult.error.message);
  if (messagesResult.error) throw new Error(messagesResult.error.message);

  const conversations = (conversationsResult.data ?? []) as MessageConversationRow[];
  const allParticipants = (allParticipantsResult.data ?? []) as MessageParticipantRow[];
  const messages = (messagesResult.data ?? []) as MessageItem[];
  const profileMap = await loadProfileMap(
    supabase,
    allParticipants.map((participant) => participant.profile_id),
  );
  const currentParticipantByConversationId = new Map(
    currentParticipants.map((participant) => [participant.conversation_id, participant]),
  );

  return conversations.map<MessageConversationListItem>((conversation) => {
    const participants = allParticipants
      .filter((participant) => participant.conversation_id === conversation.id)
      .map((participant) => profileMap.get(participant.profile_id))
      .filter((profile): profile is MessageProfileSummary => Boolean(profile));
    const threadMessages = messages.filter(
      (message) => message.conversation_id === conversation.id,
    );
    const currentParticipant = currentParticipantByConversationId.get(conversation.id);

    return {
      created_at: conversation.created_at,
      id: conversation.id,
      last_message_at: conversation.last_message_at,
      updated_at: conversation.updated_at,
      archivedAt: currentParticipant?.archived_at ?? null,
      lastMessage: threadMessages.at(-1) ?? null,
      lastReadAt: currentParticipant?.last_read_at ?? null,
      messages: threadMessages,
      otherParticipant:
        participants.find((participant) => participant.id !== currentProfileId) ??
        participants[0] ??
        null,
      participants,
      unreadCount: getUnreadCount(
        threadMessages,
        currentProfileId,
        currentParticipant?.last_read_at ?? null,
      ),
    };
  });
}

export async function getUnreadMessageCount(
  supabase: SupabaseClient<Database>,
  currentProfileId?: string | null,
) {
  if (!currentProfileId) return 0;

  const countResult = await supabase.rpc("get_unread_message_count" as never, {
    target_profile_id: currentProfileId,
  } as never);

  if (!countResult.error) {
    return Number(countResult.data ?? 0);
  }

  const isMissingCountRpc =
    countResult.error.code === "PGRST202" ||
    Boolean(
      countResult.error.message?.includes("schema cache") &&
        countResult.error.message.includes("get_unread_message_count"),
    );

  if (!isMissingCountRpc) return 0;

  const { data: participantRows, error: participantError } = await supabase
    .from("message_conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("profile_id", currentProfileId);

  if (participantError) return 0;

  const participants = (participantRows ?? []) as Pick<
    MessageParticipantRow,
    "conversation_id" | "last_read_at"
  >[];
  const conversationIds = participants.map((participant) => participant.conversation_id);

  if (!conversationIds.length) return 0;

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_profile_id, body, created_at, deleted_at")
    .in("conversation_id", conversationIds)
    .neq("sender_profile_id", currentProfileId)
    .is("deleted_at", null);

  if (messagesError) return 0;

  const lastReadByConversationId = new Map(
    participants.map((participant) => [
      participant.conversation_id,
      participant.last_read_at,
    ]),
  );

  return ((messages ?? []) as MessageItem[]).filter((message) => {
    const lastReadAt = lastReadByConversationId.get(message.conversation_id);
    const lastReadTime = lastReadAt ? new Date(lastReadAt).getTime() : 0;

    return new Date(message.created_at).getTime() > lastReadTime;
  }).length;
}

export async function searchMessageRecipients(
  supabase: SupabaseClient<Database>,
  currentProfileId: string,
  query = "",
) {
  const { data: connectionRows, error: connectionError } = await supabase
    .from("connections")
    .select("requester_profile_id, recipient_profile_id")
    .eq("status", "accepted")
    .or(
      `requester_profile_id.eq.${currentProfileId},recipient_profile_id.eq.${currentProfileId}`,
    );

  if (connectionError) throw new Error(connectionError.message);

  const acceptedProfileIds = [
    ...new Set(
      ((connectionRows ?? []) as Array<{
        recipient_profile_id: string;
        requester_profile_id: string;
      }>).map((connection) =>
        connection.requester_profile_id === currentProfileId
          ? connection.recipient_profile_id
          : connection.requester_profile_id,
      ),
    ),
  ];

  if (!acceptedProfileIds.length) return [];

  const normalizedQuery = query.trim().slice(0, 80);
  let profilesQuery = supabase
    .from("profiles")
    .select("id, display_name, headline, avatar_url, profile_type")
    .in("id", acceptedProfileIds)
    .eq("status", "active")
    .eq("onboarding_completed", true)
    .order("display_name", { ascending: true })
    .limit(8);

  if (normalizedQuery) {
    const like = `%${normalizedQuery.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
    profilesQuery = profilesQuery.or(
      `display_name.ilike.${like},headline.ilike.${like}`,
    );
  }

  const { data, error } = await profilesQuery;

  if (error) throw new Error(error.message);

  return ((data ?? []) as MessageProfileSummary[]).map<MessageRecipientSuggestion>(
    (profile) => ({
      ...profile,
      href:
        profile.profile_type === "professional"
          ? `/professionals/${profile.id}`
          : null,
    }),
  );
}

export async function findDirectConversation(
  supabase: SupabaseClient<Database>,
  currentProfileId: string,
  recipientProfileId: string,
) {
  const { data: currentRows, error: currentError } = await supabase
    .from("message_conversation_participants")
    .select("conversation_id")
    .eq("profile_id", currentProfileId);

  if (currentError) throw new Error(currentError.message);

  const conversationIds = ((currentRows ?? []) as Array<{ conversation_id: string }>).map(
    (row) => row.conversation_id,
  );

  if (!conversationIds.length) return null;

  const { data: recipientRows, error: recipientError } = await supabase
    .from("message_conversation_participants")
    .select("conversation_id")
    .eq("profile_id", recipientProfileId)
    .in("conversation_id", conversationIds)
    .limit(1)
    .maybeSingle();

  if (recipientError) throw new Error(recipientError.message);

  return (recipientRows as { conversation_id: string } | null)?.conversation_id ?? null;
}

export async function createOrReuseConversation(
  supabase: SupabaseClient<Database>,
  currentProfileId: string,
  recipientProfileId: string,
) {
  const existingConversationId = await findDirectConversation(
    supabase,
    currentProfileId,
    recipientProfileId,
  );

  if (existingConversationId) return existingConversationId;

  const { data: conversationData, error: conversationError } = await supabase
    .from("message_conversations")
    .insert([
      {
        created_by_profile_id: currentProfileId,
      } satisfies TablesInsert<"message_conversations">,
    ] as never)
    .select("id")
    .single();

  if (conversationError) throw new Error(conversationError.message);

  const conversation = conversationData as Pick<MessageConversationRow, "id">;
  const { error: participantsError } = await supabase
    .from("message_conversation_participants")
    .insert([
      {
        conversation_id: conversation.id,
        last_read_at: new Date().toISOString(),
        profile_id: currentProfileId,
      },
      {
        conversation_id: conversation.id,
        profile_id: recipientProfileId,
      },
    ] as never);

  if (participantsError) throw new Error(participantsError.message);

  return conversation.id;
}

export async function sendDirectMessage(
  supabase: SupabaseClient<Database>,
  recipientProfileId: string,
  body: string,
) {
  const normalizedBody = body.trim();

  if (normalizedBody.length < 1 || normalizedBody.length > 4000) {
    throw new Error("Message must be between 1 and 4000 characters.");
  }

  const { data, error } = await supabase
    .rpc("send_direct_message" as never, {
      message_body: normalizedBody,
      recipient_profile_id: recipientProfileId,
    } as never)
    .single();

  if (error) throw new Error(error.message);

  const row = data as {
    body: string;
    conversation_id: string;
    created_at: string;
    deleted_at: string | null;
    message_id: string;
    sender_profile_id: string;
  };

  return {
    conversationId: row.conversation_id,
    sentMessage: {
      body: row.body,
      conversation_id: row.conversation_id,
      created_at: row.created_at,
      deleted_at: row.deleted_at,
      id: row.message_id,
      sender_profile_id: row.sender_profile_id,
    } satisfies MessageItem,
  };
}

export async function sendMessage(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  senderProfileId: string,
  body: string,
) {
  const normalizedBody = body.trim();

  if (normalizedBody.length < 1 || normalizedBody.length > 4000) {
    throw new Error("Message must be between 1 and 4000 characters.");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        body: normalizedBody,
        conversation_id: conversationId,
        sender_profile_id: senderProfileId,
      } satisfies TablesInsert<"messages">,
    ] as never)
    .select("id, conversation_id, sender_profile_id, body, created_at, deleted_at")
    .single();

  if (error) throw new Error(error.message);

  await markConversationRead(supabase, conversationId, senderProfileId);

  return data as MessageItem;
}

export async function markConversationRead(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  profileId: string,
) {
  const { error } = await supabase
    .from("message_conversation_participants")
    .update({ last_read_at: new Date().toISOString() } as never)
    .eq("conversation_id", conversationId)
    .eq("profile_id", profileId);

  if (error) throw new Error(error.message);
}
