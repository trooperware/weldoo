import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { ProfileMessageButton } from "@/components/messages/profile-message-button";
import { ConnectionActionButton } from "@/components/network/connection-action-button";
import { PublicProfileBackLink } from "@/components/profile/public-profile-back-link";
import { PublicProfileEmptySection } from "@/components/profile/public-profile-empty-section";
import {
  PublicProfileHeaderCard,
  PublicProfileSectionCard,
  PublicProfileStatsCard,
} from "@/components/profile/public-profile-layout";
import { Badge } from "@/components/ui";
import { getAppShellAuth } from "@/lib/auth/session";
import { getConnectionActionState } from "@/lib/network/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type CompanyRow = Tables<"companies">;

type CompanyPublicPageProps = {
  params: Promise<{
    companyId: string;
  }>;
};

export async function generateMetadata({
  params,
}: CompanyPublicPageProps): Promise<Metadata> {
  const { companyId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: companyData } = await supabase
    .from("companies")
    .select("name, sector, description")
    .eq("id", companyId)
    .maybeSingle();

  if (!companyData) {
    return {
      title: "Company profile | Weldoo",
    };
  }

  const company = companyData as Pick<CompanyRow, "description" | "name" | "sector">;

  return {
    description: company.description ?? company.sector ?? "Weldoo company profile.",
    title: `${company.name} | Weldoo`,
  };
}

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
  const [appShellAuth, connectionAction] = await Promise.all([
    getAppShellAuth(),
    getConnectionActionState(supabase, user?.id, company.owner_profile_id),
  ]);
  const canMessageProfile =
    Boolean(user && !isOwner) && connectionAction.connectionStatus === "accepted";
  const companyDetails = [
    company.website_url
      ? {
          label: "Website",
          value: (
            <a
              className="break-words text-[var(--weldoo-indigo)] hover:underline"
              href={company.website_url}
              rel="noreferrer"
              target="_blank"
            >
              {company.website_url}
            </a>
          ),
        }
      : null,
    company.contact_email
      ? {
          label: "Contact",
          value: (
            <a
              className="break-words text-[var(--weldoo-indigo)] hover:underline"
              href={`mailto:${company.contact_email}`}
            >
              {company.contact_email}
            </a>
          ),
        }
      : null,
  ].filter(Boolean) as { label: string; value: ReactNode }[];

  return (
    <AppShell auth={appShellAuth}>
      <main className="px-4 pb-20 pt-7 sm:px-6">
        <PublicProfileBackLink />
        <div className="mx-auto flex max-w-[780px] flex-col gap-[18px]">
          <PublicProfileHeaderCard
            actions={
              <>
                {isOwner ? (
                  <>
                    <Link
                      className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border-light)] bg-white px-5 text-sm font-semibold text-[var(--weldoo-slate)] transition hover:border-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo)]"
                      href="/company/edit"
                    >
                      Edit profile
                    </Link>
                    <Link
                      className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] bg-[var(--weldoo-indigo)] px-5 text-sm font-semibold text-white shadow-weldoo-md transition hover:brightness-105"
                      href="/settings/linkedin-import"
                    >
                      Import linkedin profile
                    </Link>
                  </>
                ) : null}
                <ConnectionActionButton
                  item={connectionAction}
                  recipientAvatarUrl={company.logo_url}
                  recipientInitials={company.name.slice(0, 1).toUpperCase()}
                  recipientName={company.name}
                  recipientRole={company.sector ?? "Weldoo member"}
                  size="profile"
                />
                <ProfileMessageButton
                  canMessage={canMessageProfile}
                  recipientName={company.name}
                  recipientProfileId={company.owner_profile_id}
                />
              </>
            }
            avatarShape="square"
            avatarUrl={company.logo_url}
            badges={
              <>
                {company.sector ? <Badge variant="info">{company.sector}</Badge> : null}
                {company.company_size ? (
                  <Badge variant="neutral">{company.company_size}</Badge>
                ) : null}
              </>
            }
            bio={company.description}
            coverUrl={company.cover_url}
            headline={company.sector}
            initials={company.name.slice(0, 1).toUpperCase()}
            metaItems={[
              ...(company.location ? [{ label: company.location, type: "location" as const }] : []),
              { label: company.company_size ?? "Weldoo company", type: "role" as const },
              ...(company.website_url ? [{ label: "Website", type: "link" as const }] : []),
            ]}
            name={company.name}
            tone="company"
            typeLabel="Company"
          />

          <PublicProfileStatsCard
            stats={[
              { label: "Profile views", value: "—" },
              { label: "Mutual connections", value: "—" },
              { label: "Jobs posted", value: "—" },
              { label: "Company size", value: company.company_size ?? "—" },
            ]}
          />

          {companyDetails.length ? (
            <PublicProfileSectionCard title="Company details">
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                {companyDetails.map((detail) => (
                  <div key={detail.label}>
                    <p className="font-semibold text-[var(--weldoo-ink)]">{detail.label}</p>
                    <div className="mt-1 text-[var(--weldoo-muted)]">{detail.value}</div>
                  </div>
                ))}
              </div>
            </PublicProfileSectionCard>
          ) : null}

          <PublicProfileEmptySection
            description="Published jobs from this company will appear here once job posting is implemented."
            title="No public jobs yet"
          />
        </div>
      </main>
    </AppShell>
  );
}
