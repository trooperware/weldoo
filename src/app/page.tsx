const sprintZeroItems = [
  "Confirm stack and environment variables",
  "Extract design tokens from the prototype",
  "Create the base UI component library",
  "Design the initial Supabase schema",
  "Add Supabase clients and RLS policies",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--weldoo-bg)] px-6 py-12 text-[var(--weldoo-ink)]">
      <section className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--weldoo-indigo)]">
            Weldoo MVP
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Sprint-ready web app foundation
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[var(--weldoo-muted)]">
            This Next.js App Router project is prepared for building Weldoo as
            a responsive professional network for welders, companies, and
            training providers. Product implementation starts in Sprint 0.
          </p>
          <a
            className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] px-5 text-sm font-semibold text-white shadow-weldoo-md transition hover:brightness-105"
            href="/style-guide"
          >
            Open style guide
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--weldoo-border)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Workspace structure</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--weldoo-muted)]">
              <li>
                <code className="rounded bg-[var(--weldoo-bg)] px-1.5 py-0.5">
                  src/app
                </code>{" "}
                routes and layouts
              </li>
              <li>
                <code className="rounded bg-[var(--weldoo-bg)] px-1.5 py-0.5">
                  src/components
                </code>{" "}
                reusable UI and feature components
              </li>
              <li>
                <code className="rounded bg-[var(--weldoo-bg)] px-1.5 py-0.5">
                  src/server
                </code>{" "}
                actions, queries, and mutations
              </li>
              <li>
                <code className="rounded bg-[var(--weldoo-bg)] px-1.5 py-0.5">
                  docs
                </code>{" "}
                planning, task, and validation documents
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--weldoo-border)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Sprint 0 checklist</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--weldoo-muted)]">
              {sprintZeroItems.map((item) => (
                <li className="flex gap-3" key={item}>
                  <span className="mt-2 h-2 w-2 rounded-full bg-[var(--weldoo-mint)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
