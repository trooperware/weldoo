"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type MessagesNavLinkProps = {
  initialUnreadCount: number;
  profileId?: string | null;
};

export function MessagesNavLink({
  initialUnreadCount,
  profileId,
}: MessagesNavLinkProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const unreadMessageBadge =
    unreadCount > 99 ? "99+" : String(unreadCount);
  const messagesLabel =
    unreadCount > 0 ? `Messages, ${unreadCount} unread` : "Messages";

  const refreshUnreadCount = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/messages/unread-count", {
        cache: "no-store",
        signal,
      });

      if (!response.ok) return;

      const payload = (await response.json()) as {
        count?: number;
        status?: string;
      };

      if (payload.status !== "success" || typeof payload.count !== "number") {
        return;
      }

      setUnreadCount(payload.count);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        void refreshUnreadCount(controller.signal);
      }
    }

    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);

    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!profileId) return;

    const supabase = createSupabaseBrowserClient();
    const messagesChannel = supabase
      .channel(`messages-unread:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          void refreshUnreadCount();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          filter: `profile_id=eq.${profileId}`,
          schema: "public",
          table: "message_conversation_participants",
        },
        () => {
          void refreshUnreadCount();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          filter: `recipient_profile_id=eq.${profileId}`,
          schema: "public",
          table: "contact_requests",
        },
        () => {
          void refreshUnreadCount();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(messagesChannel);
    };
  }, [profileId, refreshUnreadCount]);

  return (
    <Link
      aria-label={messagesLabel}
      className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo"
      href="/messages"
      title={messagesLabel}
    >
      <svg aria-hidden="true" className="h-[19px] w-[19px]" fill="none" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
      {unreadCount > 0 ? (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-weldoo-indigo px-[3px] text-[9px] font-bold leading-none text-white">
          {unreadMessageBadge}
        </span>
      ) : null}
    </Link>
  );
}
