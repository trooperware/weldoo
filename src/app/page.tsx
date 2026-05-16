import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";

const sprintZeroItems = [
  "Stack, environment variables, and project structure",
  "Prototype design tokens and shared UI components",
  "Supabase schema, clients, and RLS policies",
  "Responsive app shell validation",
];

const nextSprintItems = [
  "Authentication flows",
  "Role-based onboarding",
  "Professional profile editing",
  "Company and training provider profiles",
];

export default function Home() {
  return (
    <AppShell>
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
          <div className="space-y-6">
            <section className="rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white p-5 shadow-weldoo-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--weldoo-indigo)]">
                Sprint 0 foundation
              </p>
              <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-normal text-[var(--weldoo-ink)] sm:text-4xl">
                Ready to start building the Weldoo MVP sprint by sprint
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--weldoo-muted)]">
                The project now has a typed Next.js foundation, reusable visual system,
                Supabase database migrations, server/browser clients, and security
                policies prepared for implementation.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] px-5 text-sm font-semibold text-white shadow-weldoo-md transition hover:brightness-105"
                  href="/style-guide"
                >
                  Review UI system
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border)] bg-white px-5 text-sm font-semibold text-[var(--weldoo-slate)] shadow-weldoo-sm transition hover:border-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo)]"
                  href="/api/dev/health"
                >
                  Check backend setup
                </Link>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white p-5 shadow-weldoo-sm">
                <h2 className="text-base font-bold">Implemented foundation</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--weldoo-muted)]">
                  {sprintZeroItems.map((item) => (
                    <li className="flex gap-3" key={item}>
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--weldoo-mint)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white p-5 shadow-weldoo-sm">
                <h2 className="text-base font-bold">Next implementation sprint</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--weldoo-muted)]">
                  {nextSprintItems.map((item) => (
                    <li className="flex gap-3" key={item}>
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--weldoo-sky)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <aside className="rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white p-5 shadow-weldoo-sm">
            <h2 className="text-base font-bold">Workspace map</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-[var(--weldoo-ink)]">Application</dt>
                <dd className="mt-1 text-[var(--weldoo-muted)]">
                  App Router routes in <code>src/app</code>.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--weldoo-ink)]">Components</dt>
                <dd className="mt-1 text-[var(--weldoo-muted)]">
                  Shared UI primitives in <code>src/components/ui</code>.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--weldoo-ink)]">Database</dt>
                <dd className="mt-1 text-[var(--weldoo-muted)]">
                  Supabase migrations in <code>src/db/migrations</code>.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--weldoo-ink)]">Planning</dt>
                <dd className="mt-1 text-[var(--weldoo-muted)]">
                  Sprint tasks and validation units in <code>docs</code>.
                </dd>
              </div>
            </dl>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
