import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { PublicProfileEmptySection } from "@/components/profile/public-profile-empty-section";
import { Badge } from "@/components/ui";
import { getAppShellAuth } from "@/lib/auth/session";
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
  const appShellAuth = await getAppShellAuth();

  return (
    <AppShell auth={appShellAuth}>
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-5xl overflow-hidden rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white shadow-weldoo-sm">
          <div className="min-h-40 bg-[linear-gradient(135deg,#f5f7fb_0%,#e9ecf8_100%)]">
            {profile.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-56 w-full object-cover" src={profile.cover_url} />
            ) : null}
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-lg font-bold text-white shadow-weldoo-md">
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="h-full w-full object-cover" src={profile.avatar_url} />
                  ) : (
                    profile.display_name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--weldoo-indigo)]">
                    Professional
                  </p>
                  <h1 className="mt-2 text-3xl font-bold tracking-normal text-[var(--weldoo-ink)]">
                    {profile.display_name}
                  </h1>
                  {profile.headline ? (
                    <p className="mt-2 text-sm font-semibold text-[var(--weldoo-slate)]">
                      {profile.headline}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.location ? (
                      <Badge variant="success">{profile.location}</Badge>
                    ) : null}
                    {professional?.availability ? (
                      <Badge variant="info">{professional.availability.replaceAll("_", " ")}</Badge>
                    ) : null}
                    {professional?.years_experience !== null &&
                    professional?.years_experience !== undefined ? (
                      <Badge variant="neutral">
                        {professional.years_experience} years experience
                      </Badge>
                    ) : null}
                    {professional?.travel_availability ? (
                      <Badge variant="default">Available for travel</Badge>
                    ) : null}
                  </div>
                </div>
              </div>
              {isOwner ? (
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border-light)] bg-white px-5 text-sm font-semibold text-[var(--weldoo-slate)] transition hover:border-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo)]"
                  href="/profile/edit"
                >
                  Edit profile
                </Link>
              ) : null}
            </div>

            {profile.bio ? (
              <p className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-6 text-[var(--weldoo-muted)]">
                {profile.bio}
              </p>
            ) : null}

            <div className="mt-6 grid gap-4 border-t border-[var(--weldoo-border-light)] pt-5 text-sm sm:grid-cols-2">
              {profile.website_url ? (
                <div>
                  <p className="font-semibold text-[var(--weldoo-ink)]">Website</p>
                  <a
                    className="mt-1 block break-words text-[var(--weldoo-indigo)] hover:underline"
                    href={profile.website_url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {profile.website_url}
                  </a>
                </div>
              ) : null}
              {professional?.welding_processes?.length ? (
                <div>
                  <p className="font-semibold text-[var(--weldoo-ink)]">Welding processes</p>
                  <p className="mt-1 text-[var(--weldoo-muted)]">
                    {professional.welding_processes.join(", ")}
                  </p>
                </div>
              ) : null}
              {professional?.materials?.length ? (
                <div>
                  <p className="font-semibold text-[var(--weldoo-ink)]">Materials</p>
                  <p className="mt-1 text-[var(--weldoo-muted)]">
                    {professional.materials.join(", ")}
                  </p>
                </div>
              ) : null}
              {professional?.certifications?.length ? (
                <div>
                  <p className="font-semibold text-[var(--weldoo-ink)]">
                    Self-declared certifications
                  </p>
                  <p className="mt-1 text-[var(--weldoo-muted)]">
                    {professional.certifications.join(", ")}
                  </p>
                </div>
              ) : null}
            </div>

            <PublicProfileEmptySection
              description="Posts from this professional will appear here once the feed is implemented."
              title="No public posts yet"
            />
          </div>
        </article>
      </main>
    </AppShell>
  );
}
