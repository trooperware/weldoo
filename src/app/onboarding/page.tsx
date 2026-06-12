import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getLinkedInProfileImport } from "@/lib/auth/linkedin-profile-import";
import { getCurrentProfile, requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

type SelectableProfileType = Exclude<Enums<"profile_type">, "admin">;

function getUserDisplayNameFallback(user: Awaited<ReturnType<typeof requireUser>>) {
  const metadata = user.user_metadata;
  const metadataName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : null;

  return metadataName ?? user.email?.split("@")[0] ?? "";
}

export default async function OnboardingPage() {
  const user = await requireUser("/onboarding");
  const profile = await getCurrentProfile();

  if (profile?.onboarding_completed) {
    redirect("/");
  }

  const defaultProfileType =
    profile && profile.profile_type !== "admin"
      ? (profile.profile_type as SelectableProfileType)
      : "professional";
  const linkedInImport = getLinkedInProfileImport(user);
  const supabase = await createSupabaseServerClient();
  const [{ data: companyData }, { data: trainingProviderData }] = await Promise.all([
    supabase
      .from("companies")
      .select("name, location")
      .eq("owner_profile_id", user.id)
      .maybeSingle(),
    supabase
      .from("training_providers")
      .select("name, location")
      .eq("owner_profile_id", user.id)
      .maybeSingle(),
  ]);
  const company = companyData as { location: string | null; name: string } | null;
  const trainingProvider = trainingProviderData as { location: string | null; name: string } | null;
  const defaultOrganizationName =
    defaultProfileType === "company"
      ? company?.name
      : defaultProfileType === "training_provider"
        ? trainingProvider?.name
        : undefined;
  const defaultLocation =
    profile?.location ??
    (defaultProfileType === "company"
      ? company?.location
      : defaultProfileType === "training_provider"
        ? trainingProvider?.location
        : null);

  return (
    <main className="min-h-screen bg-[var(--weldoo-bg)] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white p-6 shadow-weldoo-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--weldoo-indigo)]">
          Weldoo onboarding
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-[var(--weldoo-ink)]">
          Set up your account
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--weldoo-muted)]">
          Choose the role that best describes how you will use Weldoo. This creates
          your base profile and prepares the right setup path for the next sprint.
        </p>
        <div className="mt-7">
          <OnboardingForm
            defaultAvatarUrl={profile?.avatar_url ?? linkedInImport?.avatarUrl}
            defaultDisplayName={
              profile?.display_name ?? linkedInImport?.displayName ?? getUserDisplayNameFallback(user)
            }
            defaultHeadline={profile?.headline ?? linkedInImport?.headline}
            defaultLocation={defaultLocation}
            defaultOrganizationName={defaultOrganizationName}
            defaultProfileType={defaultProfileType}
            importedLinkedInProfile={linkedInImport}
          />
        </div>
      </section>
    </main>
  );
}
