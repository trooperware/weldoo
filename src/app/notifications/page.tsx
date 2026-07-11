import type { Metadata } from "next";

import { AppShell } from "@/components/app/app-shell";
import { getAppShellAuth, requireCompletedOnboarding } from "@/lib/auth/session";
import {
  formatNotificationTime,
  getNotificationDropdownData,
} from "@/lib/notifications/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Notifications | Weldoo",
};

export default async function NotificationsPage() {
  const [{ profile }, appShellAuth] = await Promise.all([
    requireCompletedOnboarding(),
    getAppShellAuth(),
  ]);
  const notificationData = await getNotificationDropdownData(
    await createSupabaseServerClient(),
    profile.id,
  );
  const unreadCount = notificationData.unreadCount;

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
              Review updates from your network, messages, jobs, and academy activity.
            </p>
          </div>

          <div className="rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-weldoo-border-light px-5 py-4">
              <div>
                <h2 className="text-[15.4px] font-bold text-weldoo-ink">
                Notification center
                </h2>
                <p className="mt-1 text-[12.1px] text-weldoo-muted">
                  Signed in as {profile.display_name ?? "Weldoo member"}.
                </p>
              </div>
              <button
                className="inline-flex h-8 items-center rounded-full border border-weldoo-border-light bg-white px-3 text-[12.1px] font-semibold text-weldoo-muted shadow-weldoo-sm"
                disabled
                type="button"
              >
                Use the header menu to mark all as read
              </button>
            </div>
            <div className="divide-y divide-weldoo-border-light">
              {notificationData.items.length ? (
                notificationData.items.map((item) => (
                  <article
                    className={[
                      "relative flex items-start gap-3 px-5 py-4",
                      !item.readAt
                        ? "bg-weldoo-indigo/[0.03] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:rounded-r-sm before:bg-weldoo-indigo"
                        : "",
                    ].join(" ")}
                    key={item.id}
                  >
                    <span
                      className="flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#3d3db4,#7b7fe8)] text-[13.2px] font-bold text-white"
                    >
                      {item.actorAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="" className="h-full w-full object-cover" src={item.actorAvatarUrl} />
                      ) : (
                        item.actorInitials ?? "N"
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.2px] leading-[1.5] text-weldoo-ink">
                        <strong>{item.title}</strong>
                        {item.body ? ` ${item.body}` : ""}
                      </span>
                      <span className="mt-[3px] block text-[11px] font-medium text-weldoo-muted">
                        {formatNotificationTime(item.createdAt)}
                      </span>
                    </span>
                    {!item.readAt ? (
                      <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-weldoo-indigo" />
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-weldoo-bg-strong text-weldoo-indigo">
                    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                  </span>
                  <h3 className="mt-4 text-[15.4px] font-bold text-weldoo-ink">
                    No notifications yet
                  </h3>
                  <p className="mt-1 max-w-sm text-[13.2px] leading-6 text-weldoo-muted">
                    Updates about messages, jobs, academy events, and your network will appear here.
                  </p>
                </div>
              )}
            </div>
            <div className="border-t border-weldoo-border-light px-5 py-3 text-[12.1px] font-medium text-weldoo-muted">
              {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}.
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
