import Link from "next/link";
import type { ReactNode } from "react";

import { MainNavigation, MobileBottomNavigation } from "@/components/app/app-shell-nav";
import { MobileProfileDrawer } from "@/components/app/mobile-profile-drawer";
import { WeldooLogo } from "@/components/auth/auth-card";
import { signOutAction } from "@/server/actions/auth";

type AppShellProps = {
  auth?: {
    avatarUrl?: string | null;
    displayName?: string | null;
    email?: string | null;
    headline?: string | null;
    location?: string | null;
    profileId?: string | null;
    publicProfileHref?: string | null;
    unreadContactRequestCount?: number;
    onboardingCompleted?: boolean;
    profileType?: string | null;
    status?: string | null;
  };
  children: ReactNode;
};

type AppShellAuth = NonNullable<AppShellProps["auth"]>;

const mainNavItems = [
  { label: "Network", href: "/network" },
  { label: "Events", href: "/events" },
  { label: "Jobs", href: "/jobs" },
  { label: "Academy", href: "/academy" },
];

const mobileNavItems = [{ label: "Home", href: "/" }, ...mainNavItems];

function ProfileAvatar({
  avatarInitial,
  avatarUrl,
  className = "",
}: {
  avatarInitial: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#3d3db4,#5558e8)] font-bold text-white ${className}`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
      ) : (
        avatarInitial
      )}
    </span>
  );
}

function ProfileMenuItem({
  children,
  href,
  icon,
}: {
  children: ReactNode;
  href: string;
  icon: ReactNode;
}) {
  return (
    <Link
      className="flex w-full items-center gap-2.5 px-4 py-[11px] text-left text-[13.2px] font-medium text-weldoo-ink transition hover:bg-weldoo-bg hover:text-weldoo-indigo focus-visible:bg-weldoo-bg focus-visible:text-weldoo-indigo focus-visible:outline-none"
      href={href}
      role="menuitem"
    >
      {icon}
      {children}
    </Link>
  );
}

function ProfileMenu({
  auth,
  avatarInitial,
  displayName,
  profileHref,
  roleLabel,
}: {
  auth: AppShellAuth;
  avatarInitial: string;
  displayName: string;
  profileHref: string;
  roleLabel: string;
}) {
  const profileTargetHref = auth.publicProfileHref ?? profileHref;

  return (
    <details className="group relative ml-1 hidden md:block">
      <summary
        aria-haspopup="menu"
        aria-label="My profile menu"
        className="flex h-[34px] w-[34px] cursor-pointer list-none items-center justify-center rounded-full transition hover:scale-[1.03] hover:shadow-weldoo-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-weldoo-indigo [&::-webkit-details-marker]:hidden"
        title="My profile"
      >
        <ProfileAvatar
          avatarInitial={avatarInitial}
          avatarUrl={auth.avatarUrl}
          className="h-[34px] w-[34px] rounded-full text-[13px] shadow-[0_2px_8px_rgba(61,61,180,0.25)]"
        />
      </summary>
      <div
        aria-label="My profile"
        className="absolute right-0 top-11 z-40 w-60 overflow-hidden rounded-[14px] border border-weldoo-border-light bg-white shadow-weldoo-xl"
        role="menu"
      >
        <div className="flex items-center gap-3 px-4 pb-3.5 pt-4">
          <ProfileAvatar
            avatarInitial={avatarInitial}
            avatarUrl={auth.avatarUrl}
            className="h-10 w-10 rounded-[10px] text-[15.4px]"
          />
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
        <ProfileMenuItem
          href={profileTargetHref}
          icon={
            <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          }
        >
          My profile
        </ProfileMenuItem>
        <ProfileMenuItem
          href="/saved/jobs"
          icon={
            <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          }
        >
          Saved jobs
        </ProfileMenuItem>
        <ProfileMenuItem
          href="/settings"
          icon={
            <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          }
        >
          Settings
        </ProfileMenuItem>
        {auth.profileType === "training_provider" ? (
          <>
            <div className="h-px bg-weldoo-border-light" />
            <ProfileMenuItem
              href="/training-provider/academy"
              icon={
                <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
              }
            >
              Manage Academy
            </ProfileMenuItem>
            <ProfileMenuItem
              href="/training-provider/academy/interests"
              icon={
                <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
              }
            >
              Academy interests
            </ProfileMenuItem>
          </>
        ) : null}
        <div className="h-px bg-weldoo-border-light" />
        <form action={signOutAction}>
          <button
            className="flex w-full items-center gap-2.5 px-4 py-[11px] text-left text-[13.2px] font-medium text-weldoo-ink transition hover:bg-weldoo-bg hover:text-weldoo-indigo focus-visible:bg-weldoo-bg focus-visible:text-weldoo-indigo focus-visible:outline-none"
            role="menuitem"
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
  const showMobileBottomNav = isSignedIn && auth?.onboardingCompleted;

  return (
    <div className="min-h-screen bg-weldoo-bg text-weldoo-ink">
      <header className="sticky top-0 z-30 h-16 border-b border-weldoo-border-light bg-white/95 shadow-[0_1px_0_#ebebf5,0_1px_3px_rgba(61,61,180,0.06)] backdrop-blur-[16px]">
        <div className="mx-auto grid h-full max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 sm:px-8 lg:gap-6">
          <div className="flex items-center gap-4">
            <Link className="flex min-w-0 items-center" href="/">
              <WeldooLogo />
            </Link>
            {!isSignedIn ? (
              <Link
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border)] bg-white px-3 text-xs font-semibold text-[var(--weldoo-slate)] shadow-weldoo-sm transition hover:border-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo)] lg:hidden"
                href="/auth/sign-in"
              >
                Sign in
              </Link>
            ) : null}
          </div>

          <MainNavigation items={mainNavItems} />

          <div className="flex items-center justify-end gap-1">
            {isSignedIn ? (
              <>
                <Link
                  aria-label="Contact requests"
                  className="relative hidden h-[38px] w-[38px] items-center justify-center rounded-full text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo lg:flex"
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
                <button
                  aria-label="Notifications"
                  className="relative hidden h-[38px] w-[38px] items-center justify-center rounded-full text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo lg:flex"
                  type="button"
                >
                  <svg aria-hidden="true" className="h-[19px] w-[19px]" fill="none" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  </svg>
                </button>
                {auth && profileHref ? (
                  <>
                    <MobileProfileDrawer
                      avatarInitial={avatarInitial}
                      avatarUrl={auth.avatarUrl}
                      displayName={displayName}
                      profileHref={auth.publicProfileHref ?? profileHref}
                      roleLabel={roleLabel}
                      signOutAction={signOutAction}
                    />
                    <ProfileMenu
                      auth={auth}
                      avatarInitial={avatarInitial}
                      displayName={displayName}
                      profileHref={profileHref}
                      roleLabel={roleLabel}
                    />
                  </>
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
      <div className={showMobileBottomNav ? "pb-[calc(70px+env(safe-area-inset-bottom))] md:pb-0" : undefined}>
        {children}
      </div>
      {showMobileBottomNav ? <MobileBottomNavigation items={mobileNavItems} /> : null}
    </div>
  );
}
