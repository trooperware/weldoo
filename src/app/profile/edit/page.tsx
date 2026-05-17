import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { ProfessionalProfileForm } from "@/components/profile/professional-profile-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireCompletedOnboarding } from "@/lib/auth/session";
import type { Tables } from "@/types/database";

type ProfessionalProfileRow = Tables<"professional_profiles">;

export default async function EditProfilePage() {
  const { profile, user } = await requireCompletedOnboarding();

  if (profile.profile_type !== "professional") {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();
  const { data: baseProfile } = await supabase
    .from("profiles")
    .select("display_name, headline, bio, location, website_url, avatar_url, cover_url")
    .eq("id", user.id)
    .maybeSingle();

  const { data: professionalProfile } = await supabase
    .from("professional_profiles")
    .select(
      "years_experience, availability, welding_processes, materials, positions, certifications, work_preferences, travel_availability",
    )
    .eq("profile_id", user.id)
    .maybeSingle();

  const professional = professionalProfile as ProfessionalProfileRow | null;
  const base = baseProfile as {
    avatar_url: string | null;
    bio: string | null;
    cover_url: string | null;
    display_name: string;
    headline: string | null;
    location: string | null;
    website_url: string | null;
  } | null;

  return (
    <AppShell auth={{ email: user.email, profileType: profile.profile_type }}>
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-5xl">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--weldoo-indigo)]">
              Professional profile
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-normal text-[var(--weldoo-ink)]">
              Edit welder profile
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--weldoo-muted)]">
              Keep your welding processes, materials, certifications, and availability structured so future matching features can use them.
            </p>
          </div>

          <div className="rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white p-5 shadow-weldoo-sm sm:p-6">
            <ProfessionalProfileForm
              defaultValues={{
                avatarUrl: base?.avatar_url,
                availability: professional?.availability ?? "open_to_opportunities",
                bio: base?.bio,
                certifications: professional?.certifications,
                coverUrl: base?.cover_url,
                displayName: base?.display_name ?? profile.display_name,
                headline: base?.headline,
                location: base?.location,
                materials: professional?.materials,
                positions: professional?.positions,
                travelAvailability: professional?.travel_availability,
                websiteUrl: base?.website_url,
                weldingProcesses: professional?.welding_processes,
                workPreferences: professional?.work_preferences,
                yearsExperience: professional?.years_experience,
              }}
              publicProfileUrl={`/professionals/${user.id}`}
            />
          </div>
        </section>
      </main>
    </AppShell>
  );
}
