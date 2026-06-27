import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { JobApplyButton } from "@/components/jobs/job-apply-button";
import { JobSearchFilter } from "@/components/jobs/job-search-filter";
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
    area?: string | string[];
    company?: string;
    contractType?: string | string[];
    experience?: string;
    location?: string | string[];
    process?: string | string[];
    q?: string;
    travel?: string;
    workMode?: string | string[];
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

type MultiFilterKey = "areas" | "contractTypes" | "locations" | "workModes";

function toggleFilterValueHref(
  filters: JobFilters,
  key: MultiFilterKey,
  value: string,
) {
  const current = (filters[key] ?? []) as string[];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

  return getJobsHref({
    ...filters,
    [key]: next.length ? next : undefined,
  });
}

function removeFilterValueHref(
  filters: JobFilters,
  key: MultiFilterKey,
  value: string,
) {
  const current = (filters[key] ?? []) as string[];

  return getJobsHref({
    ...filters,
    [key]: current.filter((item) => item !== value),
  });
}

function getDynamicLocationOptions(
  jobs: JobListItem[],
  selectedLocations: string[] = [],
) {
  const locationMap = new Map<string, string>();

  [...selectedLocations, ...jobs.flatMap((job) => [job.location, job.company?.location])]
    .filter((location): location is string => Boolean(location?.trim()))
    .forEach((location) => {
      const normalized = location.trim();
      const key = normalized.toLowerCase();

      if (!locationMap.has(key)) {
        locationMap.set(key, normalized);
      }
    });

  return [...locationMap.values()].sort((a, b) => a.localeCompare(b));
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

function LocationIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CheckIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function ChevronDownIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
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

type FilterDropdownOption = {
  active: boolean;
  href: string;
  label: string;
};

function FilterDropdown({
  activeCount = 0,
  align = "left",
  clearHref,
  label,
  options,
}: {
  activeCount?: number;
  align?: "left" | "right";
  clearHref?: string;
  label: string;
  options: FilterDropdownOption[];
}) {
  const active = activeCount > 0;

  return (
    <details className="group relative">
      <summary
        className={[
          "inline-flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-full border-[1.5px] bg-white px-3 text-[12.5px] font-medium tracking-[-0.01em] shadow-weldoo-sm transition marker:content-none",
          active
            ? "border-weldoo-indigo bg-weldoo-indigo/[0.08] font-semibold text-weldoo-indigo"
            : "border-weldoo-border-light text-weldoo-ink hover:border-[#c8c8e4] hover:text-weldoo-indigo",
        ].join(" ")}
      >
        {label}
        {activeCount ? (
          <span className="ml-0.5 inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-weldoo-indigo px-1 text-[10px] font-bold leading-none text-white">
            {activeCount}
          </span>
        ) : null}
        <ChevronDownIcon />
      </summary>
      <div
        className={[
          "absolute top-10 z-30 min-w-[180px] rounded-weldoo-md border-[1.5px] border-weldoo-border-light bg-white py-2 shadow-weldoo-lg",
          align === "right" ? "right-0" : "left-0",
        ].join(" ")}
      >
        {options.map((option) => (
          <Link
            className={[
              "flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-weldoo-ink transition hover:bg-weldoo-bg-strong",
              option.active ? "font-semibold text-weldoo-indigo" : "font-normal",
            ].join(" ")}
            href={option.href}
            key={option.label}
          >
            <span
              className={[
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px]",
                option.active
                  ? "border-weldoo-indigo bg-weldoo-indigo text-white"
                  : "border-weldoo-border-light text-transparent",
              ].join(" ")}
            >
              <CheckIcon />
            </span>
            {option.label}
          </Link>
        ))}
        {clearHref ? (
          <>
            <div className="my-1.5 h-px bg-weldoo-border-light" />
            <Link
              className="block px-4 py-2 text-xs font-medium text-weldoo-muted transition hover:text-weldoo-indigo"
              href={clearHref}
            >
              Clear filter
            </Link>
          </>
        ) : null}
      </div>
    </details>
  );
}

function JobCompactBadge({
  children,
  icon,
}: {
  children: string;
  icon: ReactNode;
}) {
  return (
    <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-weldoo-bg-strong px-2 text-[11px] font-medium text-weldoo-ink">
      {icon}
      {children}
    </span>
  );
}

function ActiveFilterPills({ filters }: { filters: JobFilters }) {
  const pills: Array<{ href: string; label: string }> = [];

  pills.push(
    ...(filters.areas ?? []).map((area) => ({
      href: removeFilterValueHref(filters, "areas", area),
      label: area,
    })),
    ...(filters.locations ?? []).map((location) => ({
      href: removeFilterValueHref(filters, "locations", location),
      label: location,
    })),
    ...(filters.contractTypes ?? []).map((contractType) => ({
      href: removeFilterValueHref(filters, "contractTypes", contractType),
      label: contractTypeLabels[contractType] ?? contractType,
    })),
    ...(filters.workModes ?? []).map((workMode) => ({
      href: removeFilterValueHref(filters, "workModes", workMode),
      label: workModeLabels[workMode] ?? workMode,
    })),
  );

  if (filters.query) {
    pills.push({ href: clearFilterHref(filters, "query"), label: `Search: ${filters.query}` });
  }

  if (filters.travelRequired === "true") {
    pills.push({ href: clearFilterHref(filters, "travelRequired"), label: "Travel required" });
  }

  if (filters.experienceLevel) {
    pills.push({
      href: clearFilterHref(filters, "experienceLevel"),
      label: `Experience: ${filters.experienceLevel}`,
    });
  }

  if (filters.company) {
    pills.push({ href: clearFilterHref(filters, "company"), label: `Company: ${filters.company}` });
  }

  if (!pills.length) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {pills.map((pill) => (
        <Link
          className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-weldoo-indigo/20 bg-weldoo-indigo/[0.08] px-3 text-xs font-semibold text-weldoo-indigo"
          href={pill.href}
          key={`${pill.label}-${pill.href}`}
        >
          {pill.label}
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
    <div className="px-5 py-6 lg:sticky lg:top-16 lg:max-h-[calc(100vh-64px)] lg:overflow-y-auto lg:px-8 lg:py-7">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-weldoo-border-light bg-white text-xl font-extrabold text-weldoo-indigo">
            {job.company?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-11 w-11 rounded-lg object-contain" src={job.company.logo_url} />
            ) : (
              companyName.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-weldoo-ink">{companyName}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-weldoo-muted">
              <LocationIcon className="h-[13px] w-[13px]" />
              <span>{companyLocation ?? "Location not set"}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-weldoo-border-light bg-transparent text-weldoo-muted transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
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
                    <CheckIcon />
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
  const searchText = [
    job.title,
    job.description,
    job.location,
    job.company?.name,
    job.company?.location,
    job.company?.sector,
    job.experience_level,
    workModeLabels[job.work_mode ?? ""],
    contractTypeLabels[job.contract_type ?? ""],
    ...job.welding_processes,
    ...job.materials,
    ...job.required_certifications,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    <Link
      className={[
        "group relative flex items-start gap-3 border-b border-weldoo-border-light px-[18px] py-3.5 transition hover:bg-weldoo-bg-strong",
        active ? "bg-weldoo-indigo/[0.06] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:rounded-r-sm before:bg-weldoo-indigo" : "",
      ].join(" ")}
      data-job-card
      data-search-text={searchText}
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
          <LocationIcon className="h-3 w-3 shrink-0" />
          <span>
            {job.location ?? job.company?.location ?? "Location not set"}
          </span>
        </p>
        <div className="mb-1.5 flex flex-wrap gap-1">
          {job.work_mode ? (
            <JobCompactBadge icon={<MonitorIcon />}>
              {workModeLabels[job.work_mode]}
            </JobCompactBadge>
          ) : null}
          {job.contract_type ? (
            <JobCompactBadge icon={<ClockIcon />}>
              {contractTypeLabels[job.contract_type]}
            </JobCompactBadge>
          ) : null}
          {job.travel_required ? (
            <JobCompactBadge icon={<BriefcaseIcon />}>
              Travel
            </JobCompactBadge>
          ) : null}
        </div>
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
  const workModeOptions: FilterDropdownOption[] = [
    { active: Boolean(filters.workModes?.includes("remote")), href: toggleFilterValueHref(filters, "workModes", "remote"), label: "Remote" },
    { active: Boolean(filters.workModes?.includes("hybrid")), href: toggleFilterValueHref(filters, "workModes", "hybrid"), label: "Hybrid" },
    { active: Boolean(filters.workModes?.includes("on_site")), href: toggleFilterValueHref(filters, "workModes", "on_site"), label: "On-site" },
  ];
  const contractOptions: FilterDropdownOption[] = [
    { active: Boolean(filters.contractTypes?.includes("full_time")), href: toggleFilterValueHref(filters, "contractTypes", "full_time"), label: "Full-time" },
    { active: Boolean(filters.contractTypes?.includes("part_time")), href: toggleFilterValueHref(filters, "contractTypes", "part_time"), label: "Part-time" },
    { active: Boolean(filters.contractTypes?.includes("contract")), href: toggleFilterValueHref(filters, "contractTypes", "contract"), label: "Contract" },
  ];
  const locationOptions: FilterDropdownOption[] = getDynamicLocationOptions(
    listing.items,
    filters.locations,
  ).map((location) => ({
    active: Boolean(filters.locations?.some((item) => item.toLowerCase() === location.toLowerCase())),
    href: toggleFilterValueHref(filters, "locations", location),
    label: location,
  }));
  const areaOptions: FilterDropdownOption[] = ["Design", "Engineering", "Marketing", "Data", "Product"].map((area) => ({
    active: Boolean(filters.areas?.some((item) => item.toLowerCase() === area.toLowerCase())),
    href: toggleFilterValueHref(filters, "areas", area),
    label: area,
  }));

  return (
    <AppShell auth={appShellAuth}>
      <main className="mx-auto max-w-[1128px] px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-7 lg:pb-20">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[18px] font-extrabold tracking-[-0.3px] text-weldoo-ink">
            Jobs in Spain
            <span className="ml-2 text-sm font-medium text-weldoo-muted" data-jobs-results-count>
              {listing.totalCount} results
            </span>
          </h1>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <JobSearchFilter defaultValue={filters.query ?? ""} />

            <FilterDropdown
              activeCount={filters.workModes?.length ?? 0}
              clearHref={filters.workModes?.length ? clearFilterHref(filters, "workModes") : undefined}
              label="Work mode"
              options={workModeOptions}
            />
            <FilterDropdown
              activeCount={filters.contractTypes?.length ?? 0}
              clearHref={filters.contractTypes?.length ? clearFilterHref(filters, "contractTypes") : undefined}
              label="Job type"
              options={contractOptions}
            />
            <FilterDropdown
              activeCount={filters.locations?.length ?? 0}
              clearHref={filters.locations?.length ? clearFilterHref(filters, "locations") : undefined}
              label="Location"
              options={locationOptions}
            />
            <FilterDropdown
              activeCount={filters.areas?.length ?? 0}
              align="right"
              clearHref={filters.areas?.length ? clearFilterHref(filters, "areas") : undefined}
              label="Area"
              options={areaOptions}
            />
          </div>
        </div>

        <ActiveFilterPills filters={filters} />

        <section className="grid overflow-hidden rounded-[16px] border border-weldoo-border-light bg-white shadow-weldoo-sm lg:grid-cols-[40%_60%]">
          <div className="border-b border-weldoo-border-light lg:sticky lg:top-16 lg:max-h-[calc(100vh-64px)] lg:overflow-hidden lg:border-b-0 lg:border-r">
            {listing.items.length ? (
              <div className="lg:max-h-[calc(100vh-64px)] lg:overflow-y-auto">
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
