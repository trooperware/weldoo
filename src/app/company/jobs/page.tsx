import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { CompanyJobManager } from "@/components/jobs/company-job-manager";
import { getAppShellAuth, requireCompletedOnboarding } from "@/lib/auth/session";
import { getCompanyJobs, getOwnedCompanyForJobs } from "@/lib/jobs/company-management";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Manage jobs | Weldoo",
};

export default async function CompanyJobsPage() {
  const { profile } = await requireCompletedOnboarding();

  if (profile.profile_type !== "company") {
    redirect("/dashboard");
  }

  const [appShellAuth, supabase] = await Promise.all([
    getAppShellAuth(),
    createSupabaseServerClient(),
  ]);
  const company = await getOwnedCompanyForJobs(supabase, profile.id);

  if (!company) {
    return (
      <AppShell auth={appShellAuth}>
        <main className="mx-auto max-w-3xl px-4 py-10">
          <section className="rounded-[16px] border border-weldoo-border-light bg-white p-6 shadow-weldoo-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-weldoo-indigo">
              Company jobs
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] text-weldoo-ink">
              Create your company profile first
            </h1>
            <p className="mt-3 text-sm leading-6 text-weldoo-muted">
              Weldoo needs a company profile before jobs can be created and published.
            </p>
            <Link
              className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-weldoo-indigo px-5 text-[13px] font-semibold text-white shadow-weldoo-md"
              href="/company/edit"
            >
              Complete company profile
            </Link>
          </section>
        </main>
      </AppShell>
    );
  }

  const jobs = await getCompanyJobs(supabase, company.id);

  return (
    <AppShell auth={appShellAuth}>
      <main className="mx-auto max-w-[1128px] px-4 pb-20 pt-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-weldoo-indigo">
              Company jobs
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-weldoo-ink">
              Manage job postings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-weldoo-muted">
              Create structured welding-sector job offers, publish them to the public jobs board, and close them when hiring is done.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-9 items-center justify-center rounded-full border border-weldoo-border-light bg-white px-4 text-[12px] font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
              href="/company/applications"
            >
              Review applications
            </Link>
            <Link
              className="inline-flex h-9 items-center justify-center rounded-full border border-weldoo-border-light bg-white px-4 text-[12px] font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
              href="/jobs"
            >
              View jobs board
            </Link>
          </div>
        </div>

        <CompanyJobManager company={company} jobs={jobs} />
      </main>
    </AppShell>
  );
}
