import type { Metadata } from "next";

import { AppShell } from "@/components/app/app-shell";
import { MessagesInbox } from "@/components/messages/messages-inbox";
import { getAppShellAuth, requireCompletedOnboarding } from "@/lib/auth/session";
import { getMessagesInbox } from "@/lib/messages/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  description: "Read and send Weldoo messages.",
  title: "Messages | Weldoo",
};

type MessagesPageProps = {
  searchParams: Promise<{
    conversation?: string;
  }>;
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const [{ profile }, auth, supabase, resolvedSearchParams] = await Promise.all([
    requireCompletedOnboarding(),
    getAppShellAuth(),
    createSupabaseServerClient(),
    searchParams,
  ]);
  let loadError: string | null = null;
  let conversations: Awaited<ReturnType<typeof getMessagesInbox>> = [];

  try {
    conversations = await getMessagesInbox(supabase, profile.id);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load messages right now.";
  }

  return (
    <AppShell auth={auth}>
      <MessagesInbox
        conversations={conversations}
        currentProfile={{
          avatarUrl: auth?.avatarUrl ?? profile.avatar_url,
          displayName: auth?.displayName ?? profile.display_name ?? "Weldoo member",
          headline: auth?.headline ?? profile.headline,
          profileType: profile.profile_type,
        }}
        currentProfileId={profile.id}
        initialConversationId={resolvedSearchParams.conversation ?? null}
        key={`${resolvedSearchParams.conversation ?? "latest"}:${conversations.map((conversation) => conversation.id).join(",")}`}
        loadError={loadError}
      />
    </AppShell>
  );
}
