import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { TrainingProviderAcademyManager } from "@/components/academy/training-provider-academy-manager";
import { AppShell } from "@/components/app/app-shell";
import { getAppShellAuth, requireCompletedOnboarding } from "@/lib/auth/session";
import {
  getOwnedTrainingProviderForAcademy,
  getTrainingProviderCourseEvents,
} from "@/lib/academy/provider-management";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Manage Academy | Weldoo",
};

export default async function TrainingProviderAcademyPage() {
  const { profile } = await requireCompletedOnboarding();

  if (profile.profile_type !== "training_provider") {
    redirect("/dashboard");
  }

  const [appShellAuth, supabase] = await Promise.all([
    getAppShellAuth(),
    createSupabaseServerClient(),
  ]);
  const provider = await getOwnedTrainingProviderForAcademy(supabase, profile.id);

  if (!provider) {
    return (
      <AppShell auth={appShellAuth}>
        <main className="mx-auto max-w-3xl px-4 py-10">
          <section className="rounded-[16px] border border-weldoo-border-light bg-white p-6 shadow-weldoo-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-weldoo-indigo">
              Academy management
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] text-weldoo-ink">
              Create your training provider profile first
            </h1>
            <p className="mt-3 text-sm leading-6 text-weldoo-muted">
              Weldoo needs a training provider profile before courses, webinars, or events can be created and published.
            </p>
            <Link
              className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-weldoo-indigo px-5 text-[13px] font-semibold text-white shadow-weldoo-md"
              href="/training-provider/edit"
            >
              Complete training provider profile
            </Link>
          </section>
        </main>
      </AppShell>
    );
  }

  const items = await getTrainingProviderCourseEvents(supabase, provider.id);

  return (
    <AppShell auth={appShellAuth}>
      <main className="mx-auto max-w-[1128px] px-4 pb-20 pt-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-weldoo-indigo">
              Training provider Academy
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-weldoo-ink">
              Manage courses and events
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-weldoo-muted">
              Create structured Academy items, publish them to the public Academy listing, and archive them when they should no longer be visible.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-9 items-center justify-center rounded-full border border-weldoo-border-light bg-white px-4 text-[12px] font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
              href="/academy"
            >
              View Academy
            </Link>
            <Link
              className="inline-flex h-9 items-center justify-center rounded-full border border-weldoo-border-light bg-white px-4 text-[12px] font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
              href="/training-provider/edit"
            >
              Edit provider profile
            </Link>
          </div>
        </div>

        <TrainingProviderAcademyManager items={items} provider={provider} />
      </main>
    </AppShell>
  );
}
