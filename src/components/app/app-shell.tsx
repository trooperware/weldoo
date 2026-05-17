import Link from "next/link";
import type { ReactNode } from "react";

import { WeldooLogo } from "@/components/auth/auth-card";
import { signOutAction } from "@/server/actions/auth";

type AppShellProps = {
  auth?: {
    email?: string | null;
    profileType?: string | null;
  };
  children: ReactNode;
};

const mainNavItems = [
  { label: "Network", href: "/" },
  { label: "Events", href: "/" },
  { label: "Jobs", href: "/" },
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
                <button className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo" type="button">
                  <svg aria-hidden="true" className="h-[19px] w-[19px]" fill="none" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  </svg>
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-weldoo-indigo px-[3px] text-[9px] font-bold leading-none text-white">3</span>
                </button>
                <button className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo" type="button">
                  <svg aria-hidden="true" className="h-[19px] w-[19px]" fill="none" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  </svg>
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-weldoo-indigo px-[3px] text-[9px] font-bold leading-none text-white">7</span>
                </button>
                {profileHref ? (
                  <Link
                    className="ml-1 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-[13px] font-bold text-white shadow-[0_2px_8px_rgba(61,61,180,0.25)] transition hover:scale-[1.03] hover:shadow-weldoo-md"
                    href={profileHref}
                  >
                    {(auth?.email ?? "D").slice(0, 1).toUpperCase()}
                  </Link>
                ) : null}
                <form action={signOutAction} className="hidden">
                  <button
                    className="inline-flex h-9 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border)] bg-white px-3 text-sm font-semibold text-[var(--weldoo-slate)] shadow-weldoo-sm transition hover:border-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo)]"
                    type="submit"
                  >
                    Sign out
                  </button>
                </form>
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
