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

type ProfileRow = Tables<"profiles">;
type ProfessionalProfileRow = Tables<"professional_profiles">;

type ProfessionalPublicPageProps = {
  params: Promise<{
    profileId: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProfessionalPublicPageProps): Promise<Metadata> {
  const { profileId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: profileData } = await supabase
    .from("profiles")
    .select("display_name, headline, bio")
    .eq("id", profileId)
    .eq("profile_type", "professional")
    .maybeSingle();

  if (!profileData) {
    return {
      title: "Professional profile | Weldoo",
    };
  }

  const profile = profileData as Pick<ProfileRow, "bio" | "display_name" | "headline">;

  return {
    description: profile.bio ?? profile.headline ?? "Weldoo professional profile.",
    title: `${profile.display_name} | Weldoo`,
  };
}

export default async function ProfessionalPublicPage({
  params,
}: ProfessionalPublicPageProps) {
  const { profileId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: profileData } = await supabase
    .from("profiles")
    .select(
      "id, display_name, headline, bio, location, website_url, avatar_url, cover_url, profile_type",
    )
    .eq("id", profileId)
    .eq("profile_type", "professional")
    .maybeSingle();

  if (!profileData) {
    notFound();
  }

  const { data: professionalData } = await supabase
    .from("professional_profiles")
    .select(
      "profile_id, years_experience, availability, welding_processes, materials, positions, certifications, work_preferences, travel_availability",
    )
    .eq("profile_id", profileId)
    .maybeSingle();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = profileData as ProfileRow;
  const professional = professionalData as ProfessionalProfileRow | null;
  const isOwner = user?.id === profile.id;
  const [appShellAuth, connectionAction] = await Promise.all([
    getAppShellAuth(),
    getConnectionActionState(supabase, user?.id, profile.id),
  ]);
  const canMessageProfile =
    Boolean(user && !isOwner) && connectionAction.connectionStatus === "accepted";
  const professionalBadges = (
    <>
      {professional?.availability ? (
        <Badge variant="info">{professional.availability.replaceAll("_", " ")}</Badge>
      ) : null}
      {professional?.years_experience !== null &&
      professional?.years_experience !== undefined ? (
        <Badge variant="neutral">{professional.years_experience} years experience</Badge>
      ) : null}
      {professional?.travel_availability ? (
        <Badge variant="default">Available for travel</Badge>
      ) : null}
    </>
  );
  const professionalDetails = [
    profile.website_url
      ? {
          label: "Website",
          value: (
            <a
              className="break-words text-[var(--weldoo-indigo)] hover:underline"
              href={profile.website_url}
              rel="noreferrer"
              target="_blank"
            >
              {profile.website_url}
            </a>
          ),
        }
      : null,
    professional?.welding_processes?.length
      ? {
          label: "Welding processes",
          value: professional.welding_processes.join(", "),
        }
      : null,
    professional?.materials?.length
      ? { label: "Materials", value: professional.materials.join(", ") }
      : null,
    professional?.positions?.length
      ? { label: "Positions", value: professional.positions.join(", ") }
      : null,
    professional?.certifications?.length
      ? {
          label: "Self-declared certifications",
          value: professional.certifications.join(", "),
        }
      : null,
    professional?.work_preferences?.length
      ? {
          label: "Work preferences",
          value: professional.work_preferences.join(", "),
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
                      href="/profile/edit"
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
                  recipientAvatarUrl={profile.avatar_url}
                  recipientInitials={profile.display_name.slice(0, 1).toUpperCase()}
                  recipientName={profile.display_name}
                  recipientRole={profile.headline ?? "Weldoo member"}
                  size="profile"
                />
                <ProfileMessageButton
                  canMessage={canMessageProfile}
                  recipientName={profile.display_name}
                  recipientProfileId={profile.id}
                />
              </>
            }
            avatarShape="round"
            avatarUrl={profile.avatar_url}
            badges={professionalBadges}
            bio={profile.bio}
            coverUrl={profile.cover_url}
            headline={profile.headline}
            initials={profile.display_name.slice(0, 1).toUpperCase()}
            metaItems={[
              ...(profile.location
                ? [{ label: profile.location, type: "location" as const }]
                : []),
              {
                label: professional?.positions?.[0] ?? "Weldoo professional",
                type: "role" as const,
              },
              ...(profile.website_url ? [{ label: "Website", type: "link" as const }] : []),
            ]}
            name={profile.display_name}
            tone="professional"
            typeLabel="Professional"
          />

          <PublicProfileStatsCard
            stats={[
              { label: "Profile views", value: "—" },
              {
                label: "Processes",
                value: professional?.welding_processes?.length
                  ? String(professional.welding_processes.length)
                  : "—",
              },
              {
                label: "Availability",
                value: professional?.availability
                  ? professional.availability.replaceAll("_", " ")
                  : "—",
              },
            ]}
          />

          {professionalDetails.length ? (
            <PublicProfileSectionCard title="Professional details">
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                {professionalDetails.map((detail) => (
                  <div key={detail.label}>
                    <p className="font-semibold text-[var(--weldoo-ink)]">{detail.label}</p>
                    <div className="mt-1 text-[var(--weldoo-muted)]">{detail.value}</div>
                  </div>
                ))}
              </div>
            </PublicProfileSectionCard>
          ) : null}

          <PublicProfileEmptySection
            description="Posts from this professional will appear here once the feed is implemented."
            title="No public posts yet"
          />
        </div>
      </main>
    </AppShell>
  );
}
