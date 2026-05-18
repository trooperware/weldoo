import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui";
import { requireCompletedOnboarding } from "@/lib/auth/session";
import { signOutAction } from "@/server/actions/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const { profile, user } = await requireCompletedOnboarding();

  return (
    <AppShell auth={{ email: user.email, profileType: profile.profile_type }}>
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-4xl rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white p-6 shadow-weldoo-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--weldoo-indigo)]">
            Private area
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-[var(--weldoo-ink)]">
            Weldoo dashboard
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--weldoo-muted)]">
            Signed in as <span className="font-semibold text-[var(--weldoo-ink)]">{user.email}</span>.
            Your current profile type is{" "}
            <span className="font-semibold text-[var(--weldoo-ink)]">
              {profile.profile_type}
            </span>
            . The product dashboard will be implemented after onboarding.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-weldoo-border-light bg-white px-5 text-sm font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
              href="/saved/jobs"
            >
              Saved jobs
            </Link>
            {profile.profile_type === "professional" ? (
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] px-5 text-sm font-semibold text-white shadow-weldoo-md transition hover:brightness-105"
                href="/profile/edit"
              >
                Edit professional profile
              </Link>
            ) : null}
            {profile.profile_type === "company" ? (
              <>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] px-5 text-sm font-semibold text-white shadow-weldoo-md transition hover:brightness-105"
                  href="/company/edit"
                >
                  Edit company profile
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-weldoo-border-light bg-white px-5 text-sm font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
                  href="/company/jobs"
                >
                  Manage jobs
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-weldoo-border-light bg-white px-5 text-sm font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
                  href="/company/applications"
                >
                  Review applications
                </Link>
              </>
            ) : null}
            {profile.profile_type === "training_provider" ? (
              <>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] px-5 text-sm font-semibold text-white shadow-weldoo-md transition hover:brightness-105"
                  href="/training-provider/edit"
                >
                  Edit training provider profile
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-weldoo-border-light bg-white px-5 text-sm font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
                  href="/training-provider/academy"
                >
                  Manage Academy
                </Link>
              </>
            ) : null}
          </div>
          <form action={signOutAction} className="mt-4">
            <Button type="submit" variant="ghost">
              Sign out
            </Button>
          </form>
        </section>
      </main>
    </AppShell>
  );
}
