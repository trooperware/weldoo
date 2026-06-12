import type { Metadata } from "next";

import { AppShell } from "@/components/app/app-shell";
import { getAppShellAuth, requireCompletedOnboarding } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Notifications | Weldoo",
};

export default async function NotificationsPage() {
  const [{ profile }, appShellAuth] = await Promise.all([
    requireCompletedOnboarding(),
    getAppShellAuth(),
  ]);

  return (
    <AppShell auth={appShellAuth}>
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-[960px]">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-weldoo-indigo">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-weldoo-ink">
              Notifications
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-weldoo-muted">
              Notification infrastructure is prepared as a route and visual entry point.
              Real notification delivery will be connected in a later task.
            </p>
          </div>

          <div className="rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm">
            <div className="border-b border-weldoo-border-light px-5 py-4">
              <h2 className="text-[15.4px] font-bold text-weldoo-ink">
                Notification center
              </h2>
              <p className="mt-1 text-[12.1px] text-weldoo-muted">
                Signed in as {profile.display_name ?? "Weldoo member"}.
              </p>
            </div>
            <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-weldoo-bg-strong text-weldoo-indigo">
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
              </span>
              <h3 className="mt-4 text-[15.4px] font-bold text-weldoo-ink">
                No notifications yet
              </h3>
              <p className="mt-1 max-w-sm text-[13.2px] leading-6 text-weldoo-muted">
                This page exists so the header action already has a valid URL. The
                notification list will be connected when the notifications data model is
                implemented.
              </p>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
