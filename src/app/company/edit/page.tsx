import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { CompanyProfileForm } from "@/components/profile/company-profile-form";
import { requireCompletedOnboarding } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type CompanyRow = Tables<"companies">;

export default async function EditCompanyProfilePage() {
  const { profile, user } = await requireCompletedOnboarding();

  if (profile.profile_type !== "company") {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();
  const { data: companyProfile } = await supabase
    .from("companies")
    .select(
      "id, name, sector, company_size, location, description, website_url, contact_email, logo_url, cover_url",
    )
    .eq("owner_profile_id", user.id)
    .maybeSingle();

  const company = companyProfile as CompanyRow | null;

  return (
    <AppShell auth={{ email: user.email, profileType: profile.profile_type }}>
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-5xl">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--weldoo-indigo)]">
              Company profile
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-normal text-[var(--weldoo-ink)]">
              Edit company profile
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--weldoo-muted)]">
              Keep your company profile structured so welders can understand your sector, location, and future opportunities.
            </p>
          </div>

          <div className="rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white p-5 shadow-weldoo-sm sm:p-6">
            <CompanyProfileForm
              defaultValues={{
                companySize: company?.company_size,
                contactEmail: company?.contact_email,
                coverUrl: company?.cover_url,
                description: company?.description,
                location: company?.location,
                logoUrl: company?.logo_url,
                name: company?.name ?? profile.display_name,
                sector: company?.sector,
                websiteUrl: company?.website_url,
              }}
              publicProfileUrl={company?.id ? `/companies/${company.id}` : null}
            />
          </div>
        </section>
      </main>
    </AppShell>
  );
}
