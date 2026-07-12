"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  formatNotificationTime,
  type NotificationDropdownData,
  type NotificationDropdownItem,
} from "@/lib/notifications/queries";

type NotificationType = NotificationDropdownItem["type"];

function BellIcon({ className = "h-[19px] w-[19px]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function NotificationIcon({ type }: { type: NotificationType }) {
  if (type === "post_like") {
    return (
      <svg aria-hidden="true" className="h-[17px] w-[17px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }

  if (type === "post_comment" || type === "contact_request") {
    return (
      <svg aria-hidden="true" className="h-[17px] w-[17px]" fill="none" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    );
  }

  if (type === "course_event_interest") {
    return (
      <svg aria-hidden="true" className="h-[17px] w-[17px]" fill="none" viewBox="0 0 24 24">
        <rect height="18" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="18" x="3" y="4" />
        <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16" x2="16" y1="2" y2="6" />
        <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="8" x2="8" y1="2" y2="6" />
        <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="3" x2="21" y1="10" y2="10" />
      </svg>
    );
  }

  if (type === "job_application") {
    return (
      <svg aria-hidden="true" className="h-[17px] w-[17px]" fill="none" viewBox="0 0 24 24">
        <rect height="14" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="20" x="2" y="7" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-[17px] w-[17px]" fill="none" viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="19" x2="19" y1="8" y2="14" />
      <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function NotificationAvatar({ item }: { item: NotificationDropdownItem }) {
  if (item.actorAvatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt=""
        className="h-[38px] w-[38px] shrink-0 rounded-full object-cover"
        src={item.actorAvatarUrl}
      />
    );
  }

  if (item.actorInitials) {
    return (
      <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3d3db4,#7b7fe8)] text-[13.2px] font-bold text-white">
        {item.actorInitials}
      </span>
    );
  }

  return (
    <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-weldoo-bg-strong text-weldoo-indigo">
      <NotificationIcon type={item.type} />
    </span>
  );
}

function NotificationRow({
  item,
  onRead,
}: {
  item: NotificationDropdownItem;
  onRead: (id: string) => void;
}) {
  const unread = !item.readAt;

  return (
    <Link
      className={[
        "relative flex items-start gap-3 border-b border-weldoo-border-light px-[18px] py-3.5 transition last:border-b-0 hover:bg-weldoo-bg",
        unread
          ? "bg-weldoo-indigo/[0.03] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:rounded-r-sm before:bg-weldoo-indigo"
          : "",
      ].join(" ")}
      href={item.href}
      onClick={() => onRead(item.id)}
    >
      <NotificationAvatar item={item} />
      <span className="min-w-0 flex-1">
        <span className="block text-[13.2px] leading-[1.5] text-weldoo-ink">
          <strong className="font-bold">{item.title}</strong>
          {item.body ? <span> {item.body}</span> : null}
        </span>
        <span className="mt-[3px] block text-[11px] font-medium text-weldoo-muted">
          {formatNotificationTime(item.createdAt)}
        </span>
      </span>
      {unread ? (
        <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-weldoo-indigo" />
      ) : null}
    </Link>
  );
}

function EmptyNotifications() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-weldoo-bg-strong text-weldoo-indigo">
        <BellIcon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-[15.4px] font-bold text-weldoo-ink">
        No notifications yet
      </h3>
      <p className="mt-1 max-w-xs text-[13.2px] leading-6 text-weldoo-muted">
        Updates about messages, jobs, academy events, and your network will appear here.
      </p>
    </div>
  );
}

export function NotificationsPopover({
  initialData,
}: {
  initialData: NotificationDropdownData;
}) {
  const [items, setItems] = useState(initialData.items);
  const [unreadCount, setUnreadCount] = useState(initialData.unreadCount);
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleUnreadCount = useMemo(
    () => items.filter((item) => !item.readAt).length,
    [items],
  );
  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);
  const ariaLabel =
    unreadCount > 0
      ? `Notifications, ${unreadCount} unread`
      : "Notifications";
  const refreshNotifications = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
        signal,
      });

      if (!response.ok) return;

      const payload = (await response.json()) as {
        data?: NotificationDropdownData;
        status?: string;
      };

      if (payload.status !== "success" || !payload.data) return;

      setItems(payload.data.items);
      setUnreadCount(payload.data.unreadCount);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshNotifications(controller.signal);
      }
    }, 10000);

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        void refreshNotifications(controller.signal);
      }
    }

    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);

    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [refreshNotifications]);

  function markRead(id: string) {
    const wasUnread = items.some((item) => item.id === id && !item.readAt);
    if (!wasUnread) return;

    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
      ),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
    void fetch(`/api/notifications/${id}`, {
      body: JSON.stringify({ action: "mark_read" }),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      method: "PATCH",
    });
  }

  function markAllRead() {
    if (unreadCount === 0 && visibleUnreadCount === 0) return;

    const now = new Date().toISOString();
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? now })));
    setUnreadCount(0);
    void fetch("/api/notifications", {
      body: JSON.stringify({ action: "mark_all_read" }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
  }

  const list = items.length ? (
    items.map((item) => (
      <NotificationRow item={item} key={item.id} onRead={markRead} />
    ))
  ) : (
    <EmptyNotifications />
  );

  return (
    <>
      <details className="group relative hidden md:block" data-weldoo-popover>
        <summary
          aria-haspopup="dialog"
          aria-label={ariaLabel}
          className="relative flex h-[38px] w-[38px] cursor-pointer list-none items-center justify-center rounded-full text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-weldoo-indigo [&::-webkit-details-marker]:hidden"
          title={ariaLabel}
        >
          <BellIcon />
          {unreadCount > 0 ? (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-weldoo-indigo px-[3px] text-[9px] font-bold leading-none text-white">
              {badgeLabel}
            </span>
          ) : null}
        </summary>
        <div
          aria-label="Notifications"
          className="absolute right-[-8px] top-[48px] z-40 w-[380px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-weldoo-border-light bg-white shadow-weldoo-xl"
          role="dialog"
        >
          <div className="flex items-center justify-between border-b border-weldoo-border-light px-[18px] pb-3 pt-4">
            <span className="text-[16.5px] font-bold text-weldoo-ink">Notifications</span>
            <button
              className="text-[12.1px] font-semibold text-weldoo-indigo transition hover:opacity-70 disabled:cursor-default disabled:opacity-40"
              disabled={unreadCount === 0}
              onClick={markAllRead}
              type="button"
            >
              Mark all as read
            </button>
          </div>
          <div className="max-h-[440px] overflow-y-auto">{list}</div>
          <Link
            className="flex h-11 items-center justify-center border-t border-weldoo-border-light text-[12.1px] font-semibold text-weldoo-indigo transition hover:bg-weldoo-bg"
            href="/notifications"
          >
            View all notifications
          </Link>
        </div>
      </details>

      <button
        aria-label={ariaLabel}
        className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-weldoo-indigo md:hidden"
        onClick={() => setMobileOpen(true)}
        title={ariaLabel}
        type="button"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-weldoo-indigo px-[3px] text-[9px] font-bold leading-none text-white">
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {mobileOpen ? (
        <div className="fixed inset-x-0 bottom-[calc(70px+env(safe-area-inset-bottom))] top-[65px] z-[300] overflow-y-auto bg-white md:hidden">
          <div className="px-4 pb-0 pt-4">
            <button
              className="mb-3 inline-flex h-9 items-center gap-1.5 rounded-full border-[1.5px] border-weldoo-border-light bg-white px-3.5 text-[13px] font-semibold text-weldoo-ink shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
              onClick={() => setMobileOpen(false)}
              type="button"
            >
              <BackIcon />
              Back
            </button>
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-lg font-extrabold text-weldoo-ink">
                Notifications
              </span>
              <button
                className="shrink-0 text-[12.1px] font-semibold text-weldoo-indigo transition hover:opacity-70 disabled:cursor-default disabled:opacity-40"
                disabled={unreadCount === 0}
                onClick={markAllRead}
                type="button"
              >
                Mark all as read
              </button>
            </div>
          </div>
          <div>{list}</div>
        </div>
      ) : null}
    </>
  );
}
