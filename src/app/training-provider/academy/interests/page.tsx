import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { getAppShellAuth, requireCompletedOnboarding } from "@/lib/auth/session";
import {
  getOwnedTrainingProviderForAcademy,
  getTrainingProviderCourseInterests,
} from "@/lib/academy/provider-management";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Academy interests | Weldoo",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function profileHref(profile: { id: string; profile_type: string } | null) {
  if (!profile) return null;
  if (profile.profile_type === "professional") return `/professionals/${profile.id}`;
  return null;
}

export default async function TrainingProviderAcademyInterestsPage() {
  const { profile } = await requireCompletedOnboarding();

  if (profile.profile_type !== "training_provider") {
    redirect("/dashboard");
  }

  const [appShellAuth, supabase] = await Promise.all([
    getAppShellAuth(),
    createSupabaseServerClient(),
  ]);
  const provider = await getOwnedTrainingProviderForAcademy(supabase, profile.id);

  if (!provider) redirect("/training-provider/edit");

  const interests = await getTrainingProviderCourseInterests(supabase, provider.id);

  return (
    <AppShell auth={appShellAuth}>
      <main className="mx-auto max-w-[1128px] px-4 pb-20 pt-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-weldoo-indigo">
              Academy interests
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-weldoo-ink">
              Interested users
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-weldoo-muted">
              Review users who registered interest in your courses, webinars, and events.
            </p>
          </div>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-full border border-weldoo-border-light bg-white px-4 text-[12px] font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
            href="/training-provider/academy"
          >
            Manage Academy
          </Link>
        </div>

        <section className="overflow-hidden rounded-[16px] border border-weldoo-border-light bg-white shadow-weldoo-sm">
          <div className="border-b border-weldoo-border-light px-5 py-4">
            <h2 className="text-[15px] font-bold text-weldoo-ink">
              {interests.length} interest registrations
            </h2>
            <p className="mt-1 text-[12.5px] text-weldoo-muted">{provider.name}</p>
          </div>

          {interests.length ? (
            <div className="divide-y divide-weldoo-border-light">
              {interests.map((interest) => {
                const href = profileHref(interest.profile);
                return (
                  <article className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" key={interest.id}>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3d3db4,#5558e8)] text-[13px] font-bold text-white">
                          {(interest.profile?.display_name ?? "U").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          {href ? (
                            <Link className="truncate text-[14px] font-bold text-weldoo-ink hover:text-weldoo-indigo" href={href}>
                              {interest.profile?.display_name ?? "Unknown user"}
                            </Link>
                          ) : (
                            <p className="truncate text-[14px] font-bold text-weldoo-ink">
                              {interest.profile?.display_name ?? "Unknown user"}
                            </p>
                          )}
                          <p className="mt-0.5 truncate text-[12px] text-weldoo-muted">
                            {interest.profile?.headline ?? interest.profile?.location ?? "Weldoo member"}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-[12px] text-weldoo-muted">
                        Registered {formatDate(interest.created_at)}
                      </p>
                    </div>

                    <div>
                      <Link
                        className="text-[13.5px] font-bold text-weldoo-ink transition hover:text-weldoo-indigo"
                        href={interest.courseEvent ? `/academy/${interest.courseEvent.id}` : "/academy"}
                      >
                        {interest.courseEvent?.title ?? "Academy item"}
                      </Link>
                      <p className="mt-1 text-[12px] text-weldoo-muted">
                        {interest.courseEvent?.type.replaceAll("_", " ") ?? "Course/event"}
                      </p>
                      {interest.note ? (
                        <p className="mt-3 rounded-[12px] bg-weldoo-bg px-3 py-2 text-[13px] leading-5 text-weldoo-ink">
                          {interest.note}
                        </p>
                      ) : (
                        <p className="mt-3 text-[13px] text-weldoo-muted">No message provided.</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <h2 className="text-[16px] font-bold text-weldoo-ink">No interest yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-weldoo-muted">
                When users register interest in your published Academy items, they will appear here with their optional message.
              </p>
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
