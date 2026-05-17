import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type CompanyRow = Tables<"companies">;

type CompanyPublicPageProps = {
  params: Promise<{
    companyId: string;
  }>;
};

export default async function CompanyPublicPage({ params }: CompanyPublicPageProps) {
  const { companyId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: companyData } = await supabase
    .from("companies")
    .select(
      "id, owner_profile_id, name, sector, company_size, location, description, website_url, contact_email, logo_url, cover_url",
    )
    .eq("id", companyId)
    .maybeSingle();

  if (!companyData) {
    notFound();
  }

  const company = companyData as CompanyRow;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === company.owner_profile_id;

  return (
    <AppShell>
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-5xl overflow-hidden rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white shadow-weldoo-sm">
          <div className="min-h-40 bg-[linear-gradient(135deg,#f5f7fb_0%,#e9ecf8_100%)]">
            {company.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="h-56 w-full object-cover"
                src={company.cover_url}
              />
            ) : null}
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--weldoo-radius-sm)] bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-lg font-bold text-white shadow-weldoo-md">
                  {company.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={company.logo_url}
                    />
                  ) : (
                    company.name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--weldoo-indigo)]">
                    Company
                  </p>
                  <h1 className="mt-2 text-3xl font-bold tracking-normal text-[var(--weldoo-ink)]">
                    {company.name}
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {company.sector ? <Badge variant="info">{company.sector}</Badge> : null}
                    {company.company_size ? (
                      <Badge variant="neutral">{company.company_size}</Badge>
                    ) : null}
                    {company.location ? (
                      <Badge variant="success">{company.location}</Badge>
                    ) : null}
                  </div>
                </div>
              </div>
              {isOwner ? (
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border-light)] bg-white px-5 text-sm font-semibold text-[var(--weldoo-slate)] transition hover:border-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo)]"
                  href="/company/edit"
                >
                  Edit profile
                </Link>
              ) : null}
            </div>

            {company.description ? (
              <p className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-6 text-[var(--weldoo-muted)]">
                {company.description}
              </p>
            ) : null}

            <div className="mt-6 grid gap-4 border-t border-[var(--weldoo-border-light)] pt-5 text-sm sm:grid-cols-2">
              {company.website_url ? (
                <div>
                  <p className="font-semibold text-[var(--weldoo-ink)]">Website</p>
                  <a
                    className="mt-1 block break-words text-[var(--weldoo-indigo)] hover:underline"
                    href={company.website_url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {company.website_url}
                  </a>
                </div>
              ) : null}
              {company.contact_email ? (
                <div>
                  <p className="font-semibold text-[var(--weldoo-ink)]">Contact</p>
                  <a
                    className="mt-1 block break-words text-[var(--weldoo-indigo)] hover:underline"
                    href={`mailto:${company.contact_email}`}
                  >
                    {company.contact_email}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </article>
      </main>
    </AppShell>
  );
}
