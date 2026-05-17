import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/ui";
import { getAppShellAuth } from "@/lib/auth/session";
import {
  getJobsHref,
  getJobsListing,
  hasActiveJobFilters,
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

function JobCard({ job }: { job: JobListItem }) {
  const tags = [
    ...job.welding_processes.slice(0, 2),
    ...job.required_certifications.slice(0, 1),
  ];
  const salary = formatSalary(job);

  return (
    <article className="relative flex items-start gap-3 border-b border-weldoo-border-light px-[18px] py-3.5 transition hover:bg-weldoo-bg-strong">
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
    </article>
  );
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const [params, appShellAuth] = await Promise.all([searchParams, getAppShellAuth()]);
  const filters = parseJobFilters(params);
  const supabase = await createSupabaseServerClient();
  const listing = await getJobsListing(supabase, filters);

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
                  <JobCard job={job} key={job.id} />
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
          <div className="hidden min-h-[520px] flex-col items-center justify-center gap-3 p-8 text-center text-weldoo-muted lg:flex">
            <svg aria-hidden="true" className="h-14 w-14 opacity-25" fill="none" viewBox="0 0 24 24">
              <rect height="14" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" width="20" x="2" y="7" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              <line x1="12" x2="12" y1="12" y2="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              <line x1="10" x2="14" y1="14" y2="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
            <p className="max-w-[220px] text-sm leading-[1.6]">
              Select a job from the list to see the full details in Task 4.2
            </p>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
