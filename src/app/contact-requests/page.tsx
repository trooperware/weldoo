import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { ContactRequestActions } from "@/components/contact/contact-request-actions";
import { getAppShellAuth, requireCompletedOnboarding } from "@/lib/auth/session";
import {
  getContactRequestsForProfile,
  type ContactRequestListItem,
} from "@/lib/contact/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  description: "Review incoming and outgoing Weldoo contact requests.",
  title: "Messages | Weldoo",
};

type ContactRequestsPageProps = {
  searchParams: Promise<{
    request?: string;
  }>;
};

function formatShortDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getInitial(name: string) {
  return name.slice(0, 1).toUpperCase();
}

function MessageListItem({
  active,
  item,
  mode,
}: {
  active: boolean;
  item: ContactRequestListItem;
  mode: "incoming" | "outgoing";
}) {
  const profile = item.otherProfile;
  const name = profile?.display_name ?? "Weldoo member";
  const unread = mode === "incoming" && !item.read_at && !item.archived_at;

  return (
    <Link
      className={[
        "relative flex items-start gap-3 border-b border-weldoo-border-light px-[18px] py-3.5 transition hover:bg-weldoo-bg-strong",
        active ? "bg-weldoo-indigo/[0.06] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:rounded-r-sm before:bg-weldoo-indigo" : "",
      ].join(" ")}
      href={`/contact-requests?request=${item.id}`}
    >
      <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#3d3db4,#5558e8)] text-base font-bold text-white">
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="h-full w-full object-cover" src={profile.avatar_url} />
        ) : (
          getInitial(name)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-[3px] flex items-baseline justify-between gap-1.5">
          <span
            className={[
              "max-w-40 truncate text-[13.5px] text-weldoo-ink",
              unread ? "font-bold" : "font-semibold",
            ].join(" ")}
          >
            {name}
          </span>
          <span className="shrink-0 text-[11px] text-weldoo-muted">
            {formatShortDate(item.created_at)}
          </span>
        </div>
        <p
          className={[
            "truncate text-[12.5px] leading-[1.4]",
            unread ? "font-semibold text-weldoo-ink" : "text-weldoo-muted",
          ].join(" ")}
        >
          {mode === "incoming" ? item.message : `You: ${item.message}`}
        </p>
      </div>
      {unread ? (
        <span className="ml-auto flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-weldoo-indigo text-[10px] font-bold text-white">
          1
        </span>
      ) : null}
    </Link>
  );
}

function ConversationDetail({
  item,
  mode,
}: {
  item: ContactRequestListItem | undefined;
  mode: "incoming" | "outgoing";
}) {
  if (!item) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-weldoo-muted">
        <svg
          aria-hidden="true"
          className="h-[52px] w-[52px] opacity-20"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
        <p className="max-w-[200px] text-sm leading-[1.6]">
          Select a conversation to start reading
        </p>
      </div>
    );
  }

  const profile = item.otherProfile;
  const name = profile?.display_name ?? "Weldoo member";
  const fromCurrentUser = mode === "outgoing";
  const senderName = fromCurrentUser ? "You" : name;
  const initial = getInitial(senderName);

  return (
    <>
      <div className="flex shrink-0 items-center gap-3 border-b border-weldoo-border-light px-5 py-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#3d3db4,#5558e8)] text-sm font-bold text-white">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="h-full w-full object-cover" src={profile.avatar_url} />
          ) : (
            getInitial(name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold tracking-[-0.1px] text-weldoo-ink">
            {name}
          </h2>
          <p className="truncate text-xs text-weldoo-muted">
            {profile?.headline ?? "Weldoo contact request"}
          </p>
        </div>
        {item.otherProfileHref ? (
          <Link
            className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-weldoo-border-light text-weldoo-muted transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
            href={item.otherProfileHref}
            title="View profile"
          >
            <svg aria-hidden="true" className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </Link>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white px-6 py-5">
        <div className="relative my-4 text-center text-[11px] font-semibold uppercase tracking-[0.07em] text-weldoo-muted before:absolute before:left-0 before:right-0 before:top-1/2 before:h-px before:bg-weldoo-border-light">
          <span className="relative z-10 bg-white px-3">
            {formatShortDate(item.created_at)}
          </span>
        </div>
        <div className="mb-5 flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3d3db4,#5558e8)] text-xs font-bold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-[13.5px] font-bold text-weldoo-ink">
                {senderName}
              </span>
              <span className="text-xs font-normal text-weldoo-muted">
                · {formatFullDate(item.created_at)}
              </span>
            </div>
            <p className="text-sm leading-[1.65] text-weldoo-ink">{item.message}</p>
          </div>
        </div>
        {mode === "incoming" ? (
          <ContactRequestActions
            archived={Boolean(item.archived_at)}
            contactRequestId={item.id}
            read={Boolean(item.read_at)}
          />
        ) : null}
      </div>

      <div className="flex shrink-0 items-end gap-2.5 border-t border-weldoo-border-light px-[18px] py-3.5">
        <textarea
          className="min-h-[76px] flex-1 resize-none rounded-[20px] border-[1.5px] border-weldoo-border-light bg-weldoo-bg-strong px-4 py-2.5 text-[13.5px] leading-[1.45] text-weldoo-muted outline-none"
          disabled
          placeholder="Replies will be available with advanced chat."
          rows={3}
        />
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] opacity-50 shadow-[0_2px_8px_rgba(61,61,180,0.25)]"
          disabled
          type="button"
        >
          <svg aria-hidden="true" className="h-[17px] w-[17px]" fill="none" viewBox="0 0 24 24">
            <line x1="22" x2="11" y1="2" y2="13" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </>
  );
}

export default async function ContactRequestsPage({
  searchParams,
}: ContactRequestsPageProps) {
  const [params, { profile }, appShellAuth] = await Promise.all([
    searchParams,
    requireCompletedOnboarding(),
    getAppShellAuth(),
  ]);
  const supabase = await createSupabaseServerClient();
  const { incoming, outgoing } = await getContactRequestsForProfile(supabase, profile.id);
  const conversations = [
    ...incoming.map((item) => ({ item, mode: "incoming" as const })),
    ...outgoing.map((item) => ({ item, mode: "outgoing" as const })),
  ].sort(
    (a, b) =>
      new Date(b.item.created_at).getTime() - new Date(a.item.created_at).getTime(),
  );
  const selectedConversation =
    conversations.find((conversation) => conversation.item.id === params.request) ??
    conversations[0];

  return (
    <AppShell auth={appShellAuth}>
      <main className="mx-auto grid max-w-[1128px] grid-cols-1 items-start gap-6 px-4 pb-0 pt-7 lg:grid-cols-[225px_minmax(0,1fr)]">
        <aside className="hidden flex-col gap-3 lg:sticky lg:top-20 lg:flex">
          <section className="overflow-hidden rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm">
            <div className="h-16 bg-[linear-gradient(135deg,#2a2a8a_0%,#3d3db4_35%,#42b8d4_70%,#5ce8b4_100%)]" />
            <div className="px-4 pb-4">
              <div className="-mt-[22px] mb-2.5 flex h-12 w-12 items-center justify-center rounded-weldoo-md bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-base font-bold text-white shadow-weldoo-sm">
                {getInitial(appShellAuth?.displayName ?? "W")}
              </div>
              <h2 className="mb-0.5 truncate text-[15px] font-bold tracking-[-0.01em] text-weldoo-ink">
                {appShellAuth?.displayName ?? "Weldoo member"}
              </h2>
              <p className="mb-2.5 text-xs font-normal leading-[1.45] text-weldoo-slate">
                Manage contact requests before advanced chat is implemented.
              </p>
            </div>
          </section>
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-[18px] font-extrabold tracking-[-0.3px] text-weldoo-ink">
              Messages
            </h1>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-weldoo-border-light text-weldoo-muted transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
              title="New message"
              type="button"
            >
              <svg aria-hidden="true" className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
            </button>
          </div>

          <div className="grid h-[calc(100vh-160px)] overflow-hidden rounded-[16px] border border-weldoo-border-light bg-white shadow-weldoo-sm lg:grid-cols-[340px_1fr]">
            <div className="flex min-h-0 flex-col overflow-hidden border-b border-weldoo-border-light lg:border-b-0 lg:border-r">
              <div className="shrink-0 border-b border-weldoo-border-light bg-white px-[18px] pb-3.5 pt-[18px]">
                <div className="flex h-9 items-center gap-2 rounded-full border-[1.5px] border-transparent bg-weldoo-bg-strong px-3.5 transition focus-within:border-weldoo-indigo focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(61,61,180,0.09)]">
                  <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    <line x1="21" x2="16.65" y1="21" y2="16.65" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <input
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-weldoo-ink outline-none placeholder:text-[#b0b0cc]"
                    placeholder="Search messages..."
                    type="search"
                  />
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {conversations.length ? (
                  conversations.map((conversation) => (
                    <MessageListItem
                      active={conversation.item.id === selectedConversation?.item.id}
                      item={conversation.item}
                      key={conversation.item.id}
                      mode={conversation.mode}
                    />
                  ))
                ) : (
                  <div className="p-6 text-sm leading-6 text-weldoo-muted">
                    No contact requests yet.
                  </div>
                )}
              </div>
            </div>
            <div className="flex min-h-0 flex-col overflow-hidden">
              <ConversationDetail
                item={selectedConversation?.item}
                mode={selectedConversation?.mode ?? "incoming"}
              />
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
