import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { CompanyApplicationsManager } from "@/components/jobs/company-applications-manager";
import { getAppShellAuth, requireCompletedOnboarding } from "@/lib/auth/session";
import { getCompanyJobApplications } from "@/lib/jobs/applications";
import { getOwnedCompanyForJobs } from "@/lib/jobs/company-management";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Job applications | Weldoo",
};

export default async function CompanyApplicationsPage() {
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
    redirect("/company/edit");
  }

  const applications = await getCompanyJobApplications(supabase, company.id);

  return (
    <AppShell auth={appShellAuth}>
      <main className="mx-auto max-w-[960px] px-4 pb-20 pt-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-weldoo-indigo">
              Company applications
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-weldoo-ink">
              Review job applications
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-weldoo-muted">
              Review submitted applications and update their hiring status.
            </p>
          </div>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-full border border-weldoo-border-light bg-white px-4 text-[12px] font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
            href="/company/jobs"
          >
            Manage jobs
          </Link>
        </div>

        <CompanyApplicationsManager applications={applications} />
      </main>
    </AppShell>
  );
}
