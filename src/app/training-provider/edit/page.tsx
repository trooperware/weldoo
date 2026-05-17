import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { TrainingProviderProfileForm } from "@/components/profile/training-provider-profile-form";
import { requireCompletedOnboarding } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type TrainingProviderRow = Tables<"training_providers">;

export default async function EditTrainingProviderProfilePage() {
  const { profile, user } = await requireCompletedOnboarding();

  if (profile.profile_type !== "training_provider") {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();
  const { data: providerProfile } = await supabase
    .from("training_providers")
    .select(
      "id, name, location, description, website_url, contact_email, training_types, logo_url, cover_url",
    )
    .eq("owner_profile_id", user.id)
    .maybeSingle();

  const provider = providerProfile as TrainingProviderRow | null;

  return (
    <AppShell auth={{ email: user.email, profileType: profile.profile_type }}>
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-5xl">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--weldoo-indigo)]">
              Training provider profile
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-normal text-[var(--weldoo-ink)]">
              Edit training provider profile
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--weldoo-muted)]">
              Keep your training offer structured so welders can understand your courses, location, and certification focus.
            </p>
          </div>

          <div className="rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white p-5 shadow-weldoo-sm sm:p-6">
            <TrainingProviderProfileForm
              defaultValues={{
                contactEmail: provider?.contact_email,
                coverUrl: provider?.cover_url,
                description: provider?.description,
                location: provider?.location,
                logoUrl: provider?.logo_url,
                name: provider?.name ?? profile.display_name,
                trainingTypes: provider?.training_types,
                websiteUrl: provider?.website_url,
              }}
              publicProfileUrl={provider?.id ? `/training-providers/${provider.id}` : null}
            />
          </div>
        </section>
      </main>
    </AppShell>
  );
}
