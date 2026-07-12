import type { ReactNode } from "react";

type PublicProfileTone = "company" | "professional" | "training";

type PublicProfileMetaItem = {
  label: string;
  type: "link" | "location" | "role";
};

type PublicProfileHeaderCardProps = {
  actions: ReactNode;
  avatarShape?: "round" | "square";
  avatarUrl: string | null;
  badges?: ReactNode;
  bio: string | null;
  coverUrl: string | null;
  headline?: string | null;
  initials: string;
  metaItems: PublicProfileMetaItem[];
  name: string;
  tone: PublicProfileTone;
  typeLabel: string;
};

type PublicProfileStat = {
  label: string;
  value: string;
};

type PublicProfileStatsCardProps = {
  stats: PublicProfileStat[];
};

type PublicProfileSectionCardProps = {
  children: ReactNode;
  title: string;
};

const coverToneClasses: Record<PublicProfileTone, string> = {
  company: "bg-[linear-gradient(135deg,#243b55_0%,#4f7f91_56%,#d5eee8_100%)]",
  professional: "bg-[linear-gradient(135deg,#33328f_0%,#5b5ee8_52%,#d9ddff_100%)]",
  training: "bg-[linear-gradient(135deg,#254f5a_0%,#4d8d80_56%,#d7efe2_100%)]",
};

function MetaIcon({ type }: { type: PublicProfileMetaItem["type"] }) {
  if (type === "location") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === "link") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <rect
        height="14"
        rx="2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        width="18"
        x="3"
        y="7"
      />
      <path
        d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function VerifiedMark() {
  return (
    <span className="absolute bottom-1 right-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border-[3px] border-white bg-[var(--weldoo-indigo)] text-white shadow-sm">
      <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
        <path
          d="m5 12 4 4L19 6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.6"
        />
      </svg>
    </span>
  );
}

export function PublicProfileHeaderCard({
  actions,
  avatarShape = "round",
  avatarUrl,
  badges,
  bio,
  coverUrl,
  headline,
  initials,
  metaItems,
  name,
  tone,
  typeLabel,
}: PublicProfileHeaderCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--weldoo-border)] bg-white shadow-weldoo-sm">
      <div className={`relative h-40 ${coverUrl ? "bg-weldoo-bg" : coverToneClasses[tone]}`}>
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="h-full w-full object-cover" src={coverUrl} />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.32),transparent_34%),linear-gradient(180deg,rgba(10,17,35,0.08)_0%,rgba(10,17,35,0.18)_100%)]" />
        <span className="absolute right-4 top-3 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-sm backdrop-blur">
          {typeLabel}
        </span>
      </div>

      <div className="px-5 pb-7 sm:px-8">
        <div className="relative mb-3 -mt-11 inline-block">
          <div
            className={`flex h-[88px] w-[88px] items-center justify-center overflow-hidden border-4 border-white bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-2xl font-extrabold text-white shadow-weldoo-md ${
              avatarShape === "square" ? "rounded-[18px]" : "rounded-full"
            }`}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
            ) : (
              initials
            )}
          </div>
          <VerifiedMark />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[25px] font-extrabold leading-tight text-[var(--weldoo-ink)] sm:text-[28px]">
              {name}
            </h1>
            {headline ? (
              <p className="mt-2 text-[15px] font-semibold leading-6 text-[var(--weldoo-slate)]">
                {headline}
              </p>
            ) : null}
            {metaItems.length ? (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-[var(--weldoo-muted)]">
                {metaItems.map((item) => (
                  <span key={`${item.type}-${item.label}`} className="inline-flex items-center gap-1.5">
                    <MetaIcon type={item.type} />
                    {item.label}
                  </span>
                ))}
              </div>
            ) : null}
            {badges ? <div className="mt-4 flex flex-wrap gap-2">{badges}</div> : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 sm:mt-8 sm:justify-end">
            {actions}
          </div>
        </div>

        {bio ? (
          <p className="mt-6 max-w-[680px] whitespace-pre-line text-sm leading-6 text-[var(--weldoo-muted)]">
            {bio}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function PublicProfileStatsCard({ stats }: PublicProfileStatsCardProps) {
  const columnsClass = stats.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3";

  return (
    <section className={`grid overflow-hidden rounded-2xl border border-[var(--weldoo-border)] bg-white shadow-weldoo-sm ${columnsClass}`}>
      {stats.map((stat, index) => (
        <div
          className={`px-5 py-4 ${index > 0 ? "border-t border-[var(--weldoo-border-light)] sm:border-l sm:border-t-0" : ""}`}
          key={stat.label}
        >
          <p className="text-xl font-extrabold leading-none text-[var(--weldoo-ink)]">
            {stat.value}
          </p>
          <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--weldoo-muted)]">
            {stat.label}
          </p>
        </div>
      ))}
    </section>
  );
}

export function PublicProfileSectionCard({
  children,
  title,
}: PublicProfileSectionCardProps) {
  return (
    <section className="rounded-2xl border border-[var(--weldoo-border)] bg-white p-5 shadow-weldoo-sm sm:p-6">
      <h2 className="text-base font-extrabold text-[var(--weldoo-ink)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
