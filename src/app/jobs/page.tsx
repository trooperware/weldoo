import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { JobApplyButton } from "@/components/jobs/job-apply-button";
import { JobSaveButton } from "@/components/jobs/job-save-button";
import { EmptyState } from "@/components/ui";
import { getAppShellAuth } from "@/lib/auth/session";
import {
  getApplicationForCurrentUser,
  getSavedJobForCurrentUser,
} from "@/lib/jobs/applications";
import {
  getJobsHref,
  getJobsListing,
  hasActiveJobFilters,
  getPublishedJobById,
  parseJobFilters,
  type JobFilters,
  type JobListItem,
} from "@/lib/jobs/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  description: "Browse welding and industrial job opportunities on Weldoo.",
  title: "Jobs | Weldoo",
};

type JobsPageProps = {
  searchParams: Promise<{
    company?: string;
    contractType?: string;
    experience?: string;
    location?: string;
    process?: string;
    q?: string;
    travel?: string;
    workMode?: string;
    job?: string;
  }>;
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

function formatSalary(job: JobListItem) {
  if (!job.salary_min && !job.salary_max) return null;
  const formatter = new Intl.NumberFormat("en", {
    currency: job.salary_currency || "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  });

  if (job.salary_min && job.salary_max) {
    return `${formatter.format(job.salary_min)} - ${formatter.format(job.salary_max)}`;
  }

  if (job.salary_min) return `From ${formatter.format(job.salary_min)}`;
  return `Up to ${formatter.format(job.salary_max ?? 0)}`;
}

function formatPostedDate(value: string | null, fallback: string) {
  const date = new Date(value ?? fallback);
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function clearFilterHref(filters: JobFilters, key: keyof JobFilters) {
  return getJobsHref({ ...filters, [key]: undefined });
}

function getJobSelectionHref(filters: JobFilters, jobId: string) {
  const baseHref = getJobsHref(filters);
  const separator = baseHref.includes("?") ? "&" : "?";
  return `${baseHref}${separator}job=${jobId}`;
}

function ShareIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function MoreIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

function MonitorIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="14" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" width="20" x="2" y="3" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function ClockIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function EuroIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M14 2a6 6 0 0 0 0 12M4 9h7M4 13h7M14 22a6 6 0 0 0 0-12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function BriefcaseIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="14" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" width="20" x="2" y="7" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function DetailPill({
  children,
  icon,
}: {
  children: string;
  icon: ReactNode;
}) {
  return (
    <span className="inline-flex h-[30px] items-center gap-[5px] rounded-full border-[1.5px] border-weldoo-border px-3.5 text-[12.5px] font-medium text-weldoo-ink">
      {icon}
      {children}
    </span>
  );
}

function FilterLink({
  active,
  children,
  href,
}: {
  active: boolean;
  children: string;
  href: string;
}) {
  return (
    <Link
      className={[
        "inline-flex h-8 items-center rounded-full border-[1.5px] px-3 text-[12.5px] font-medium tracking-[-0.01em] shadow-weldoo-sm transition",
        active
          ? "border-weldoo-indigo bg-weldoo-indigo/[0.08] font-semibold text-weldoo-indigo"
          : "border-weldoo-border-light bg-white text-weldoo-ink hover:border-[#c8c8e4] hover:text-weldoo-indigo",
      ].join(" ")}
      href={href}
    >
      {children}
    </Link>
  );
}

function ActiveFilterPills({ filters }: { filters: JobFilters }) {
  const pills = [
    filters.query ? ["query", `Search: ${filters.query}`] : null,
    filters.location ? ["location", `Location: ${filters.location}`] : null,
    filters.process ? ["process", `Process: ${filters.process}`] : null,
    filters.contractType
      ? ["contractType", contractTypeLabels[filters.contractType] ?? filters.contractType]
      : null,
    filters.workMode ? ["workMode", workModeLabels[filters.workMode] ?? filters.workMode] : null,
    filters.travelRequired === "true" ? ["travelRequired", "Travel required"] : null,
    filters.experienceLevel ? ["experienceLevel", `Experience: ${filters.experienceLevel}`] : null,
    filters.company ? ["company", `Company: ${filters.company}`] : null,
  ].filter(Boolean) as Array<[keyof JobFilters, string]>;

  if (!pills.length) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {pills.map(([key, label]) => (
        <Link
          className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-weldoo-indigo/20 bg-weldoo-indigo/[0.08] px-3 text-xs font-semibold text-weldoo-indigo"
          href={clearFilterHref(filters, key)}
          key={key}
        >
          {label}
          <span className="text-sm leading-none opacity-70">x</span>
        </Link>
      ))}
      <Link
        className="inline-flex h-[26px] items-center rounded-full px-2 text-xs font-semibold text-weldoo-muted hover:text-weldoo-indigo"
        href="/jobs"
      >
        Clear all
      </Link>
    </div>
  );
}

function JobLogo({ job }: { job: JobListItem }) {
  const company = job.company;
  const initial = company?.name?.slice(0, 1).toUpperCase() ?? "W";

  return (
    <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-weldoo-border-light bg-white text-xl font-extrabold text-weldoo-indigo">
      {company?.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="h-full w-full object-contain" src={company.logo_url} />
      ) : (
        initial
      )}
    </div>
  );
}

function JobDetailPanel({
  application,
  isSaved,
  job,
  profileType,
}: {
  application: { created_at: string; status: string } | null;
  isSaved: boolean;
  job: JobListItem | null;
  profileType?: string | null;
}) {
  if (!job) {
    return (
      <div className="hidden min-h-[520px] flex-col items-center justify-center gap-3 p-8 text-center text-weldoo-muted lg:flex">
        <svg aria-hidden="true" className="h-14 w-14 opacity-25" fill="none" viewBox="0 0 24 24">
          <rect height="14" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" width="20" x="2" y="7" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <line x1="12" x2="12" y1="12" y2="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <line x1="10" x2="14" y1="14" y2="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
        <p className="max-w-[220px] text-sm leading-[1.6]">
          Select a job from the list to see the full details
        </p>
      </div>
    );
  }

  const salary = formatSalary(job);
  const companyName = job.company?.name ?? "Weldoo company";
  const companyLocation = job.company?.location ?? job.location;

  return (
    <div className="px-5 py-6 lg:max-h-[calc(100vh-64px)] lg:overflow-y-auto lg:px-8 lg:py-7">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-weldoo-border-light bg-white text-xl font-extrabold text-weldoo-indigo">
            {job.company?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-full w-full object-contain" src={job.company.logo_url} />
            ) : (
              companyName.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-weldoo-ink">{companyName}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-weldoo-muted">
              <svg aria-hidden="true" className="h-[13px] w-[13px]" fill="none" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
              <span>{companyLocation ?? "Location not set"}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-weldoo-border-light bg-transparent text-weldoo-muted opacity-60"
            disabled
            title="Share"
            type="button"
          >
            <ShareIcon />
          </button>
          <Link
            className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-weldoo-border-light text-weldoo-muted transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
            href={`/jobs/${job.id}`}
            title="Open job page"
          >
            <MoreIcon />
          </Link>
        </div>
      </div>

      <h2 className="mb-2 text-2xl font-extrabold leading-[1.2] tracking-[-0.4px] text-weldoo-ink">
        {job.title}
      </h2>
      <p className="mb-4 text-[13px] leading-[1.7] text-weldoo-muted">
        {job.location ?? companyLocation ?? "Location not set"} · Posted{" "}
        {formatPostedDate(job.published_at, job.created_at)}
        {job.contract_type ? ` · ${contractTypeLabels[job.contract_type]}` : ""}
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {job.work_mode ? (
          <DetailPill icon={<MonitorIcon />}>
            {workModeLabels[job.work_mode]}
          </DetailPill>
        ) : null}
        {job.contract_type ? (
          <DetailPill icon={<ClockIcon />}>
            {contractTypeLabels[job.contract_type]}
          </DetailPill>
        ) : null}
        {salary ? (
          <DetailPill icon={<EuroIcon />}>
            {salary}
          </DetailPill>
        ) : null}
        {job.travel_required ? (
          <DetailPill icon={<BriefcaseIcon />}>
            Travel required
          </DetailPill>
        ) : null}
      </div>

      <div className="mb-5 flex items-center gap-2">
        <JobApplyButton
          existingApplication={
            application
              ? { createdAt: application.created_at, status: application.status }
              : null
          }
          jobId={job.id}
          profileType={profileType}
        />
        <JobSaveButton
          initialSaved={isSaved}
          jobId={job.id}
          signedIn={Boolean(profileType)}
        />
      </div>

      <div className="my-5 h-px bg-weldoo-border-light" />
      <section>
        <h3 className="mb-3 text-base font-bold tracking-[-0.15px] text-weldoo-ink">
          About the role
        </h3>
        <p className="whitespace-pre-line text-sm leading-[1.75] text-weldoo-ink">
          {job.description}
        </p>
      </section>

      {job.responsibilities ? (
        <>
          <div className="my-5 h-px bg-weldoo-border-light" />
          <section>
            <h3 className="mb-3 text-base font-bold tracking-[-0.15px] text-weldoo-ink">
              Responsibilities
            </h3>
            <p className="whitespace-pre-line text-sm leading-[1.75] text-weldoo-ink">
              {job.responsibilities}
            </p>
          </section>
        </>
      ) : null}

      {job.requirements ? (
        <>
          <div className="my-5 h-px bg-weldoo-border-light" />
          <section>
            <h3 className="mb-3 text-base font-bold tracking-[-0.15px] text-weldoo-ink">
              Requirements
            </h3>
            <p className="whitespace-pre-line text-sm leading-[1.75] text-weldoo-ink">
              {job.requirements}
            </p>
          </section>
        </>
      ) : null}

      {job.benefits.length ? (
        <>
          <div className="my-5 h-px bg-weldoo-border-light" />
          <section>
            <h3 className="mb-3 text-base font-bold tracking-[-0.15px] text-weldoo-ink">
              Benefits
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {job.benefits.map((benefit) => (
                <div className="flex items-center gap-2 text-[13.5px] text-weldoo-ink" key={benefit}>
                  <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-weldoo-indigo/10 text-weldoo-indigo">
                    <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </span>
                  {benefit}
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <div className="mt-5 rounded-weldoo-md border border-weldoo-indigo/15 bg-weldoo-indigo/[0.04] px-4 py-4">
        <h3 className="mb-2 text-[13.5px] font-bold text-weldoo-ink">
          Welding match fields
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {[...job.welding_processes, ...job.materials, ...job.required_certifications].map((tag) => (
            <span className="inline-flex h-[30px] items-center rounded-full border border-weldoo-indigo/20 bg-weldoo-indigo/[0.07] px-3 text-[12.5px] font-medium text-weldoo-indigo" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function JobCard({
  active,
  filters,
  job,
}: {
  active: boolean;
  filters: JobFilters;
  job: JobListItem;
}) {
  const tags = [
    ...job.welding_processes.slice(0, 2),
    ...job.required_certifications.slice(0, 1),
  ];
  const salary = formatSalary(job);

  return (
    <Link
      className={[
        "relative flex items-start gap-3 border-b border-weldoo-border-light px-[18px] py-3.5 transition hover:bg-weldoo-bg-strong",
        active ? "bg-weldoo-indigo/[0.06] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:rounded-r-sm before:bg-weldoo-indigo" : "",
      ].join(" ")}
      href={getJobSelectionHref(filters, job.id)}
    >
      <JobLogo job={job} />
      <div className="min-w-0 flex-1">
        <h2 className="mb-[3px] truncate text-sm font-bold text-weldoo-ink transition group-hover:text-weldoo-indigo">
          {job.title}
        </h2>
        <p className="mb-px text-[12.5px] font-medium text-weldoo-ink">
          {job.company?.name ?? "Weldoo company"}
        </p>
        <p className="mb-1.5 flex items-center gap-1 text-xs text-weldoo-muted">
          <svg aria-hidden="true" className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          </svg>
          <span>
            {job.location ?? job.company?.location ?? "Location not set"}
            {job.work_mode ? ` · ${workModeLabels[job.work_mode]}` : ""}
          </span>
        </p>
        {tags.length ? (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                className="rounded-full bg-weldoo-bg-strong px-2 py-0.5 text-[11px] font-medium text-weldoo-ink"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <p className="mt-1.5 text-[11px] text-weldoo-muted">
          Posted {formatPostedDate(job.published_at, job.created_at)}
          {job.contract_type ? ` · ${contractTypeLabels[job.contract_type]}` : ""}
          {salary ? ` · ${salary}` : ""}
        </p>
      </div>
    </Link>
  );
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const [params, appShellAuth] = await Promise.all([
    searchParams,
    getAppShellAuth(),
  ]);
  const filters = parseJobFilters(params);
  const supabase = await createSupabaseServerClient();
  const listing = await getJobsListing(supabase, filters);
  const selectedJobId = params.job?.trim();
  const selectedJob =
    listing.items.find((job) => job.id === selectedJobId) ??
    (selectedJobId ? await getPublishedJobById(supabase, selectedJobId) : listing.items[0] ?? null);
  const selectedApplication =
    selectedJob && appShellAuth?.profileType === "professional" && appShellAuth.profileId
      ? await getApplicationForCurrentUser(supabase, selectedJob.id, appShellAuth.profileId)
      : null;
  const selectedSavedJob =
    selectedJob && appShellAuth?.profileId
      ? await getSavedJobForCurrentUser(supabase, selectedJob.id, appShellAuth.profileId)
      : null;

  return (
    <AppShell auth={appShellAuth}>
      <main className="mx-auto max-w-[1128px] px-4 pb-20 pt-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[18px] font-extrabold tracking-[-0.3px] text-weldoo-ink">
            Jobs in Spain
            <span className="ml-2 text-sm font-medium text-weldoo-muted">
              {listing.totalCount} results
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <form action="/jobs" className="flex h-10 w-[220px] items-center gap-2 rounded-full border-[1.5px] border-weldoo-border-light bg-white px-4 shadow-weldoo-sm transition focus-within:border-weldoo-indigo focus-within:shadow-[0_0_0_3px_rgba(61,61,180,0.09)]">
              {filters.location ? <input name="location" type="hidden" value={filters.location} /> : null}
              {filters.process ? <input name="process" type="hidden" value={filters.process} /> : null}
              {filters.contractType ? <input name="contractType" type="hidden" value={filters.contractType} /> : null}
              {filters.workMode ? <input name="workMode" type="hidden" value={filters.workMode} /> : null}
              {filters.travelRequired ? <input name="travel" type="hidden" value={filters.travelRequired} /> : null}
              {filters.experienceLevel ? <input name="experience" type="hidden" value={filters.experienceLevel} /> : null}
              {filters.company ? <input name="company" type="hidden" value={filters.company} /> : null}
              <svg aria-hidden="true" className="h-[15px] w-[15px] shrink-0 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <input
                className="min-w-0 flex-1 bg-transparent text-[13px] text-weldoo-ink outline-none placeholder:text-[#b0b0cc]"
                defaultValue={filters.query ?? ""}
                name="q"
                placeholder="Search jobs..."
                type="search"
              />
            </form>

            <FilterLink
              active={filters.workMode === "remote"}
              href={getJobsHref({ ...filters, workMode: filters.workMode === "remote" ? undefined : "remote" })}
            >
              Remote
            </FilterLink>
            <FilterLink
              active={filters.workMode === "hybrid"}
              href={getJobsHref({ ...filters, workMode: filters.workMode === "hybrid" ? undefined : "hybrid" })}
            >
              Hybrid
            </FilterLink>
            <FilterLink
              active={filters.workMode === "on_site"}
              href={getJobsHref({ ...filters, workMode: filters.workMode === "on_site" ? undefined : "on_site" })}
            >
              On-site
            </FilterLink>
            <details className="relative">
              <summary className="inline-flex h-8 cursor-pointer list-none items-center rounded-full border-[1.5px] border-weldoo-border-light bg-white px-3 text-[12.5px] font-medium tracking-[-0.01em] text-weldoo-ink shadow-weldoo-sm transition hover:border-[#c8c8e4] hover:text-weldoo-indigo">
                More filters
              </summary>
              <div className="absolute right-0 top-10 z-20 w-[min(760px,calc(100vw-32px))] rounded-weldoo-md border border-weldoo-border-light bg-white p-4 shadow-weldoo-lg">
                <form action="/jobs" className="grid gap-3 md:grid-cols-4">
                  {filters.query ? <input name="q" type="hidden" value={filters.query} /> : null}
                  {filters.workMode ? <input name="workMode" type="hidden" value={filters.workMode} /> : null}
                  <input className="h-10 rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 text-sm outline-none" defaultValue={filters.location ?? ""} name="location" placeholder="Location" />
                  <input className="h-10 rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 text-sm outline-none" defaultValue={filters.process ?? ""} name="process" placeholder="Welding process" />
                  <input className="h-10 rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 text-sm outline-none" defaultValue={filters.company ?? ""} name="company" placeholder="Company" />
                  <select className="h-10 rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 text-sm outline-none" defaultValue={filters.contractType ?? ""} name="contractType">
                    <option value="">Any contract</option>
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                    <option value="freelance">Freelance</option>
                  </select>
                  <select className="h-10 rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 text-sm outline-none" defaultValue={filters.travelRequired ?? ""} name="travel">
                    <option value="">Any travel</option>
                    <option value="true">Travel required</option>
                    <option value="false">No travel required</option>
                  </select>
                  <input className="h-10 rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 text-sm outline-none" defaultValue={filters.experienceLevel ?? ""} name="experience" placeholder="Experience level" />
                  <button className="h-10 rounded-weldoo-sm bg-weldoo-indigo px-4 text-sm font-semibold text-white" type="submit">
                    Apply filters
                  </button>
                </form>
              </div>
            </details>
          </div>
        </div>

        <ActiveFilterPills filters={filters} />

        <section className="grid overflow-hidden rounded-[16px] border border-weldoo-border-light bg-white shadow-weldoo-sm lg:grid-cols-[40%_60%]">
          <div className="border-b border-weldoo-border-light lg:border-b-0 lg:border-r">
            {listing.items.length ? (
              <div>
                {listing.items.map((job) => (
                  <JobCard
                    active={job.id === selectedJob?.id}
                    filters={filters}
                    job={job}
                    key={job.id}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6">
                <EmptyState
                  description={
                    hasActiveJobFilters(filters)
                      ? "Try clearing filters or searching for a broader welding process, company, or location."
                      : "Published jobs will appear here once companies start posting opportunities."
                  }
                  title="No jobs found"
                />
              </div>
            )}
          </div>
          <JobDetailPanel
            application={selectedApplication}
            isSaved={Boolean(selectedSavedJob)}
            job={selectedJob}
            profileType={appShellAuth?.profileType}
          />
        </section>
      </main>
    </AppShell>
  );
}
