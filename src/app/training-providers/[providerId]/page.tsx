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

type TrainingProviderRow = Tables<"training_providers">;

type TrainingProviderPublicPageProps = {
  params: Promise<{
    providerId: string;
  }>;
};

export async function generateMetadata({
  params,
}: TrainingProviderPublicPageProps): Promise<Metadata> {
  const { providerId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: providerData } = await supabase
    .from("training_providers")
    .select("name, description, training_types")
    .eq("id", providerId)
    .maybeSingle();

  if (!providerData) {
    return {
      title: "Training provider profile | Weldoo",
    };
  }

  const provider = providerData as Pick<
    TrainingProviderRow,
    "description" | "name" | "training_types"
  >;

  return {
    description:
      provider.description ??
      provider.training_types.join(", ") ??
      "Weldoo training provider profile.",
    title: `${provider.name} | Weldoo`,
  };
}

export default async function TrainingProviderPublicPage({
  params,
}: TrainingProviderPublicPageProps) {
  const { providerId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: providerData } = await supabase
    .from("training_providers")
    .select(
      "id, owner_profile_id, name, location, description, website_url, contact_email, training_types, logo_url, cover_url",
    )
    .eq("id", providerId)
    .maybeSingle();

  if (!providerData) {
    notFound();
  }

  const provider = providerData as TrainingProviderRow;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === provider.owner_profile_id;
  const [appShellAuth, connectionAction] = await Promise.all([
    getAppShellAuth(),
    getConnectionActionState(supabase, user?.id, provider.owner_profile_id),
  ]);
  const canMessageProfile =
    Boolean(user && !isOwner) && connectionAction.connectionStatus === "accepted";
  const providerDetails = [
    provider.website_url
      ? {
          label: "Website",
          value: (
            <a
              className="break-words text-[var(--weldoo-indigo)] hover:underline"
              href={provider.website_url}
              rel="noreferrer"
              target="_blank"
            >
              {provider.website_url}
            </a>
          ),
        }
      : null,
    provider.contact_email
      ? {
          label: "Contact",
          value: (
            <a
              className="break-words text-[var(--weldoo-indigo)] hover:underline"
              href={`mailto:${provider.contact_email}`}
            >
              {provider.contact_email}
            </a>
          ),
        }
      : null,
    provider.training_types.length
      ? { label: "Training types", value: provider.training_types.join(", ") }
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
                      href="/training-provider/edit"
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
                  recipientName={provider.name}
                  size="profile"
                />
                <ProfileMessageButton
                  canMessage={canMessageProfile}
                  recipientName={provider.name}
                  recipientProfileId={provider.owner_profile_id}
                />
              </>
            }
            avatarShape="square"
            avatarUrl={provider.logo_url}
            badges={
              <>
                {provider.training_types.map((trainingType) => (
                  <Badge key={trainingType} variant="info">
                    {trainingType}
                  </Badge>
                ))}
              </>
            }
            bio={provider.description}
            coverUrl={provider.cover_url}
            headline={provider.training_types[0] ?? "Training provider"}
            initials={provider.name.slice(0, 1).toUpperCase()}
            metaItems={[
              ...(provider.location
                ? [{ label: provider.location, type: "location" as const }]
                : []),
              { label: "Training provider", type: "role" as const },
              ...(provider.website_url ? [{ label: "Website", type: "link" as const }] : []),
            ]}
            name={provider.name}
            tone="training"
            typeLabel="School"
          />

          <PublicProfileStatsCard
            stats={[
              { label: "Profile views", value: "—" },
              { label: "Mutual connections", value: "—" },
              { label: "Courses", value: "—" },
              {
                label: "Training types",
                value: provider.training_types.length
                  ? String(provider.training_types.length)
                  : "—",
              },
            ]}
          />

          {providerDetails.length ? (
            <PublicProfileSectionCard title="Training provider details">
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                {providerDetails.map((detail) => (
                  <div key={detail.label}>
                    <p className="font-semibold text-[var(--weldoo-ink)]">{detail.label}</p>
                    <div className="mt-1 text-[var(--weldoo-muted)]">{detail.value}</div>
                  </div>
                ))}
              </div>
            </PublicProfileSectionCard>
          ) : null}

          <PublicProfileEmptySection
            description="Published courses and events from this provider will appear here once course management is implemented."
            title="No public courses or events yet"
          />
        </div>
      </main>
    </AppShell>
  );
}
