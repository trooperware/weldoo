const colorTokens = [
  ["Indigo", "var(--weldoo-indigo)", "#3d3db4"],
  ["Indigo dark", "var(--weldoo-indigo-dark)", "#2d2d9a"],
  ["Periwinkle", "var(--weldoo-peri)", "#7b7fe8"],
  ["Sky", "var(--weldoo-sky)", "#42b8d4"],
  ["Mint", "var(--weldoo-mint)", "#5ce8b4"],
  ["Ink", "var(--weldoo-ink)", "#0c0c18"],
  ["Slate", "var(--weldoo-slate)", "#44446a"],
  ["Muted", "var(--weldoo-muted)", "#7a7a9a"],
  ["Border", "var(--weldoo-border)", "#e0e0ed"],
  ["Background", "var(--weldoo-bg)", "#f5f5fb"],
];

const navItems = ["Feed", "Network", "Jobs", "Academy"];

export default function StyleGuidePage() {
  return (
    <main className="min-h-screen bg-weldoo-bg px-6 py-10 text-weldoo-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="space-y-3">
          <a className="text-sm font-semibold text-weldoo-indigo" href="/">
            Back to project home
          </a>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-weldoo-indigo">
              Sprint 0.1.2
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Weldoo style guide
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-weldoo-muted">
              Design tokens extracted from the static prototype and converted
              into reusable CSS variables and Tailwind theme values.
            </p>
          </div>
        </header>

        <section className="rounded-weldoo-lg border border-weldoo-border-light bg-white p-6 shadow-weldoo-sm">
          <h2 className="text-lg font-semibold">Color tokens</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {colorTokens.map(([name, variable, hex]) => (
              <div
                className="overflow-hidden rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm"
                key={name}
              >
                <div
                  className="h-20"
                  style={{ backgroundColor: variable }}
                />
                <div className="space-y-1 p-3">
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="font-mono text-xs text-weldoo-muted">{hex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-weldoo-lg border border-weldoo-border-light bg-white p-6 shadow-weldoo-md">
            <h2 className="text-lg font-semibold">Actions and forms</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="h-11 rounded-weldoo-sm bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] px-5 text-sm font-semibold text-white shadow-weldoo-md transition hover:brightness-105">
                Primary action
              </button>
              <button className="h-11 rounded-weldoo-sm border border-weldoo-indigo px-5 text-sm font-semibold text-weldoo-indigo transition hover:bg-weldoo-bg">
                Secondary action
              </button>
              <button className="h-11 rounded-weldoo-sm border border-weldoo-border-light px-5 text-sm font-semibold text-weldoo-slate transition hover:border-weldoo-border hover:bg-weldoo-bg">
                Neutral action
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold">Professional title</span>
                <input
                  className="h-11 w-full rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 text-sm outline-none transition focus:border-weldoo-indigo focus:bg-white focus:ring-4 focus:ring-weldoo-indigo/10"
                  placeholder="TIG Welder · Stainless Steel"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold">Location</span>
                <input
                  className="h-11 w-full rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 text-sm outline-none transition focus:border-weldoo-indigo focus:bg-white focus:ring-4 focus:ring-weldoo-indigo/10"
                  placeholder="Barcelona, Spain"
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-semibold">Bio</span>
                <textarea
                  className="min-h-28 w-full rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 py-3 text-sm outline-none transition focus:border-weldoo-indigo focus:bg-white focus:ring-4 focus:ring-weldoo-indigo/10"
                  placeholder="Describe welding experience, processes, materials, and availability."
                />
              </label>
            </div>
          </div>

          <aside className="rounded-weldoo-lg border border-weldoo-border-light bg-white p-6 shadow-weldoo-md">
            <h2 className="text-lg font-semibold">Profile card</h2>
            <div className="mt-5 overflow-hidden rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm">
              <div className="h-20 bg-[linear-gradient(135deg,#2a2a8a_0%,#3d3db4_35%,#42b8d4_70%,#5ce8b4_100%)]" />
              <div className="px-5 pb-5">
                <div className="-mt-6 flex h-12 w-12 items-center justify-center rounded-weldoo-md bg-[linear-gradient(135deg,#3d3db4,#5558e8)] text-sm font-bold text-white shadow-weldoo-md">
                  DW
                </div>
                <h3 className="mt-3 text-base font-bold">Demo Welder</h3>
                <p className="mt-1 text-sm leading-5 text-weldoo-slate">
                  Senior TIG Welder · Pressure vessels
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["TIG", "316L", "6G", "EN ISO 9606-1"].map((tag) => (
                    <span
                      className="rounded-full border border-weldoo-border-light bg-weldoo-bg px-3 py-1 text-xs font-semibold text-weldoo-indigo"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-weldoo-lg border border-weldoo-border-light bg-white p-6 shadow-weldoo-sm">
          <h2 className="text-lg font-semibold">Navigation states</h2>
          <nav className="mt-5 flex flex-wrap gap-2">
            {navItems.map((item, index) => (
              <button
                className={
                  index === 0
                    ? "rounded-full bg-weldoo-indigo/10 px-4 py-2 text-sm font-semibold text-weldoo-indigo"
                    : "rounded-full px-4 py-2 text-sm font-medium text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-ink"
                }
                key={item}
              >
                {item}
              </button>
            ))}
          </nav>
        </section>
      </div>
    </main>
  );
}
