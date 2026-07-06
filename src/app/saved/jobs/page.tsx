import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/ui";
import { getAppShellAuth, requireCompletedOnboarding } from "@/lib/auth/session";
import {
  getAppliedJobsForCurrentUser,
  getSavedJobsForCurrentUser,
  type AppliedJobItem,
  type SavedJobItem,
} from "@/lib/jobs/applications";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My jobs | Weldoo",
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

const applicationStatusLabels: Record<string, string> = {
  contacted: "Contacted",
  rejected: "Rejected",
  submitted: "Applied",
  viewed: "Viewed",
};

type JobCardItem = {
  createdAt: string;
  href: string;
  id: string;
  job: SavedJobItem["job"];
  metaLabel: string;
  status?: string;
};

function formatDate(value: string | null, fallback: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(value ?? fallback));
}

function getJobTags(job: SavedJobItem["job"]) {
  const structuredTags = [...job.skills, ...job.tools, ...job.required_certifications];
  const fallbackTags = [...job.welding_processes, ...job.materials, ...job.required_certifications];
  const tags = structuredTags.length ? structuredTags : fallbackTags;

  return [...new Set(tags.filter(Boolean))];
}

function JobSection({
  children,
  count,
  description,
  title,
}: {
  children: ReactNode;
  count: number;
  description: string;
  title: string;
}) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold tracking-[-0.015em] text-weldoo-ink">
            {title}
            <span className="ml-2 text-sm font-medium text-weldoo-muted">
              {count}
            </span>
          </h2>
          <p className="mt-1 text-sm text-weldoo-muted">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function JobActivityCard({ item }: { item: JobCardItem }) {
  const job = item.job;
  const company = job.company;
  const tags = getJobTags(job).slice(0, 4);

  return (
    <Link
      className="block rounded-[16px] border border-weldoo-border-light bg-white p-5 shadow-weldoo-sm transition hover:border-weldoo-indigo/40 hover:shadow-weldoo-md"
      href={item.href}
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
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-extrabold text-weldoo-ink">
                {job.title}
              </h3>
              <p className="mt-1 text-[13px] font-medium text-weldoo-ink">
                {company?.name ?? "Weldoo company"}
              </p>
            </div>
            {item.status ? (
              <span className="inline-flex h-7 shrink-0 items-center rounded-full bg-weldoo-indigo/10 px-3 text-[11px] font-bold text-weldoo-indigo">
                {item.status}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[12px] text-weldoo-muted">
            {job.location ?? company?.location ?? "Location not set"}
            {job.work_mode ? ` · ${workModeLabels[job.work_mode]}` : ""}
            {job.contract_type ? ` · ${contractTypeLabels[job.contract_type]}` : ""}
            {" · "}
            {item.metaLabel} {formatDate(job.published_at, job.created_at)}
          </p>
          {tags.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
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
}

function mapAppliedJob(item: AppliedJobItem): JobCardItem {
  return {
    createdAt: item.created_at,
    href: `/jobs/${item.job.id}`,
    id: item.id,
    job: item.job,
    metaLabel: "Applied",
    status: applicationStatusLabels[item.status] ?? item.status,
  };
}

function mapSavedJob(item: SavedJobItem): JobCardItem {
  return {
    createdAt: item.created_at,
    href: `/jobs/${item.job.id}`,
    id: item.id,
    job: item.job,
    metaLabel: "Saved",
  };
}

export default async function MyJobsPage() {
  const { profile } = await requireCompletedOnboarding();
  const [appShellAuth, supabase] = await Promise.all([
    getAppShellAuth(),
    createSupabaseServerClient(),
  ]);
  const [appliedJobs, savedJobs] = await Promise.all([
    getAppliedJobsForCurrentUser(supabase, profile.id),
    getSavedJobsForCurrentUser(supabase, profile.id),
  ]);
  const appliedItems = appliedJobs.map(mapAppliedJob);
  const savedItems = savedJobs.map(mapSavedJob);
  const hasJobs = appliedItems.length || savedItems.length;

  return (
    <AppShell auth={appShellAuth}>
      <main className="mx-auto max-w-[960px] px-4 pb-20 pt-7">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-weldoo-indigo">
              My Jobs
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-weldoo-ink">
              My Jobs
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-weldoo-muted">
              Track jobs you have applied to and opportunities you saved for later.
            </p>
          </div>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-full border border-weldoo-border-light bg-white px-4 text-[12px] font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
            href="/jobs"
          >
            Browse jobs
          </Link>
        </div>

        {hasJobs ? (
          <div className="grid gap-8">
            <JobSection
              count={appliedItems.length}
              description="Applications you sent through Weldoo."
              title="Applied"
            >
              {appliedItems.length ? (
                <div className="grid gap-4">
                  {appliedItems.map((item) => (
                    <JobActivityCard item={item} key={`applied-${item.id}`} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[16px] border border-weldoo-border-light bg-white p-6 shadow-weldoo-sm">
                  <EmptyState
                    description="Apply from a job detail page and it will appear here."
                    title="No applications yet"
                  />
                </div>
              )}
            </JobSection>

            <JobSection
              count={savedItems.length}
              description="Jobs saved from the board for review later."
              title="Saved"
            >
              {savedItems.length ? (
                <div className="grid gap-4">
                  {savedItems.map((item) => (
                    <JobActivityCard item={item} key={`saved-${item.id}`} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[16px] border border-weldoo-border-light bg-white p-6 shadow-weldoo-sm">
                  <EmptyState
                    description="Save jobs from the jobs board to review them later."
                    title="No saved jobs yet"
                  />
                </div>
              )}
            </JobSection>
          </div>
        ) : (
          <div className="rounded-[16px] border border-weldoo-border-light bg-white p-6 shadow-weldoo-sm">
            <EmptyState
              description="Apply to jobs or save offers from the jobs board to build this list."
              title="No jobs yet"
            />
          </div>
        )}
      </main>
    </AppShell>
  );
}
