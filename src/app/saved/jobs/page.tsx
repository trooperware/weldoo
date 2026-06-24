import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/ui";
import { getAppShellAuth, requireCompletedOnboarding } from "@/lib/auth/session";
import { getSavedJobsForCurrentUser } from "@/lib/jobs/applications";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Saved jobs | Weldoo",
};

const contractTypeLabels: Record<string, string> = {
  contract: "Contract",
  freelance: "Freelance",
  full_time: "Full-time",
  part_time: "Part-time",
  temporary: "Temporary",
};

const workModeLabels: Record<string, string> = {
  hybrid: "Hybrid",
  on_site: "On-site",
  remote: "Remote",
};

function formatDate(value: string | null, fallback: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(value ?? fallback));
}

export default async function SavedJobsPage() {
  const { profile } = await requireCompletedOnboarding();
  const [appShellAuth, supabase] = await Promise.all([
    getAppShellAuth(),
    createSupabaseServerClient(),
  ]);
  const savedJobs = await getSavedJobsForCurrentUser(supabase, profile.id);

  return (
    <AppShell auth={appShellAuth}>
      <main className="mx-auto max-w-[960px] px-4 pb-20 pt-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-weldoo-indigo">
              Saved jobs
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-weldoo-ink">
              Saved job opportunities
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-weldoo-muted">
              Keep interesting jobs here while you compare offers or prepare an application.
            </p>
          </div>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-full border border-weldoo-border-light bg-white px-4 text-[12px] font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
            href="/jobs"
          >
            Browse jobs
          </Link>
        </div>

        {savedJobs.length ? (
          <div className="grid gap-4">
            {savedJobs.map((item) => {
              const job = item.job;
              const company = job.company;

              return (
                <Link
                  className="rounded-[16px] border border-weldoo-border-light bg-white p-5 shadow-weldoo-sm transition hover:border-weldoo-indigo/40 hover:shadow-weldoo-md"
                  href={`/jobs/${job.id}`}
                  key={item.id}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-weldoo-border-light bg-white text-lg font-extrabold text-weldoo-indigo">
                      {company?.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="" className="h-full w-full object-contain" src={company.logo_url} />
                      ) : (
                        company?.name?.slice(0, 1).toUpperCase() ?? "W"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-base font-extrabold text-weldoo-ink">
                        {job.title}
                      </h2>
                      <p className="mt-1 text-[13px] font-medium text-weldoo-ink">
                        {company?.name ?? "Weldoo company"}
                      </p>
                      <p className="mt-1 text-[12px] text-weldoo-muted">
                        {job.location ?? company?.location ?? "Location not set"}
                        {job.work_mode ? ` · ${workModeLabels[job.work_mode]}` : ""}
                        {job.contract_type ? ` · ${contractTypeLabels[job.contract_type]}` : ""}
                        {" · "}Posted {formatDate(job.published_at, job.created_at)}
                      </p>
                      {job.welding_processes.length ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {job.welding_processes.slice(0, 4).map((tag) => (
                            <span
                              className="rounded-full bg-weldoo-indigo/10 px-2.5 py-1 text-[11px] font-semibold text-weldoo-indigo"
                              key={tag}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[16px] border border-weldoo-border-light bg-white p-6 shadow-weldoo-sm">
            <EmptyState
              description="Save jobs from the jobs board to review them later."
              title="No saved jobs yet"
            />
          </div>
        )}
      </main>
    </AppShell>
  );
}
