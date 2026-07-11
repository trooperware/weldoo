import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { ContactRequestActions } from "@/components/contact/contact-request-actions";
import { Badge } from "@/components/ui";
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

type ConversationMode = "incoming" | "outgoing";
type Conversation = {
  item: ContactRequestListItem;
  mode: ConversationMode;
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
  return name.trim().slice(0, 1).toUpperCase() || "W";
}

function getRequestState(item: ContactRequestListItem, mode: ConversationMode) {
  if (item.archived_at) return "Archived";
  if (mode === "outgoing") return "Sent";
  if (!item.read_at) return "New";
  return "Reviewed";
}

function MessageIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg aria-hidden="true" className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg aria-hidden="true" className="h-[17px] w-[17px]" fill="none" viewBox="0 0 24 24">
      <line x1="22" x2="11" y1="2" y2="13" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function MessageListItem({
  active,
  item,
  mode,
}: {
  active: boolean;
  item: ContactRequestListItem;
  mode: ConversationMode;
}) {
  const profile = item.otherProfile;
  const name = profile?.display_name ?? "Weldoo member";
  const unread = mode === "incoming" && !item.read_at && !item.archived_at;
  const state = getRequestState(item, mode);

  return (
    <Link
      className={[
        "relative flex items-start gap-3 border-b border-weldoo-border-light px-4 py-3.5 transition hover:bg-weldoo-bg-strong sm:px-[18px]",
        active
          ? "bg-weldoo-indigo/[0.06] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:rounded-r-sm before:bg-weldoo-indigo"
          : "",
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
        <div className="mb-[3px] flex items-baseline justify-between gap-2">
          <span
            className={[
              "min-w-0 truncate text-[13.5px] text-weldoo-ink",
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
        <div className="mt-2 flex items-center gap-2">
          <span
            className={[
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em]",
              unread
                ? "bg-weldoo-indigo/[0.08] text-weldoo-indigo"
                : item.archived_at
                  ? "bg-weldoo-bg-strong text-weldoo-muted"
                  : "bg-emerald-50 text-emerald-700",
            ].join(" ")}
          >
            {state}
          </span>
        </div>
      </div>
      {unread ? (
        <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-weldoo-indigo text-[10px] font-bold text-white">
          1
        </span>
      ) : null}
    </Link>
  );
}

function EmptyConversationList() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-weldoo-bg-strong text-weldoo-muted">
        <div className="h-6 w-6">
          <MessageIcon />
        </div>
      </div>
      <h2 className="text-sm font-bold text-weldoo-ink">No contact requests yet</h2>
      <p className="mt-1 max-w-[260px] text-sm leading-6 text-weldoo-muted">
        Requests from profiles and Network cards will appear here.
      </p>
      <Link
        className="mt-4 inline-flex h-9 items-center justify-center rounded-full bg-weldoo-indigo px-4 text-[13px] font-bold text-white shadow-weldoo-sm transition hover:brightness-105"
        href="/network"
      >
        Browse Network
      </Link>
    </div>
  );
}

function EmptyConversationDetail() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-weldoo-muted">
      <div className="h-[52px] w-[52px] opacity-20">
        <MessageIcon />
      </div>
      <p className="max-w-[220px] text-sm leading-[1.6]">
        Select a contact request to review the message.
      </p>
    </div>
  );
}

function ConversationDetail({
  item,
  mode,
  showBackLink,
}: {
  item: ContactRequestListItem | undefined;
  mode: ConversationMode;
  showBackLink: boolean;
}) {
  if (!item) {
    return <EmptyConversationDetail />;
  }

  const profile = item.otherProfile;
  const name = profile?.display_name ?? "Weldoo member";
  const fromCurrentUser = mode === "outgoing";
  const senderName = fromCurrentUser ? "You" : name;
  const initial = getInitial(senderName);
  const requestState = getRequestState(item, mode);

  return (
    <>
      <div className="flex shrink-0 items-center gap-3 border-b border-weldoo-border-light px-4 py-3.5 sm:px-5">
        {showBackLink ? (
          <Link
            className="inline-flex h-8 items-center justify-center rounded-full border border-weldoo-border-light px-3 text-[12px] font-bold text-weldoo-slate transition hover:border-weldoo-indigo hover:text-weldoo-indigo lg:hidden"
            href="/contact-requests"
          >
            Back
          </Link>
        ) : null}
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
        <Badge variant={requestState === "New" ? "info" : requestState === "Archived" ? "neutral" : "success"}>
          {requestState}
        </Badge>
        {item.otherProfileHref ? (
          <Link
            className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-weldoo-border-light text-weldoo-muted transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
            href={item.otherProfileHref}
            title="View profile"
          >
            <ProfileIcon />
          </Link>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white px-4 py-5 sm:px-6">
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
            <div className="mb-1 flex flex-wrap items-baseline gap-2">
              <span className="text-[13.5px] font-bold text-weldoo-ink">
                {senderName}
              </span>
              <span className="text-xs font-normal text-weldoo-muted">
                · {formatFullDate(item.created_at)}
              </span>
            </div>
            <div className="rounded-[18px] rounded-tl-sm bg-weldoo-bg-strong px-4 py-3 text-sm leading-[1.65] text-weldoo-ink">
              {item.message}
            </div>
          </div>
        </div>
        {mode === "incoming" ? (
          <ContactRequestActions
            archived={Boolean(item.archived_at)}
            contactRequestId={item.id}
            read={Boolean(item.read_at)}
          />
        ) : (
          <div className="mt-4 rounded-[14px] border border-weldoo-border-light bg-weldoo-bg-strong px-4 py-3 text-sm leading-6 text-weldoo-muted">
            This request is waiting for the recipient to review it.
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-end gap-2.5 border-t border-weldoo-border-light px-4 py-3.5 sm:px-[18px]">
        <textarea
          className="min-h-[72px] flex-1 resize-none rounded-[20px] border-[1.5px] border-weldoo-border-light bg-weldoo-bg-strong px-4 py-2.5 text-[13.5px] leading-[1.45] text-weldoo-muted outline-none"
          disabled
          placeholder="Replies will be available with advanced chat."
          rows={3}
        />
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] opacity-50 shadow-[0_2px_8px_rgba(61,61,180,0.25)]"
          disabled
          type="button"
        >
          <SendIcon />
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
  const conversations: Conversation[] = [
    ...incoming.map((item) => ({ item, mode: "incoming" as const })),
    ...outgoing.map((item) => ({ item, mode: "outgoing" as const })),
  ].sort(
    (a, b) =>
      new Date(b.item.created_at).getTime() - new Date(a.item.created_at).getTime(),
  );
  const requestedConversation = conversations.find(
    (conversation) => conversation.item.id === params.request,
  );
  const selectedConversation = requestedConversation ?? conversations[0];
  const unreadCount = incoming.filter((item) => !item.read_at && !item.archived_at).length;
  const archivedCount = conversations.filter((conversation) =>
    Boolean(conversation.item.archived_at),
  ).length;

  return (
    <AppShell auth={appShellAuth}>
      <main className="mx-auto grid max-w-[1128px] grid-cols-1 items-start gap-6 px-4 pb-6 pt-7 lg:grid-cols-[225px_minmax(0,1fr)]">
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
              <p className="mb-3 text-xs font-normal leading-[1.45] text-weldoo-slate">
                Review contact requests before advanced chat is implemented.
              </p>
              <div className="grid grid-cols-2 gap-2 border-t border-weldoo-border-light pt-3 text-center">
                <div>
                  <p className="text-base font-extrabold text-weldoo-ink">{unreadCount}</p>
                  <p className="text-[11px] font-semibold text-weldoo-muted">New</p>
                </div>
                <div>
                  <p className="text-base font-extrabold text-weldoo-ink">{archivedCount}</p>
                  <p className="text-[11px] font-semibold text-weldoo-muted">Archived</p>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.3px] text-weldoo-ink">
                Messages
              </h1>
              <p className="mt-1 text-sm text-weldoo-muted">
                Contact requests from profiles and Network.
              </p>
            </div>
            <Link
              className="inline-flex h-9 items-center justify-center rounded-full border-[1.5px] border-weldoo-border-light bg-white px-4 text-[13px] font-bold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
              href="/network"
            >
              Browse Network
            </Link>
          </div>

          <div className="grid min-h-[calc(100vh-180px)] overflow-hidden rounded-[16px] border border-weldoo-border-light bg-white shadow-weldoo-sm lg:h-[calc(100vh-160px)] lg:grid-cols-[340px_1fr]">
            <div
              className={[
                "min-h-0 flex-col overflow-hidden border-weldoo-border-light lg:flex lg:border-r",
                requestedConversation ? "hidden lg:flex" : "flex",
              ].join(" ")}
            >
              <div className="shrink-0 border-b border-weldoo-border-light bg-white px-4 pb-3.5 pt-[18px] sm:px-[18px]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-weldoo-muted">
                      Inbox
                    </p>
                    <p className="text-sm font-semibold text-weldoo-ink">
                      {conversations.length} request{conversations.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  {unreadCount ? (
                    <span className="rounded-full bg-weldoo-indigo px-2.5 py-1 text-[11px] font-bold text-white">
                      {unreadCount} new
                    </span>
                  ) : null}
                </div>
                <div className="flex h-9 items-center gap-2 rounded-full border-[1.5px] border-transparent bg-weldoo-bg-strong px-3.5 transition focus-within:border-weldoo-indigo focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(61,61,180,0.09)]">
                  <SearchIcon />
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
                  <EmptyConversationList />
                )}
              </div>
            </div>
            <div
              className={[
                "min-h-0 flex-col overflow-hidden",
                requestedConversation ? "flex" : "hidden lg:flex",
              ].join(" ")}
            >
              <ConversationDetail
                item={selectedConversation?.item}
                mode={selectedConversation?.mode ?? "incoming"}
                showBackLink={Boolean(requestedConversation)}
              />
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
