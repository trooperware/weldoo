import Link from "next/link";
import type { ReactNode } from "react";

import { signOutAction } from "@/server/actions/auth";

type AppShellProps = {
  auth?: {
    email?: string | null;
    profileType?: string | null;
  };
  children: ReactNode;
};

const mainNavItems = [
  { label: "Feed", href: "/" },
  { label: "Network", href: "/" },
  { label: "Jobs", href: "/" },
  { label: "Academy", href: "/" },
];

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
    <div className="min-h-screen bg-[var(--weldoo-bg)] text-[var(--weldoo-ink)]">
      <header className="border-b border-[var(--weldoo-border)] bg-white/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link className="flex min-w-0 items-center gap-3" href="/">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--weldoo-radius-sm)] bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-sm font-bold text-white shadow-weldoo-sm">
                W
              </span>
              <span className="min-w-0">
                <span className="block text-base font-bold leading-5">Weldoo</span>
                <span className="block truncate text-xs font-medium text-[var(--weldoo-muted)]">
                  Professional network for welders
                </span>
              </span>
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

          <nav aria-label="Main navigation" className="overflow-x-auto">
            <ul className="flex min-w-max gap-2">
              {mainNavItems.map((item) => (
                <li key={item.label}>
                  <Link
                    className="inline-flex h-9 items-center rounded-[var(--weldoo-radius-sm)] px-3 text-sm font-semibold text-[var(--weldoo-slate)] transition hover:bg-[var(--weldoo-bg)] hover:text-[var(--weldoo-indigo)]"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {isSignedIn ? (
              <>
                <span className="max-w-44 truncate text-sm font-semibold text-[var(--weldoo-muted)]">
                  {auth?.email}
                </span>
                <Link
                  className="inline-flex h-9 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border)] bg-white px-3 text-sm font-semibold text-[var(--weldoo-slate)] shadow-weldoo-sm transition hover:border-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo)]"
                  href="/dashboard"
                >
                  Dashboard
                </Link>
                {profileHref ? (
                  <Link
                    className="inline-flex h-9 items-center justify-center rounded-[var(--weldoo-radius-sm)] bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] px-3 text-sm font-semibold text-white shadow-weldoo-sm transition hover:brightness-105"
                    href={profileHref}
                  >
                    Profile
                  </Link>
                ) : null}
                <form action={signOutAction}>
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
                <Link
                  className="inline-flex h-9 items-center justify-center rounded-[var(--weldoo-radius-sm)] bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] px-3 text-sm font-semibold text-white shadow-weldoo-sm transition hover:brightness-105"
                  href="/style-guide"
                >
                  Style guide
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
