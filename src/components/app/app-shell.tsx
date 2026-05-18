import Link from "next/link";
import type { ReactNode } from "react";

import { WeldooLogo } from "@/components/auth/auth-card";
import { signOutAction } from "@/server/actions/auth";

type AppShellProps = {
  auth?: {
    displayName?: string | null;
    email?: string | null;
    publicProfileHref?: string | null;
    unreadContactRequestCount?: number;
    profileType?: string | null;
  };
  children: ReactNode;
};

const mainNavItems = [
  { label: "Network", href: "/network" },
  { label: "Events", href: "/" },
  { label: "Jobs", href: "/jobs" },
  { label: "Academy", href: "/" },
];

function HeaderIcon({ label }: { label: string }) {
  const pathClass = "stroke-current";

  if (label === "Network") {
    return (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <circle className={pathClass} cx="12" cy="5" r="2" />
        <circle className={pathClass} cx="5" cy="19" r="2" />
        <circle className={pathClass} cx="19" cy="19" r="2" />
        <path className={pathClass} d="M12 7v4" />
        <line className={pathClass} x1="9" x2="15" y1="14" y2="14" />
        <path className={pathClass} d="M9.5 13.5 6.5 17" />
        <path className={pathClass} d="M14.5 13.5 17.5 17" />
      </svg>
    );
  }
  if (label === "Events") {
    return (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <rect className={pathClass} height="18" rx="2" width="18" x="3" y="4" />
        <line className={pathClass} x1="16" x2="16" y1="2" y2="6" />
        <line className={pathClass} x1="8" x2="8" y1="2" y2="6" />
        <line className={pathClass} x1="3" x2="21" y1="10" y2="10" />
      </svg>
    );
  }
  if (label === "Jobs") {
    return (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <rect className={pathClass} height="14" rx="2" width="20" x="2" y="7" />
        <path className={pathClass} d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path className={pathClass} d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path className={pathClass} d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

export function AppShell({ auth, children }: AppShellProps) {
  const isSignedIn = Boolean(auth);
  const displayName = auth?.displayName ?? auth?.email?.split("@")[0] ?? "Weldoo member";
  const roleLabel =
    auth?.profileType === "company"
      ? "Company profile"
      : auth?.profileType === "training_provider"
        ? "Training provider"
        : auth?.profileType === "professional"
          ? "Weldoo professional"
          : "Weldoo member";
  const avatarInitial = displayName.slice(0, 1).toUpperCase();
  const unreadContactRequestCount = auth?.unreadContactRequestCount ?? 0;
  const profileHref =
    auth?.profileType === "professional"
      ? "/profile/edit"
      : auth?.profileType === "company"
        ? "/company/edit"
        : auth?.profileType === "training_provider"
          ? "/training-provider/edit"
          : null;

  return (
    <div className="min-h-screen bg-weldoo-bg text-weldoo-ink">
      <header className="sticky top-0 z-30 h-16 border-b border-weldoo-border-light bg-white/95 shadow-[0_1px_0_#ebebf5,0_1px_3px_rgba(61,61,180,0.06)] backdrop-blur-[16px]">
        <div className="mx-auto grid h-full max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-8">
          <div className="flex items-center">
            <Link className="flex min-w-0 items-center" href="/">
              <WeldooLogo />
            </Link>
            {isSignedIn ? (
              <Link
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border)] bg-white px-3 text-xs font-semibold text-[var(--weldoo-slate)] shadow-weldoo-sm transition hover:border-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo)] lg:hidden"
                href="/dashboard"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border)] bg-white px-3 text-xs font-semibold text-[var(--weldoo-slate)] shadow-weldoo-sm transition hover:border-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo)] lg:hidden"
                href="/auth/sign-in"
              >
                Sign in
              </Link>
            )}
          </div>

          <nav aria-label="Main navigation" className="hidden overflow-x-auto md:block">
            <ul className="flex min-w-max items-center gap-0.5">
              {mainNavItems.map((item) => (
                <li key={item.label}>
                  <Link
                    className="inline-flex items-center gap-[7px] rounded-full px-[18px] py-2 text-[13.5px] font-medium tracking-[-0.01em] text-weldoo-ink transition hover:bg-weldoo-bg-strong"
                    href={item.href}
                  >
                    <HeaderIcon label={item.label} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center justify-end gap-1 lg:flex">
            {isSignedIn ? (
              <>
                <Link
                  aria-label="Contact requests"
                  className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo"
                  href="/contact-requests"
                >
                  <svg aria-hidden="true" className="h-[19px] w-[19px]" fill="none" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  </svg>
                  {unreadContactRequestCount > 0 ? (
                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-weldoo-indigo px-[3px] text-[9px] font-bold leading-none text-white">
                      {unreadContactRequestCount > 9 ? "9+" : unreadContactRequestCount}
                    </span>
                  ) : null}
                </Link>
                <button className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo" type="button">
                  <svg aria-hidden="true" className="h-[19px] w-[19px]" fill="none" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  </svg>
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-weldoo-indigo px-[3px] text-[9px] font-bold leading-none text-white">7</span>
                </button>
                {profileHref ? (
                  <details className="group relative ml-1">
                    <summary
                      className="flex h-[34px] w-[34px] cursor-pointer list-none items-center justify-center rounded-full bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-[13px] font-bold text-white shadow-[0_2px_8px_rgba(61,61,180,0.25)] transition hover:scale-[1.03] hover:shadow-weldoo-md [&::-webkit-details-marker]:hidden"
                      title="My profile"
                    >
                      {avatarInitial}
                    </summary>
                    <div className="absolute right-0 top-11 z-40 w-60 overflow-hidden rounded-[14px] border border-weldoo-border-light bg-white shadow-weldoo-xl">
                      <div className="flex items-center gap-3 px-4 pb-3.5 pt-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#3d3db4,#5558e8)] text-[15.4px] font-bold text-white">
                          {avatarInitial}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-[14.3px] font-bold text-weldoo-ink">
                            {displayName}
                          </div>
                          <div className="mt-0.5 truncate text-[11px] text-weldoo-muted">
                            {roleLabel}
                          </div>
                        </div>
                      </div>
                      <div className="h-px bg-weldoo-border-light" />
                      <Link
                        className="flex w-full items-center gap-2.5 px-4 py-[11px] text-left text-[13.2px] font-medium text-weldoo-ink transition hover:bg-weldoo-bg hover:text-weldoo-indigo"
                        href={auth?.publicProfileHref ?? profileHref}
                      >
                        <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                        </svg>
                        My profile
                      </Link>
                      <Link
                        className="flex w-full items-center gap-2.5 px-4 py-[11px] text-left text-[13.2px] font-medium text-weldoo-ink transition hover:bg-weldoo-bg hover:text-weldoo-indigo"
                        href="/saved/jobs"
                      >
                        <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                        </svg>
                        Saved jobs
                      </Link>
                      <Link
                        className="flex w-full items-center gap-2.5 px-4 py-[11px] text-left text-[13.2px] font-medium text-weldoo-ink transition hover:bg-weldoo-bg hover:text-weldoo-indigo"
                        href="/settings"
                      >
                        <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                        </svg>
                        Settings
                      </Link>
                      <div className="h-px bg-weldoo-border-light" />
                      <form action={signOutAction}>
                        <button
                          className="flex w-full items-center gap-2.5 px-4 py-[11px] text-left text-[13.2px] font-medium text-weldoo-ink transition hover:bg-weldoo-bg hover:text-weldoo-indigo"
                          type="submit"
                        >
                          <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                            <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                            <line x1="21" x2="9" y1="12" y2="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                          </svg>
                          Log out
                        </button>
                      </form>
                    </div>
                  </details>
                ) : null}
              </>
            ) : (
              <>
                <Link
                  className="inline-flex h-9 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border)] bg-white px-3 text-sm font-semibold text-[var(--weldoo-slate)] shadow-weldoo-sm transition hover:border-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo)]"
                  href="/auth/sign-in"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
