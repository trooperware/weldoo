"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AutoDismissNotice } from "@/components/ui/auto-dismiss-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import type {
  MessageConversationListItem,
  MessageItem,
  MessageRecipientSuggestion,
} from "@/lib/messages/queries";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type MessagesInboxProps = {
  conversations: MessageConversationListItem[];
  currentProfile: {
    avatarUrl?: string | null;
    displayName: string;
    headline?: string | null;
    profileType?: string | null;
  };
  currentProfileId: string;
  initialConversationId?: string | null;
  loadError?: string | null;
};

const quickReplies = [
  "Sounds good!",
  "Let me check my calendar",
  "Thanks for reaching out",
];

function formatShortDate(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  return new Intl.DateTimeFormat("en", sameDay
    ? { hour: "2-digit", minute: "2-digit" }
    : { day: "numeric", month: "short" }).format(date);
}

function getMessageDayKey(value: string) {
  const date = new Date(value);

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatMessageDay(value: string) {
  const date = new Date(value);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  }).format(date);
}

function getInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "W";
}

function Avatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  src?: string | null;
}) {
  const sizeClass =
    size === "lg" ? "h-11 w-11 text-base" : size === "sm" ? "h-9 w-9 text-sm" : "h-10 w-10 text-sm";

  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#3d3db4,#5558e8)] font-bold text-white",
        sizeClass,
      ].join(" ")}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="h-full w-full object-cover" src={src} />
      ) : (
        getInitial(name)
      )}
    </div>
  );
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

type MessageApiPayload = {
  conversationId?: string;
  message?: string;
  sentMessage?: MessageItem;
  status?: string;
};

type MessagesInboxPayload = {
  conversations?: MessageConversationListItem[];
  status?: string;
};

async function readMessageApiPayload(response: Response): Promise<MessageApiPayload> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return {
      message:
        response.status >= 500
          ? "Supabase is not responding right now. Please try again in a few minutes."
          : "Unable to send the message.",
      status: "error",
    };
  }

  try {
    const payload = (await response.json()) as MessageApiPayload;
    const message = payload.message ?? "";

    if (message.includes("<!DOCTYPE html>") || message.includes("Connection timed out")) {
      return {
        ...payload,
        message:
          "Supabase is not responding right now. Please try again in a few minutes.",
        status: "error",
      };
    }

    return payload;
  } catch {
    return {
      message: "Unable to read the server response. Please try again.",
      status: "error",
    };
  }
}

function ComposeIcon() {
  return (
    <svg aria-hidden="true" className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-[15px] w-[15px] shrink-0 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg aria-hidden="true" className="h-12 w-12" fill="none" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg aria-hidden="true" className="h-[17px] w-[17px]" fill="none" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg aria-hidden="true" className="h-[17px] w-[17px]" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <line x1="22" x2="11" y1="2" y2="13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export function MessagesInbox({
  conversations,
  currentProfile,
  currentProfileId,
  initialConversationId,
  loadError,
}: MessagesInboxProps) {
  const router = useRouter();
  const [conversationItems, setConversationItems] = useState(conversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversationId ?? conversations[0]?.id ?? null,
  );
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [recipientQuery, setRecipientQuery] = useState("");
  const [recipientSuggestions, setRecipientSuggestions] = useState<MessageRecipientSuggestion[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<MessageRecipientSuggestion | null>(null);
  const [composeBody, setComposeBody] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const refreshTimerRef = useRef<number | null>(null);
  const lastAutoScrollTargetRef = useRef<string | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement | null>(null);

  const refreshConversations = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/messages/conversations", {
        cache: "no-store",
        signal,
      });

      if (!response.ok) return;

      const payload = (await response.json()) as MessagesInboxPayload;

      if (payload.status !== "success" || !payload.conversations) return;

      setConversationItems(payload.conversations);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }, []);

  const scheduleRefreshConversations = useCallback(() => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
    }

    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = null;
      void refreshConversations();
    }, 160);
  }, [refreshConversations]);

  useEffect(() => {
    const controller = new AbortController();

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        void refreshConversations(controller.signal);
      }
    }

    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);

    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [refreshConversations]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`messages-inbox:${currentProfileId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        scheduleRefreshConversations,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          filter: `profile_id=eq.${currentProfileId}`,
          schema: "public",
          table: "message_conversation_participants",
        },
        scheduleRefreshConversations,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_conversations",
        },
        scheduleRefreshConversations,
      )
      .subscribe();

    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      void supabase.removeChannel(channel);
    };
  }, [currentProfileId, scheduleRefreshConversations]);

  useEffect(() => {
    if (!activeConversationId) return;

    const activeConversation = conversationItems.find(
      (conversation) => conversation.id === activeConversationId,
    );

    if (!activeConversation || activeConversation.unreadCount === 0) return;

    let cancelled = false;

    async function markRead() {
      await fetch(`/api/messages/conversations/${activeConversationId}/read`, {
        method: "PATCH",
      });

      if (cancelled) return;

      setConversationItems((items) =>
        items.map((item) =>
          item.id === activeConversationId
            ? { ...item, lastReadAt: new Date().toISOString(), unreadCount: 0 }
            : item,
        ),
      );
    }

    void markRead();

    return () => {
      cancelled = true;
    };
  }, [activeConversationId, conversationItems]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/messages/recipients?q=${encodeURIComponent(recipientQuery)}`,
          { signal: controller.signal },
        );
        const payload = (await response.json()) as {
          recipients?: MessageRecipientSuggestion[];
        };
        setRecipientSuggestions(payload.recipients ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setRecipientSuggestions([]);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [recipientQuery]);

  const filteredConversations = useMemo(() => {
    const query = normalize(search);
    if (!query) return conversationItems;

    return conversationItems.filter((conversation) => {
      const participantText = conversation.participants
        .map((participant) => `${participant.display_name ?? ""} ${participant.headline ?? ""}`)
        .join(" ");
      const messageText = conversation.messages.map((message) => message.body).join(" ");

      return normalize(`${participantText} ${messageText}`).includes(query);
    });
  }, [conversationItems, search]);

  const activeConversation =
    conversationItems.find((conversation) => conversation.id === activeConversationId) ?? null;
  const activeConversationLastMessageId = activeConversation?.lastMessage?.id ?? null;
  const activeProfile = activeConversation?.otherParticipant;
  const activeName = activeProfile?.display_name ?? "Weldoo member";
  const profileTypeLabel =
    currentProfile.profileType === "company"
      ? "Company profile"
      : currentProfile.profileType === "training_provider"
        ? "Training provider"
        : currentProfile.profileType === "professional"
          ? "Weldoo professional"
          : "Weldoo member";

  function selectConversation(conversationId: string) {
    if (conversationId === activeConversationId) return;

    setActiveConversationId(conversationId);
    router.replace(`/messages?conversation=${conversationId}`, { scroll: false });
  }

  useEffect(() => {
    const scrollContainer = messagesScrollRef.current;

    if (!scrollContainer || !activeConversation) return;

    const scrollTarget = `${activeConversation.id}:${activeConversationLastMessageId ?? "empty"}`;

    if (lastAutoScrollTargetRef.current === scrollTarget) return;

    lastAutoScrollTargetRef.current = scrollTarget;
    scrollContainer.scrollTo({
      behavior: "smooth",
      top: scrollContainer.scrollHeight,
    });
  }, [activeConversation?.id, activeConversationLastMessageId, activeConversation]);

  async function sendReply() {
    if (!activeConversation || isPending) return;

    setErrorMessage(null);
    setStatusMessage(null);

    startTransition(async () => {
      const response = await fetch(
        `/api/messages/conversations/${activeConversation.id}/messages`,
        {
          body: JSON.stringify({ message: reply }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );
      const payload = await readMessageApiPayload(response);

      if (!response.ok || !payload.sentMessage) {
        setErrorMessage(payload.message ?? "Unable to send the message.");
        return;
      }

      const sentMessage = payload.sentMessage;

      setConversationItems((items) =>
        items.map((item) =>
          item.id === activeConversation.id
            ? {
                ...item,
                lastMessage: sentMessage,
                last_message_at: sentMessage.created_at,
                messages: [...item.messages, sentMessage],
              }
            : item,
        ),
      );
      setReply("");
      setStatusMessage("Message sent.");
    });
  }

  async function sendComposedMessage() {
    if (!selectedRecipient || isPending) return;

    setErrorMessage(null);
    setStatusMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/messages/conversations", {
        body: JSON.stringify({
          message: composeBody,
          recipientProfileId: selectedRecipient.id,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = await readMessageApiPayload(response);

      if (!response.ok || !payload.conversationId) {
        setErrorMessage(payload.message ?? "Unable to send the message.");
        return;
      }

      setComposeOpen(false);
      setComposeBody("");
      setRecipientQuery("");
      setSelectedRecipient(null);
      setStatusMessage("Message sent.");
      setActiveConversationId(payload.conversationId);
      router.replace(`/messages?conversation=${payload.conversationId}`, { scroll: false });
      await refreshConversations();
    });
  }

  return (
    <>
      <section className="mx-auto h-[calc(100dvh-163px)] max-w-[1200px] overflow-hidden px-0 py-0 md:h-[calc(100dvh-93px)] md:px-8 md:py-8">
        <div className="grid h-full min-h-0 gap-6 lg:grid-cols-[225px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="overflow-hidden rounded-[16px] border border-weldoo-border-light bg-white shadow-weldoo-sm">
              <div className="h-[74px] bg-[linear-gradient(135deg,#3d3db4,#5558e8)]" />
              <div className="px-5 pb-5">
                <div className="-mt-8">
                  <Avatar
                    name={currentProfile.displayName}
                    size="lg"
                    src={currentProfile.avatarUrl}
                  />
                </div>
                <h2 className="mt-3 truncate text-[16px] font-bold leading-tight text-weldoo-ink">
                  {currentProfile.displayName}
                </h2>
                <p className="mt-2 line-clamp-2 text-[13px] leading-[1.55] text-weldoo-muted">
                  {currentProfile.headline ?? profileTypeLabel}
                </p>
                <div className="mt-5 rounded-weldoo-sm bg-weldoo-bg px-3 py-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-weldoo-muted">
                    Inbox
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-weldoo-ink">
                    {conversationItems.length} conversation{conversationItems.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-col">
            <div className="mb-4 flex h-11 items-center justify-between gap-3 px-4 md:px-0">
              <h1 className="text-[22px] font-bold tracking-tight text-weldoo-ink">
                Messages
              </h1>
              <button
                aria-label="New message"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-weldoo-border-light bg-white text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-weldoo-indigo"
                onClick={() => setComposeOpen(true)}
                title="New message"
                type="button"
              >
                <ComposeIcon />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 overflow-hidden border-weldoo-border-light bg-white shadow-weldoo-sm md:rounded-[18px] md:border lg:grid-cols-[340px_minmax(0,1fr)]">
              <aside
                className={[
                  "min-h-0 border-r border-weldoo-border-light bg-white",
                  activeConversation ? "hidden lg:block" : "block",
                ].join(" ")}
              >
                <div className="border-b border-weldoo-border-light p-4">
                  {loadError ? (
                    <p className="mb-3 rounded-weldoo-sm bg-red-50 px-3 py-2 text-sm font-medium leading-5 text-red-600">
                      {loadError}
                    </p>
                  ) : null}
                  <label
                    className="flex h-10 items-center gap-2 rounded-full border border-weldoo-border-light bg-weldoo-bg px-3 transition focus-within:border-weldoo-indigo focus-within:bg-white focus-within:ring-4 focus-within:ring-weldoo-indigo/10"
                    htmlFor="messages-search"
                  >
                    <SearchIcon />
                    <input
                      aria-label="Search messages"
                      className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-weldoo-ink outline-none placeholder:text-weldoo-muted/65"
                      id="messages-search"
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search messages..."
                      value={search}
                    />
                  </label>
                </div>

                {filteredConversations.length ? (
                  <div className="max-h-[calc(100dvh-14rem)] overflow-y-auto lg:max-h-none">
                    {filteredConversations.map((conversation) => {
                      const profile = conversation.otherParticipant;
                      const name = profile?.display_name ?? "Weldoo member";
                      const lastMessage = conversation.lastMessage;
                      const fromCurrentUser =
                        lastMessage?.sender_profile_id === currentProfileId;

                      return (
                        <button
                          className={[
                            "relative flex w-full items-start gap-3 border-b border-weldoo-border-light px-4 py-[15px] text-left transition hover:bg-weldoo-bg-strong",
                            conversation.id === activeConversationId
                              ? "bg-weldoo-indigo/[0.06] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:bg-weldoo-indigo"
                              : "",
                          ].join(" ")}
                          key={conversation.id}
                          onClick={() => selectConversation(conversation.id)}
                          type="button"
                        >
                          <Avatar name={name} src={profile?.avatar_url} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <span
                                className={[
                                  "min-w-0 truncate text-[13.5px] text-weldoo-ink",
                                  conversation.unreadCount > 0 ? "font-bold" : "font-semibold",
                                ].join(" ")}
                              >
                                {name}
                              </span>
                              <span className="shrink-0 text-[11px] text-weldoo-muted">
                                {formatShortDate(conversation.last_message_at ?? conversation.created_at)}
                              </span>
                            </div>
                            <p
                              className={[
                                "mt-1 truncate text-[12.5px] leading-5",
                                conversation.unreadCount > 0
                                  ? "font-semibold text-weldoo-ink"
                                  : "text-weldoo-muted",
                              ].join(" ")}
                            >
                              {lastMessage
                                ? `${fromCurrentUser ? "You: " : ""}${lastMessage.body}`
                                : "No messages yet"}
                            </p>
                          </div>
                          {conversation.unreadCount > 0 ? (
                            <span className="mt-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-weldoo-indigo px-1 text-[10px] font-bold text-white">
                              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                    <div className="mb-3 text-weldoo-muted/40">
                      <MessageIcon />
                    </div>
                    <h2 className="text-sm font-bold text-weldoo-ink">No conversations found</h2>
                    <p className="mt-1 max-w-[260px] text-sm leading-6 text-weldoo-muted">
                      {loadError
                        ? "Apply the Phase 2 messages migration before using the full inbox."
                        : "Start a message from the compose button or clear your search."}
                    </p>
                  </div>
                )}
              </aside>

              <main
                className={[
                  "min-h-0 min-w-0 flex-col bg-white",
                  activeConversation ? "flex" : "hidden lg:flex",
                ].join(" ")}
              >
                {activeConversation ? (
                  <>
                    <div className="flex shrink-0 items-center gap-3 border-b border-weldoo-border-light bg-white px-4 py-3.5 sm:px-5">
                      <button
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-weldoo-border-light px-3 text-[12px] font-bold text-weldoo-slate transition hover:border-weldoo-indigo hover:text-weldoo-indigo lg:hidden"
                        onClick={() => setActiveConversationId(null)}
                        type="button"
                      >
                        <BackIcon />
                        Back
                      </button>
                      <Avatar name={activeName} size="lg" src={activeProfile?.avatar_url} />
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-[15px] font-bold text-weldoo-ink">
                          {activeName}
                        </h2>
                        <p className="truncate text-[12px] text-weldoo-muted">
                          {activeProfile?.headline ?? "Weldoo member"}
                        </p>
                      </div>
                      <div className="hidden items-center gap-2 sm:flex">
                        <button
                          aria-label="Star conversation"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-weldoo-border-light text-weldoo-muted transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
                          type="button"
                        >
                          <StarIcon />
                        </button>
                        <button
                          aria-label="Conversation options"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-weldoo-border-light text-weldoo-muted transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
                          type="button"
                        >
                          <MoreIcon />
                        </button>
                      </div>
                    </div>

                    <div
                      className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-5 sm:px-6"
                      ref={messagesScrollRef}
                    >
                      {activeConversation.messages.length ? (
                        activeConversation.messages.map((message, index) => {
                          const fromCurrentUser = message.sender_profile_id === currentProfileId;
                          const senderName = fromCurrentUser ? currentProfile.displayName : activeName;
                          const senderAvatar = fromCurrentUser
                            ? currentProfile.avatarUrl
                            : activeProfile?.avatar_url;
                          const previousMessage = activeConversation.messages[index - 1];
                          const showDaySeparator =
                            !previousMessage ||
                            getMessageDayKey(previousMessage.created_at) !==
                              getMessageDayKey(message.created_at);

                          return (
                            <Fragment key={message.id}>
                              {showDaySeparator ? (
                                <div className="relative my-5 text-center text-[11px] font-semibold uppercase tracking-[0.07em] text-weldoo-muted before:absolute before:left-0 before:right-0 before:top-1/2 before:h-px before:bg-weldoo-border-light">
                                  <span className="relative z-[1] bg-white px-3">
                                    {formatMessageDay(message.created_at)}
                                  </span>
                                </div>
                              ) : null}
                              <div className="mb-5 flex items-start gap-3">
                                <Avatar name={senderName} size="sm" src={senderAvatar} />
                                <div className="min-w-0 flex-1">
                                  <div className="mb-1 flex items-baseline gap-2">
                                    <span className="text-[13.5px] font-bold text-weldoo-ink">{senderName}</span>
                                    <span className="text-[12px] text-weldoo-muted">· {formatShortDate(message.created_at)}</span>
                                  </div>
                                  <p className="whitespace-pre-wrap break-words text-sm leading-[1.65] text-weldoo-ink">
                                    {message.body}
                                  </p>
                                </div>
                              </div>
                            </Fragment>
                          );
                        })
                      ) : (
                        <div className="flex h-full min-h-[260px] items-center justify-center text-center text-sm text-weldoo-muted">
                          Send the first message in this conversation.
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 bg-white">
                      <AutoDismissNotice
                        className="mx-4 mb-3 sm:mx-5"
                        message={statusMessage}
                      />
                      <AutoDismissNotice
                        className="mx-4 mb-3 sm:mx-5"
                        message={errorMessage}
                        variant="error"
                      />
                      <div className="flex flex-wrap gap-2 px-4 pb-0 pt-2 sm:px-5">
                        {quickReplies.map((text) => (
                          <button
                            className="h-[30px] shrink-0 whitespace-nowrap rounded-full border-[1.5px] border-weldoo-indigo bg-white px-3.5 text-[12.5px] font-medium text-weldoo-indigo transition hover:bg-weldoo-indigo/[0.06]"
                            key={text}
                            onClick={() => setReply(text)}
                            type="button"
                          >
                            {text}
                          </button>
                        ))}
                      </div>
                      <div className="mt-6 flex items-end gap-3 border-t border-weldoo-border-light px-4 py-3.5 sm:px-5">
                        <div className="min-w-0 flex-1">
                          <Textarea
                            aria-label="Message reply"
                            className="min-h-[62px] resize-none bg-weldoo-bg"
                            id="message-reply"
                            onChange={(event) => setReply(event.target.value)}
                            placeholder="Write a message..."
                            value={reply}
                          />
                        </div>
                        <button
                          aria-label="Send message"
                          className="mb-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-weldoo-indigo text-white shadow-weldoo-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isPending || reply.trim().length === 0}
                          onClick={sendReply}
                          type="button"
                        >
                          <SendIcon />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center px-6 text-center text-weldoo-muted">
                    <div>
                      <div className="mx-auto mb-3 text-weldoo-muted/25">
                        <MessageIcon />
                      </div>
                      <p className="text-sm font-semibold text-weldoo-ink">
                        Select a conversation to start reading
                      </p>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </section>

      <Modal
        description="Search accepted connections and send a short first message."
        footer={
          <>
            <Button
              disabled={isPending}
              onClick={() => setComposeOpen(false)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending || !selectedRecipient || composeBody.trim().length === 0}
              onClick={sendComposedMessage}
            >
              Send message
            </Button>
          </>
        }
        onOpenChange={setComposeOpen}
        open={composeOpen}
        title="New message"
      >
        <div className="space-y-4">
          <Input
            id="recipient-search"
            label="To"
            onChange={(event) => {
              setRecipientQuery(event.target.value);
              setSelectedRecipient(null);
            }}
            placeholder="Search by name or headline"
            value={selectedRecipient?.display_name ?? recipientQuery}
          />
          <div className="max-h-52 overflow-y-auto rounded-weldoo-sm border border-weldoo-border-light">
            {recipientSuggestions.length ? (
              recipientSuggestions.map((recipient) => (
                <button
                  className={[
                    "flex w-full items-center gap-3 border-b border-weldoo-border-light px-3 py-2.5 text-left last:border-b-0 hover:bg-weldoo-bg",
                    selectedRecipient?.id === recipient.id ? "bg-weldoo-indigo/[0.06]" : "",
                  ].join(" ")}
                  key={recipient.id}
                  onClick={() => setSelectedRecipient(recipient)}
                  type="button"
                >
                  <Avatar name={recipient.display_name ?? "Weldoo member"} size="sm" src={recipient.avatar_url} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-weldoo-ink">
                      {recipient.display_name ?? "Weldoo member"}
                    </p>
                    <p className="truncate text-[12px] text-weldoo-muted">
                      {recipient.headline ?? "Weldoo member"}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-sm text-weldoo-muted">
                No recipients found.
              </p>
            )}
          </div>
          <Textarea
            id="compose-message"
            label="Message"
            maxLength={4000}
            onChange={(event) => setComposeBody(event.target.value)}
            placeholder="Write a short message"
            value={composeBody}
          />
          <AutoDismissNotice message={errorMessage} variant="error" />
        </div>
      </Modal>
    </>
  );
}
