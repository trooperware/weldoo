import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { signOutAction } from "@/server/actions/auth";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <AppShell>
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
            The product dashboard will be implemented after onboarding.
          </p>
          <form action={signOutAction} className="mt-6">
            <Button type="submit" variant="ghost">
              Sign out
            </Button>
          </form>
        </section>
      </main>
    </AppShell>
  );
}
