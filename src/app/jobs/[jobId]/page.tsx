import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { JobApplyButton } from "@/components/jobs/job-apply-button";
import { JobSaveButton } from "@/components/jobs/job-save-button";
import { getAppShellAuth, getCurrentProfile } from "@/lib/auth/session";
import {
  getApplicationForCurrentUser,
  getSavedJobForCurrentUser,
} from "@/lib/jobs/applications";
import { getPublishedJobById, type JobListItem } from "@/lib/jobs/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type JobDetailPageProps = {
  params: Promise<{
    jobId: string;
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
    dateStyle: "medium",
  }).format(date);
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

export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const { jobId } = await params;
  const supabase = await createSupabaseServerClient();
  const job = await getPublishedJobById(supabase, jobId);

  if (!job) {
    return {
      title: "Job | Weldoo",
    };
  }

  return {
    description: job.description,
    title: `${job.title} | Weldoo`,
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { jobId } = await params;
  const [appShellAuth, currentProfile, supabase] = await Promise.all([
    getAppShellAuth(),
    getCurrentProfile(),
    createSupabaseServerClient(),
  ]);
  const job = await getPublishedJobById(supabase, jobId);

  if (!job) {
    notFound();
  }

  const salary = formatSalary(job);
  const companyName = job.company?.name ?? "Weldoo company";
  const companyLocation = job.company?.location ?? job.location;
  const application =
    currentProfile?.profile_type === "professional"
      ? await getApplicationForCurrentUser(supabase, job.id, currentProfile.id)
      : null;
  const savedJob = currentProfile?.id
    ? await getSavedJobForCurrentUser(supabase, job.id, currentProfile.id)
    : null;

  return (
    <AppShell auth={appShellAuth}>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          className="mb-4 inline-flex text-[12.5px] font-semibold text-weldoo-indigo hover:underline"
          href={`/jobs?job=${job.id}`}
        >
          Back to jobs
        </Link>
        <article className="rounded-[16px] border border-weldoo-border-light bg-white p-6 shadow-weldoo-sm sm:p-8">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-weldoo-border-light bg-white text-xl font-extrabold text-weldoo-indigo">
                {job.company?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" className="h-full w-full object-contain" src={job.company.logo_url} />
                ) : (
                  companyName.slice(0, 1).toUpperCase()
                )}
              </div>
              <div>
                <div className="text-[15px] font-bold text-weldoo-ink">{companyName}</div>
                <div className="mt-0.5 text-[12.5px] text-weldoo-muted">
                  {companyLocation ?? "Location not set"}
                </div>
              </div>
            </div>
          </div>

          <h1 className="mb-2 text-3xl font-extrabold leading-[1.2] tracking-[-0.4px] text-weldoo-ink">
            {job.title}
          </h1>
          <p className="mb-5 text-[13px] leading-[1.7] text-weldoo-muted">
            {job.location ?? companyLocation ?? "Location not set"} · Posted{" "}
            {formatPostedDate(job.published_at, job.created_at)}
            {job.contract_type ? ` · ${contractTypeLabels[job.contract_type]}` : ""}
          </p>

          <div className="mb-6 flex flex-wrap gap-2">
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

          <div className="mb-6 flex items-center gap-2">
            <JobApplyButton
              existingApplication={
                application
                  ? { createdAt: application.created_at, status: application.status }
                  : null
              }
              jobId={job.id}
              profileType={currentProfile?.profile_type}
            />
            <JobSaveButton
              initialSaved={Boolean(savedJob)}
              jobId={job.id}
              signedIn={Boolean(currentProfile)}
            />
          </div>

          <div className="space-y-6 border-t border-weldoo-border-light pt-6">
            <section>
              <h2 className="mb-3 text-base font-bold text-weldoo-ink">About the role</h2>
              <p className="whitespace-pre-line text-sm leading-[1.75] text-weldoo-ink">
                {job.description}
              </p>
            </section>
            {job.responsibilities ? (
              <section>
                <h2 className="mb-3 text-base font-bold text-weldoo-ink">Responsibilities</h2>
                <p className="whitespace-pre-line text-sm leading-[1.75] text-weldoo-ink">
                  {job.responsibilities}
                </p>
              </section>
            ) : null}
            {job.requirements ? (
              <section>
                <h2 className="mb-3 text-base font-bold text-weldoo-ink">Requirements</h2>
                <p className="whitespace-pre-line text-sm leading-[1.75] text-weldoo-ink">
                  {job.requirements}
                </p>
              </section>
            ) : null}
            {job.benefits.length ? (
              <section>
                <h2 className="mb-3 text-base font-bold text-weldoo-ink">Benefits</h2>
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
            ) : null}
            <section className="rounded-weldoo-md border border-weldoo-indigo/15 bg-weldoo-indigo/[0.04] px-4 py-4">
              <h2 className="mb-2 text-[13.5px] font-bold text-weldoo-ink">
                Welding match fields
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {[...job.welding_processes, ...job.materials, ...job.required_certifications].map((tag) => (
                  <span className="inline-flex h-[30px] items-center rounded-full border border-weldoo-indigo/20 bg-weldoo-indigo/[0.07] px-3 text-[12.5px] font-medium text-weldoo-indigo" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </article>
      </main>
    </AppShell>
  );
}
