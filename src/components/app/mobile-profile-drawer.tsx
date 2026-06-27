"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Avatar } from "@/components/ui";

type MobileProfileDrawerProps = {
  avatarInitial: string;
  avatarUrl?: string | null;
  displayName: string;
  profileHref: string;
  profileType?: string | null;
  roleLabel: string;
  signOutAction: () => Promise<void>;
};

type DrawerLink = {
  href: string;
  icon: ReactNode;
  label: string;
};

function DrawerAvatar({
  avatarInitial,
  avatarUrl,
}: {
  avatarInitial: string;
  avatarUrl?: string | null;
}) {
  return (
    <Avatar
      className="h-[34px] w-[34px] text-[13px] shadow-[0_2px_8px_rgba(61,61,180,0.25)]"
      initials={avatarInitial}
      src={avatarUrl}
    />
  );
}

function DrawerIcon({ name }: { name: "academy" | "briefcase" | "calendar" | "home" | "logout" | "network" | "profile" | "settings" }) {
  const iconClass = "h-[18px] w-[18px] shrink-0 text-weldoo-muted";

  if (name === "home") {
    return (
      <svg aria-hidden="true" className={iconClass} fill="none" viewBox="0 0 24 24">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "network") {
    return (
      <svg aria-hidden="true" className={iconClass} fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <circle cx="5" cy="19" r="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <circle cx="19" cy="19" r="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M12 7v4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <line x1="9" x2="15" y1="14" y2="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M9.5 13.5 6.5 17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M14.5 13.5 17.5 17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg aria-hidden="true" className={iconClass} fill="none" viewBox="0 0 24 24">
        <rect height="18" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" width="18" x="3" y="4" />
        <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" x1="16" x2="16" y1="2" y2="6" />
        <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" x1="8" x2="8" y1="2" y2="6" />
        <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" x1="3" x2="21" y1="10" y2="10" />
      </svg>
    );
  }

  if (name === "briefcase") {
    return (
      <svg aria-hidden="true" className={iconClass} fill="none" viewBox="0 0 24 24">
        <rect height="14" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" width="20" x="2" y="7" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "academy") {
    return (
      <svg aria-hidden="true" className={iconClass} fill="none" viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "profile") {
    return (
      <svg aria-hidden="true" className={iconClass} fill="none" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg aria-hidden="true" className={iconClass} fill="none" viewBox="0 0 24 24">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" x1="21" x2="9" y1="12" y2="12" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={iconClass} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function DrawerItem({
  children,
  href,
  icon,
  onClick,
}: DrawerLink & { children: ReactNode; onClick: () => void }) {
  return (
    <Link
      className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-[14.3px] font-medium text-weldoo-ink transition hover:bg-weldoo-bg hover:text-weldoo-indigo focus-visible:bg-weldoo-bg focus-visible:text-weldoo-indigo focus-visible:outline-none"
      href={href}
      onClick={onClick}
    >
      {icon}
      {children}
    </Link>
  );
}

export function MobileProfileDrawer({
  avatarInitial,
  avatarUrl,
  displayName,
  profileHref,
  profileType,
  roleLabel,
  signOutAction,
}: MobileProfileDrawerProps) {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const titleId = useId();
  const companyLinks: DrawerLink[] =
    profileType === "company"
      ? [{ href: "/company/jobs", icon: <DrawerIcon name="briefcase" />, label: "Company dashboard" }]
      : [];
  const links: DrawerLink[] = [
    { href: profileHref, icon: <DrawerIcon name="profile" />, label: "My profile" },
    { href: "/", icon: <DrawerIcon name="home" />, label: "Feed" },
    { href: "/network", icon: <DrawerIcon name="network" />, label: "Network" },
    { href: "/events", icon: <DrawerIcon name="calendar" />, label: "Events" },
    { href: "/jobs", icon: <DrawerIcon name="briefcase" />, label: "Jobs" },
    { href: "/academy", icon: <DrawerIcon name="academy" />, label: "Academy" },
    ...companyLinks,
    { href: "/saved/jobs", icon: <DrawerIcon name="briefcase" />, label: "Saved jobs" },
    { href: "/settings", icon: <DrawerIcon name="settings" />, label: "Settings" },
  ];

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const openDrawer = useCallback(() => {
    clearCloseTimeout();
    setRendered(true);
    window.requestAnimationFrame(() => setVisible(true));
  }, [clearCloseTimeout]);

  const closeDrawer = useCallback(() => {
    setVisible(false);
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setRendered(false);
      closeTimeoutRef.current = null;
    }, 280);
  }, [clearCloseTimeout]);

  useEffect(() => {
    return () => clearCloseTimeout();
  }, [clearCloseTimeout]);

  useEffect(() => {
    if (!rendered) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDrawer();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDrawer, rendered]);

  const drawer = rendered ? createPortal(
    <>
      <button
        aria-label="Close profile menu"
        className={`fixed inset-0 z-[900] cursor-default bg-[rgba(12,12,24,0.45)] transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeDrawer}
        type="button"
      />
      <aside
        aria-labelledby={titleId}
        aria-modal="true"
        className={`fixed inset-y-0 right-0 z-[1000] flex h-dvh w-[min(300px,85vw)] transform flex-col bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-[cubic-bezier(.22,1,.36,1)] ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-weldoo-border-light px-5 pb-4 pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <DrawerAvatar avatarInitial={avatarInitial} avatarUrl={avatarUrl} />
            <div className="min-w-0">
              <div className="truncate text-[14.3px] font-bold text-weldoo-ink" id={titleId}>
                {displayName}
              </div>
              <div className="mt-0.5 truncate text-[11px] font-medium text-weldoo-muted">
                {roleLabel}
              </div>
            </div>
          </div>
          <button
            aria-label="Close profile menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-weldoo-bg text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-weldoo-indigo"
            onClick={closeDrawer}
            type="button"
          >
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="18" x2="6" y1="6" y2="18" />
              <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="6" x2="18" y1="6" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {links.map((item, index) => (
            <div key={item.label}>
              {index === 1 || index === 6 ? <div className="my-2 h-px bg-weldoo-border-light" /> : null}
              <DrawerItem href={item.href} icon={item.icon} label={item.label} onClick={closeDrawer}>
                {item.label}
              </DrawerItem>
            </div>
          ))}
          <div className="my-2 h-px bg-weldoo-border-light" />
          <form action={signOutAction}>
            <button
              className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-[14.3px] font-medium text-weldoo-ink transition hover:bg-weldoo-bg hover:text-weldoo-indigo focus-visible:bg-weldoo-bg focus-visible:text-weldoo-indigo focus-visible:outline-none"
              type="submit"
            >
              <DrawerIcon name="logout" />
              Log out
            </button>
          </form>
        </div>
      </aside>
    </>,
    document.body,
  ) : null;

  return (
    <div className="md:hidden">
      <button
        aria-expanded={rendered}
        aria-haspopup="dialog"
        aria-label="My profile menu"
        className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition hover:scale-[1.03] hover:shadow-weldoo-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-weldoo-indigo"
        onClick={openDrawer}
        title="My profile"
        type="button"
      >
        <DrawerAvatar avatarInitial={avatarInitial} avatarUrl={avatarUrl} />
      </button>
      {drawer}
    </div>
  );
}
