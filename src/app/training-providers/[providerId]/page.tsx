import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { ContactRequestButton } from "@/components/contact/contact-request-button";
import { PublicProfileEmptySection } from "@/components/profile/public-profile-empty-section";
import { Badge } from "@/components/ui";
import { getAppShellAuth } from "@/lib/auth/session";
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
  const appShellAuth = await getAppShellAuth();

  return (
    <AppShell auth={appShellAuth}>
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-5xl overflow-hidden rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white shadow-weldoo-sm">
          <div className="min-h-40 bg-[linear-gradient(135deg,#f5f7fb_0%,#e9ecf8_100%)]">
            {provider.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="h-56 w-full object-cover"
                src={provider.cover_url}
              />
            ) : null}
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--weldoo-radius-sm)] bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-lg font-bold text-white shadow-weldoo-md">
                  {provider.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={provider.logo_url}
                    />
                  ) : (
                    provider.name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--weldoo-indigo)]">
                    Training provider
                  </p>
                  <h1 className="mt-2 text-3xl font-bold tracking-normal text-[var(--weldoo-ink)]">
                    {provider.name}
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {provider.location ? (
                      <Badge variant="success">{provider.location}</Badge>
                    ) : null}
                    {provider.training_types.map((trainingType) => (
                      <Badge key={trainingType} variant="info">
                        {trainingType}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {isOwner ? (
                  <Link
                    className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border-light)] bg-white px-5 text-sm font-semibold text-[var(--weldoo-slate)] transition hover:border-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo)]"
                    href="/training-provider/edit"
                  >
                    Edit profile
                  </Link>
                ) : null}
                <ContactRequestButton
                  canContact={Boolean(user && !isOwner)}
                  recipientName={provider.name}
                  recipientProfileId={provider.owner_profile_id}
                />
              </div>
            </div>

            {provider.description ? (
              <p className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-6 text-[var(--weldoo-muted)]">
                {provider.description}
              </p>
            ) : null}

            <div className="mt-6 grid gap-4 border-t border-[var(--weldoo-border-light)] pt-5 text-sm sm:grid-cols-2">
              {provider.website_url ? (
                <div>
                  <p className="font-semibold text-[var(--weldoo-ink)]">Website</p>
                  <a
                    className="mt-1 block break-words text-[var(--weldoo-indigo)] hover:underline"
                    href={provider.website_url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {provider.website_url}
                  </a>
                </div>
              ) : null}
              {provider.contact_email ? (
                <div>
                  <p className="font-semibold text-[var(--weldoo-ink)]">Contact</p>
                  <a
                    className="mt-1 block break-words text-[var(--weldoo-indigo)] hover:underline"
                    href={`mailto:${provider.contact_email}`}
                  >
                    {provider.contact_email}
                  </a>
                </div>
              ) : null}
            </div>

            <PublicProfileEmptySection
              description="Published courses and events from this provider will appear here once course management is implemented."
              title="No public courses or events yet"
            />
          </div>
        </article>
      </main>
    </AppShell>
  );
}
