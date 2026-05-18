import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/ui";
import { getAppShellAuth } from "@/lib/auth/session";
import {
  getEventsHref,
  getEventsListing,
  hasActiveEventFilters,
  parseEventFilters,
  type AcademyItem,
  type EventFilters,
} from "@/lib/academy/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  description: "Discover welding industry events, forums, and sector meetings on Weldoo.",
  title: "Events | Weldoo",
};

type EventsPageProps = {
  searchParams: Promise<{
    location?: string;
    mode?: string;
    q?: string;
    topic?: string;
  }>;
};

function formatEventDate(value: string | null, endValue?: string | null) {
  if (!value) return "Date TBC";
  const start = new Date(value);
  const end = endValue ? new Date(endValue) : null;

  const formatter = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (!end || start.toDateString() === end.toDateString()) return formatter.format(start);
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function getDateBadge(value: string | null) {
  if (!value) return { day: "--", month: "TBC" };

  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
  };
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

function LocationIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
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

function PeopleIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function MonitorIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="14" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" width="20" x="2" y="3" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function MoreIcon({ className = "h-[15px] w-[15px]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="10" x2="21" y1="14" y2="3" />
    </svg>
  );
}

function clearFilterHref(filters: EventFilters, key: keyof EventFilters) {
  return getEventsHref({ ...filters, [key]: undefined });
}

function FilterPill({
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

function ActiveFilterPills({ filters }: { filters: EventFilters }) {
  const pills = [
    filters.query ? ["query", `Search: ${filters.query}`] : null,
    filters.location ? ["location", `Location: ${filters.location}`] : null,
    filters.mode ? ["mode", filters.mode === "virtual" ? "Virtual" : "In person"] : null,
    filters.topic ? ["topic", `Topic: ${filters.topic}`] : null,
  ].filter(Boolean) as Array<[keyof EventFilters, string]>;

  if (!pills.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
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
        href="/events"
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

function EventCard({ item }: { item: AcademyItem }) {
  const location = item.location ?? item.provider?.location ?? "Location TBC";
  const dateLabel = formatEventDate(item.starts_at, item.ends_at);
  const badge = getDateBadge(item.starts_at);
  const isVirtual = Boolean(item.online_url) || item.location === "Online";

  return (
    <article className="group flex cursor-pointer flex-col overflow-hidden rounded-[16px] border border-weldoo-border-light bg-white shadow-weldoo-sm transition hover:-translate-y-1 hover:border-[#d0d0ea] hover:shadow-[0_8px_32px_rgba(61,61,180,0.12)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-weldoo-bg-strong">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0a1e2e_0%,#123f54_52%,#42b8d4_100%)]" />
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#5ce8b4]/15" />
        <div className="absolute left-8 top-10 h-[112px] w-[200px] rounded-[10px] border border-white/15 bg-white/[0.04]" />
        <div className="absolute left-[58px] top-[78px] h-2 w-[138px] rounded-full bg-white/20" />
        <div className="absolute left-[58px] top-[98px] h-2 w-[178px] rounded-full bg-white/12" />
        <div className="absolute left-[58px] top-[118px] h-2 w-[112px] rounded-full bg-white/10" />
        <div className="absolute bottom-7 right-9 h-12 w-12 rounded-full bg-[#5ce8b4]/70" />
        <div className="absolute left-3 top-3 min-w-[42px] rounded-[8px] bg-weldoo-indigo px-2.5 py-[5px] text-center leading-[1.1]">
          <span className="block text-[20px] font-black tracking-[-0.5px] text-white">{badge.day}</span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.06em] text-white/80">{badge.month}</span>
        </div>
        <button
          aria-label={`More actions for ${item.title}`}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-weldoo-slate transition hover:bg-white"
          type="button"
        >
          <MoreIcon />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-4 py-3.5 pb-4">
        <div className="flex items-center gap-[5px] text-[11.5px] text-weldoo-muted">
          <CalendarIcon className="h-[13px] w-[13px] shrink-0" />
          {dateLabel}
        </div>
        <h2 className="text-[13.5px] font-bold leading-[1.4] tracking-[-0.1px] text-weldoo-ink">
          {item.title}
        </h2>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex h-[26px] items-center gap-[5px] rounded-full bg-weldoo-indigo/[0.06] px-2.5 text-[11.5px] font-medium text-weldoo-slate">
            {isVirtual ? <MonitorIcon /> : <PeopleIcon />}
            {isVirtual ? "Virtual" : "In person"}
          </span>
          <span className="inline-flex h-[26px] min-w-0 max-w-full items-center gap-[5px] rounded-full bg-weldoo-indigo/[0.06] px-2.5 text-[11.5px] font-medium text-weldoo-slate">
            <LocationIcon />
            <span className="truncate">{location}</span>
          </span>
          {item.duration_text ? (
            <span className="inline-flex h-[26px] items-center gap-[5px] rounded-full bg-weldoo-indigo/[0.06] px-2.5 text-[11.5px] font-medium text-weldoo-slate">
              <ClockIcon />
              {item.duration_text}
            </span>
          ) : null}
        </div>

        <p className="line-clamp-2 text-[12.5px] leading-[1.5] text-weldoo-muted">
          {item.description}
        </p>

        <Link
          className="mt-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-weldoo-border bg-white px-4 text-[12.5px] font-semibold tracking-[-0.01em] text-weldoo-slate transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/[0.04] hover:text-weldoo-indigo"
          href={`/academy/${item.id}`}
        >
          <ExternalLinkIcon />
          View details
        </Link>
      </div>
    </article>
  );
}

function EventsSidebar({
  count,
  email,
  ownProfileEditHref,
}: {
  count: number;
  email?: string | null;
  ownProfileEditHref: string;
}) {
  return (
    <aside className="hidden flex-col gap-3 lg:sticky lg:top-20 lg:flex">
      <section className="overflow-hidden rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm">
        <div className="h-16 bg-[linear-gradient(135deg,#2a2a8a_0%,#3d3db4_35%,#42b8d4_70%,#5ce8b4_100%)]" />
        <div className="px-4 pb-4">
          <div className="-mt-[22px] mb-2.5 flex h-12 w-12 items-center justify-center rounded-weldoo-md bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-base font-bold text-white shadow-weldoo-sm">
            {(email ?? "W").slice(0, 1).toUpperCase()}
          </div>
          <h2 className="mb-0.5 truncate text-[15px] font-bold tracking-[-0.01em] text-weldoo-ink">
            Weldoo Events
          </h2>
          <p className="mb-2.5 text-xs font-normal leading-[1.45] text-weldoo-slate">
            Discover welding forums, meetups, and sector events.
          </p>
          <div className="flex flex-col gap-1.5 border-t border-weldoo-border-light pt-2.5 text-xs font-normal text-weldoo-slate">
            <div className="flex items-center gap-[7px]">
              <CalendarIcon className="h-[13px] w-[13px] shrink-0 text-weldoo-muted" />
              <span>{count} events</span>
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
  );
}

function getModeHref(filters: EventFilters, mode?: EventFilters["mode"]) {
  return getEventsHref({ ...filters, mode });
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const [params, appShellAuth] = await Promise.all([searchParams, getAppShellAuth()]);
  const filters = parseEventFilters(params);
  const supabase = await createSupabaseServerClient();
  const listing = await getEventsListing(supabase, filters);
  const ownProfileEditHref = getOwnProfileEditHref(appShellAuth?.profileType);

  return (
    <AppShell auth={appShellAuth}>
      <main>
        <section className="mx-auto grid max-w-[1128px] grid-cols-1 items-start gap-6 px-4 pb-20 pt-7 lg:grid-cols-[225px_minmax(0,1fr)]">
          <EventsSidebar
            count={listing.totalCount}
            email={appShellAuth?.email}
            ownProfileEditHref={ownProfileEditHref}
          />

          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-[18px] font-extrabold tracking-[-0.3px] text-weldoo-ink">
                <span>{listing.totalCount}</span> events found
              </h1>

              <div className="flex flex-wrap items-center gap-2">
                <FilterPill active={!filters.mode} href={getModeHref(filters, undefined)}>
                  All
                </FilterPill>
                <FilterPill
                  active={filters.mode === "in_person"}
                  href={getModeHref(filters, filters.mode === "in_person" ? undefined : "in_person")}
                >
                  <PeopleIcon />
                  In person
                </FilterPill>
                <FilterPill
                  active={filters.mode === "virtual"}
                  href={getModeHref(filters, filters.mode === "virtual" ? undefined : "virtual")}
                >
                  <MonitorIcon />
                  Virtual
                </FilterPill>
              </div>
            </div>

            <ActiveFilterPills filters={filters} />

            {listing.items.length ? (
              <section className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
                {listing.items.map((item) => (
                  <EventCard item={item} key={item.id} />
                ))}
              </section>
            ) : (
              <section className="rounded-[16px] border border-weldoo-border-light bg-white p-6 shadow-weldoo-sm">
                <EmptyState
                  description={
                    hasActiveEventFilters(filters)
                      ? "Try clearing filters or searching for a broader sector event, location, or topic."
                      : "Published sector events will appear here when training providers add them."
                  }
                  title="No events found"
                />
              </section>
            )}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
