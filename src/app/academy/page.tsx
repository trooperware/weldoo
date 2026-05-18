import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/ui";
import { getAppShellAuth } from "@/lib/auth/session";
import {
  getAcademyHref,
  getAcademyListing,
  hasActiveAcademyFilters,
  parseAcademyFilters,
  type AcademyFilters,
  type AcademyItem,
} from "@/lib/academy/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  description: "Discover welding courses, webinars, workshops, and sector events.",
  title: "Academy | Weldoo",
};

type AcademyPageProps = {
  searchParams: Promise<{
    level?: string;
    location?: string;
    process?: string;
    provider?: string;
    q?: string;
    topic?: string;
    type?: string;
  }>;
};

const typeLabels: Record<string, string> = {
  in_person_course: "In-person course",
  online_course: "Online course",
  sector_event: "Sector event",
  webinar: "Webinar",
  workshop: "Workshop",
};

const levelLabels: Record<string, string> = {
  advanced: "Advanced",
  basic: "Basic",
  intermediate: "Intermediate",
};

const typeBadgeLabels: Record<string, string> = {
  in_person_course: "In person",
  online_course: "Online training",
  sector_event: "Sector event",
  webinar: "Webinar",
  workshop: "Workshop",
};

function formatDate(value: string | null) {
  if (!value) return "Date TBC";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function clearFilterHref(filters: AcademyFilters, key: keyof AcademyFilters) {
  return getAcademyHref({ ...filters, [key]: undefined });
}

function FilterLink({
  active,
  children,
  href,
}: {
  active: boolean;
  children: ReactNode;
  href: string;
}) {
  return (
    <Link
      className={[
        "inline-flex h-8 items-center gap-1.5 rounded-full border-[1.5px] px-3.5 text-[12.5px] font-medium tracking-[-0.01em] shadow-weldoo-sm transition",
        active
          ? "border-weldoo-indigo bg-weldoo-indigo/[0.08] font-semibold text-weldoo-indigo shadow-[0_0_0_3px_rgba(61,61,180,0.08)]"
          : "border-weldoo-border-light bg-white text-weldoo-slate hover:border-[#c8c8e4] hover:text-weldoo-indigo",
      ].join(" ")}
      href={href}
    >
      {children}
    </Link>
  );
}

function ActiveFilterPills({ filters }: { filters: AcademyFilters }) {
  const pills = [
    filters.query ? ["query", `Search: ${filters.query}`] : null,
    filters.type ? ["type", typeLabels[filters.type] ?? filters.type] : null,
    filters.level ? ["level", levelLabels[filters.level] ?? filters.level] : null,
    filters.location ? ["location", `Location: ${filters.location}`] : null,
    filters.process ? ["process", `Process: ${filters.process}`] : null,
    filters.topic ? ["topic", `Topic: ${filters.topic}`] : null,
    filters.provider ? ["provider", `Provider: ${filters.provider}`] : null,
  ].filter(Boolean) as Array<[keyof AcademyFilters, string]>;

  if (!pills.length) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {pills.map(([key, label]) => (
        <Link
          className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-weldoo-indigo/20 bg-weldoo-indigo/[0.08] px-3 text-xs font-semibold text-weldoo-indigo"
          href={clearFilterHref(filters, key)}
          key={key}
        >
          {label}
          <span className="text-sm leading-none opacity-70">x</span>
        </Link>
      ))}
      <Link
        className="inline-flex h-[26px] items-center rounded-full px-2 text-xs font-semibold text-weldoo-muted hover:text-weldoo-indigo"
        href="/academy"
      >
        Clear all
      </Link>
    </div>
  );
}

function getOwnProfileEditHref(profileType?: string | null) {
  if (profileType === "company") return "/company/edit";
  if (profileType === "training_provider") return "/training-provider/edit";
  return "/profile/edit";
}

function getTypeHref(filters: AcademyFilters, type?: AcademyFilters["type"]) {
  return getAcademyHref({ ...filters, type });
}

function AcademyTypeIcon({
  className = "h-3 w-3",
  type,
}: {
  className?: string;
  type: AcademyItem["type"] | "in_person";
}) {
  if (type === "online_course") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
        <rect height="14" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="20" x="2" y="3" />
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    );
  }

  if (type === "webinar") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
        <path d="m23 7-7 5 7 5V7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <rect height="14" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="15" x="1" y="5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function CalendarIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="18" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" width="18" x="3" y="4" />
      <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" x1="16" x2="16" y1="2" y2="6" />
      <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" x1="8" x2="8" y1="2" y2="6" />
      <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function ClockIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function LocationIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function PlayIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="m10 8 6 4-6 4V8Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function courseTone(type: AcademyItem["type"]) {
  if (type === "webinar") {
    return {
      badge: "bg-[#42b8d4]/85 text-white",
      gradient: "from-[#0a2a3a] to-[#0e4a5a]",
      label: "WEBINAR",
    };
  }

  if (type === "online_course") {
    return {
      badge: "bg-weldoo-indigo/85 text-white",
      gradient: "from-[#1e1e4a] to-weldoo-indigo",
      label: "ONLINE TRAINING",
    };
  }

  return {
    badge: "bg-[#5ce8b4]/90 text-[#0c2a1e]",
    gradient: "from-[#0a2a1a] to-[#0e3a2a]",
    label: type === "sector_event" ? "SECTOR EVENT" : "IN PERSON",
  };
}

function levelTone(level: AcademyItem["level"]) {
  if (level === "advanced") return "bg-[#e05c7e]/90 text-white";
  if (level === "intermediate") return "bg-[#f5a623]/90 text-[#5a3200]";
  return "border border-white/40 bg-white/90 text-weldoo-slate";
}

function AcademyCard({ item }: { item: AcademyItem }) {
  const isOnline = item.type === "online_course" || item.type === "webinar" || Boolean(item.online_url);
  const primaryLocation = isOnline ? "Online" : item.location ?? item.provider?.location ?? "Location TBC";
  const tone = courseTone(item.type);
  const metaIcon = item.type === "webinar" ? <CalendarIcon /> : isOnline ? <AcademyTypeIcon type="in_person" /> : <LocationIcon />;
  const metaText = item.type === "webinar" ? formatDate(item.starts_at) : primaryLocation;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[16px] border border-weldoo-border-light bg-white shadow-weldoo-sm transition hover:-translate-y-1 hover:border-[#d0d0ea] hover:shadow-[0_8px_32px_rgba(61,61,180,0.12)]">
      <div className={`relative aspect-video shrink-0 overflow-hidden bg-gradient-to-br ${tone.gradient}`}>
        <div className="absolute -right-12 -top-16 h-[140px] w-[140px] rounded-full bg-white/[0.04]" />
        <div className="absolute left-10 top-[50px] h-[170px] w-[280px] rounded-[10px] border border-white/[0.08] bg-white/[0.04]" />
        <div className="absolute left-[56px] top-[134px] h-[5px] w-[200px] rounded-full bg-white/[0.18]" />
        <div className="absolute left-[56px] top-[148px] h-[5px] w-[160px] rounded-full bg-white/[0.12]" />
        <span className="absolute left-1/2 top-[44%] -translate-x-1/2 text-[13px] font-bold text-white/50">
          {tone.label}
        </span>
        <span className={`absolute left-3 top-3 inline-flex h-6 items-center gap-[5px] rounded-full px-2.5 text-[10.5px] font-bold tracking-[0.04em] backdrop-blur ${tone.badge}`}>
          <AcademyTypeIcon className="h-[11px] w-[11px]" type={item.type} />
          {typeBadgeLabels[item.type]}
        </span>
        {item.level ? (
          <span className={`absolute right-3 top-3 inline-flex h-[22px] items-center rounded-full px-[9px] text-[10px] font-bold uppercase tracking-[0.05em] ${levelTone(item.level)}`}>
            {levelLabels[item.level]}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-[18px] py-4 pb-[18px]">
        <h2 className="text-[14.5px] font-bold leading-[1.35] tracking-[-0.1px] text-weldoo-ink">
          {item.title}
        </h2>
        <p className="line-clamp-2 text-[12.5px] leading-[1.6] text-weldoo-muted">
          {item.description}
        </p>
        <div className="mt-auto flex items-center gap-3 border-t border-weldoo-border-light pt-1.5">
          {item.duration_text ? (
            <span className="flex items-center gap-1 text-[11.5px] text-weldoo-muted">
              <ClockIcon />
              {item.duration_text}
            </span>
          ) : null}
          <span className="flex min-w-0 items-center gap-1 text-[11.5px] text-weldoo-muted">
            {metaIcon}
            <span className="truncate">{metaText}</span>
          </span>
        </div>
        <Link
          className="mt-3 flex h-[38px] w-full items-center justify-center gap-1.5 rounded-full border-[1.5px] border-weldoo-border bg-white text-[13px] font-semibold tracking-[-0.01em] text-weldoo-slate transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/[0.04] hover:text-weldoo-indigo hover:shadow-[0_0_0_3px_rgba(61,61,180,0.08)]"
          href={`/academy?course=${item.id}`}
        >
          <PlayIcon />
          View course
        </Link>
      </div>
    </article>
  );
}

export default async function AcademyPage({ searchParams }: AcademyPageProps) {
  const [params, appShellAuth] = await Promise.all([searchParams, getAppShellAuth()]);
  const filters = parseAcademyFilters(params);
  const supabase = await createSupabaseServerClient();
  const listing = await getAcademyListing(supabase, filters);
  const ownProfileEditHref = getOwnProfileEditHref(appShellAuth?.profileType);

  return (
    <AppShell auth={appShellAuth}>
      <main>
        <section className="mx-auto grid max-w-[1128px] grid-cols-1 items-start gap-6 px-4 pb-20 pt-7 lg:grid-cols-[225px_minmax(0,1fr)]">
          <aside className="hidden flex-col gap-3 lg:sticky lg:top-20 lg:flex">
            <section className="overflow-hidden rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm">
              <div className="h-16 bg-[linear-gradient(135deg,#2a2a8a_0%,#3d3db4_35%,#42b8d4_70%,#5ce8b4_100%)]" />
              <div className="px-4 pb-4">
                <div className="-mt-[22px] mb-2.5 flex h-12 w-12 items-center justify-center rounded-weldoo-md bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-base font-bold text-white shadow-weldoo-sm">
                  {(appShellAuth?.email ?? "W").slice(0, 1).toUpperCase()}
                </div>
                <h2 className="mb-0.5 truncate text-[15px] font-bold tracking-[-0.01em] text-weldoo-ink">
                  Weldoo Academy
                </h2>
                <p className="mb-2.5 text-xs font-normal leading-[1.45] text-weldoo-slate">
                  Courses, webinars, and training events for welders.
                </p>
                <div className="flex flex-col gap-1.5 border-t border-weldoo-border-light pt-2.5 text-xs font-normal text-weldoo-slate">
                  <div className="flex items-center gap-[7px]">
                    <AcademyTypeIcon className="h-[13px] w-[13px] shrink-0 text-weldoo-muted" type="online_course" />
                    <span>{listing.totalCount} courses</span>
                  </div>
                  <div className="flex items-center gap-[7px]">
                    <ClockIcon className="h-[13px] w-[13px] shrink-0 text-weldoo-muted" />
                    <span>Updated live</span>
                  </div>
                </div>
                <Link
                  className="mt-3.5 flex h-9 w-full items-center justify-center rounded-full border-[1.5px] border-weldoo-border bg-white text-[13px] font-semibold tracking-[-0.01em] text-weldoo-slate transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/5 hover:text-weldoo-indigo"
                  href={ownProfileEditHref}
                >
                  Edit profile
                </Link>
              </div>
            </section>
          </aside>

          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-[18px] font-extrabold tracking-[-0.3px] text-weldoo-ink">
                <span>{listing.totalCount}</span> courses available
              </h1>

              <div className="flex flex-wrap items-center gap-2">
                <FilterLink active={!filters.type} href={getTypeHref(filters, undefined)}>
                  All
                </FilterLink>
                <FilterLink
                  active={filters.type === "online_course"}
                  href={getTypeHref(filters, filters.type === "online_course" ? undefined : "online_course")}
                >
                  <AcademyTypeIcon type="online_course" />
                  Online training
                </FilterLink>
                <FilterLink
                  active={filters.type === "webinar"}
                  href={getTypeHref(filters, filters.type === "webinar" ? undefined : "webinar")}
                >
                  <AcademyTypeIcon type="webinar" />
                  Webinar
                </FilterLink>
                <FilterLink
                  active={filters.type === "in_person_course"}
                  href={getTypeHref(filters, filters.type === "in_person_course" ? undefined : "in_person_course")}
                >
                  <AcademyTypeIcon type="in_person" />
                  In person
                </FilterLink>
              </div>
            </div>

            <ActiveFilterPills filters={filters} />

            {listing.items.length ? (
              <section className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
                {listing.items.map((item) => (
                  <AcademyCard item={item} key={item.id} />
                ))}
              </section>
            ) : (
              <section className="rounded-[16px] border border-weldoo-border-light bg-white p-6 shadow-weldoo-sm">
                <EmptyState
                  description={
                    hasActiveAcademyFilters(filters)
                      ? "Try clearing filters or searching for a broader welding process, provider, or topic."
                      : "Published courses, webinars, workshops, and events will appear here."
                  }
                  title="No academy items found"
                />
              </section>
            )}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
