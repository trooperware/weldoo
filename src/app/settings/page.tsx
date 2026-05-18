import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { getAppShellAuth } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Settings | Weldoo",
};

export default async function SettingsPage() {
  const appShellAuth = await getAppShellAuth();

  return (
    <AppShell auth={appShellAuth}>
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-[960px]">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-weldoo-indigo">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-weldoo-ink">
              Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-weldoo-muted">
              Account settings are scaffolded here so the profile menu matches the
              prototype. Editable preferences will be connected in the later settings and
              notifications tasks.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <nav className="rounded-weldoo-md border border-weldoo-border-light bg-white p-2 shadow-weldoo-sm">
              {["Account", "Notifications", "Privacy", "Appearance", "Subscription"].map(
                (item, index) => (
                  <button
                    className={[
                      "flex h-10 w-full items-center rounded-weldoo-sm px-3 text-left text-[13.2px] transition",
                      index === 0
                        ? "bg-weldoo-indigo/10 font-semibold text-weldoo-indigo"
                        : "font-medium text-weldoo-slate hover:bg-weldoo-bg hover:text-weldoo-indigo",
                    ].join(" ")}
                    key={item}
                    type="button"
                  >
                    {item}
                  </button>
                ),
              )}
            </nav>

            <div className="rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm">
              <div className="border-b border-weldoo-border-light px-5 py-4">
                <h2 className="text-[15.4px] font-bold text-weldoo-ink">
                  Account information
                </h2>
                <p className="mt-1 text-[12.1px] text-weldoo-muted">
                  Manage your profile and account details.
                </p>
              </div>
              <div className="divide-y divide-weldoo-border-light">
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-[13.2px] font-medium text-weldoo-ink">
                      Public profile
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-weldoo-muted">
                      Review how other members see you.
                    </p>
                  </div>
                  <Link
                    className="inline-flex h-9 items-center justify-center rounded-weldoo-sm border border-weldoo-border-light bg-white px-4 text-sm font-semibold text-weldoo-slate transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
                    href={appShellAuth?.publicProfileHref ?? "/dashboard"}
                  >
                    View profile
                  </Link>
                </div>
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-[13.2px] font-medium text-weldoo-ink">
                      Edit profile
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-weldoo-muted">
                      Update your visible Weldoo profile information.
                    </p>
                  </div>
                  <Link
                    className="inline-flex h-9 items-center justify-center rounded-weldoo-sm bg-weldoo-indigo px-4 text-sm font-semibold text-white shadow-weldoo-md transition hover:brightness-105"
                    href={
                      appShellAuth?.profileType === "company"
                        ? "/company/edit"
                        : appShellAuth?.profileType === "training_provider"
                          ? "/training-provider/edit"
                          : "/profile/edit"
                    }
                  >
                    Edit
                  </Link>
                </div>
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-[13.2px] font-medium text-weldoo-ink">
                      Saved jobs
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-weldoo-muted">
                      Review jobs you saved from the jobs board.
                    </p>
                  </div>
                  <Link
                    className="inline-flex h-9 items-center justify-center rounded-weldoo-sm border border-weldoo-border-light bg-white px-4 text-sm font-semibold text-weldoo-slate transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
                    href="/saved/jobs"
                  >
                    Open
                  </Link>
                </div>
                {appShellAuth?.profileType === "company" ? (
                  <>
                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-[13.2px] font-medium text-weldoo-ink">
                        Company jobs
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-weldoo-muted">
                        Create, publish, close, and reopen your offers.
                      </p>
                    </div>
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-weldoo-sm border border-weldoo-border-light bg-white px-4 text-sm font-semibold text-weldoo-slate transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
                      href="/company/jobs"
                    >
                      Manage
                    </Link>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-[13.2px] font-medium text-weldoo-ink">
                        Job applications
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-weldoo-muted">
                        Review candidates and update application status.
                      </p>
                    </div>
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-weldoo-sm border border-weldoo-border-light bg-white px-4 text-sm font-semibold text-weldoo-slate transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
                      href="/company/applications"
                    >
                      Review
                    </Link>
                  </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
