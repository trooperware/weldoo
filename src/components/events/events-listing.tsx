"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/ui";
import type { AcademyItem } from "@/lib/academy/queries";

type EventMode = "all" | "in_person" | "virtual";

function formatCompactEventDate(value: string | null) {
  if (!value) return "TBC";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replaceAll("/", ".");
}

function formatEventDate(value: string | null, endValue?: string | null) {
  if (!value) return "Date TBC";
  const start = new Date(value);
  const end = endValue ? new Date(endValue) : null;

  if (!end || start.toDateString() === end.toDateString()) return formatCompactEventDate(value);
  return `${formatCompactEventDate(value)} – ${formatCompactEventDate(endValue ?? null)}`;
}

function getDateBadge(value: string | null) {
  if (!value) return { day: "--", month: "TBC" };

  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
  };
}

function isVirtualEvent(item: AcademyItem) {
  return Boolean(item.online_url) || item.location === "Online";
}

function matchesMode(item: AcademyItem, mode: EventMode) {
  if (mode === "virtual") return isVirtualEvent(item);
  if (mode === "in_person") return !isVirtualEvent(item);
  return true;
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

const eventArtworkThemes = [
  { accent: "#42b8d4", badge: "#3d3db4", glow: "#5ce8b4", start: "#0a1e2e", stop: "#0a3050" },
  { accent: "#f5a623", badge: "#f5a623", glow: "#42b8d4", start: "#120a2e", stop: "#2c1f5c" },
  { accent: "#5ce8b4", badge: "#5ce8b4", glow: "#3d3db4", start: "#0d200d", stop: "#1a3a1a" },
  { accent: "#7b7fe8", badge: "#7b7fe8", glow: "#e05c7e", start: "#1a0a2e", stop: "#3a1a5e" },
  { accent: "#42b8d4", badge: "#42b8d4", glow: "#5ce8b4", start: "#0a2a3a", stop: "#0e4a5a" },
  { accent: "#5ce8b4", badge: "#5ce8b4", glow: "#f5a623", start: "#0a2a1a", stop: "#0e3a2a" },
];

function EventArtwork({ index, title }: { index: number; title: string }) {
  const theme = eventArtworkThemes[index % eventArtworkThemes.length];
  const gradientId = `event-gradient-${index}`;
  const label = title.split(":")[0]?.slice(0, 26) || "Weldoo Event";

  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={theme.start} />
          <stop offset="100%" stopColor={theme.stop} />
        </linearGradient>
      </defs>
      <rect fill={`url(#${gradientId})`} height="300" width="480" />
      <circle cx="430" cy="42" fill={theme.glow} opacity=".12" r="140" />
      <circle cx="105" cy="220" fill={theme.accent} opacity=".08" r="150" />
      <rect fill="#fff" fillOpacity=".04" height="160" rx="12" stroke={theme.accent} strokeOpacity=".2" strokeWidth="1" width="320" x="80" y="70" />
      <text fill={theme.accent} fillOpacity=".72" fontFamily="Albert Sans, sans-serif" fontSize="19" fontWeight="800" textAnchor="middle" x="240" y="120">
        {label}
      </text>
      <rect fill="#fff" height="6" opacity=".18" rx="3" width="205" x="138" y="145" />
      <rect fill="#fff" height="6" opacity=".12" rx="3" width="155" x="162" y="164" />
      <rect fill={theme.accent} fillOpacity=".16" height="46" rx="23" width="46" x="354" y="204" />
    </svg>
  );
}

function getEventBadgeColor(index: number) {
  return eventArtworkThemes[index % eventArtworkThemes.length].badge;
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={[
        "inline-flex h-8 items-center gap-1.5 rounded-full border-[1.5px] px-3.5 text-[12.5px] font-medium tracking-[-0.01em] shadow-weldoo-sm transition",
        active
          ? "border-weldoo-indigo bg-weldoo-indigo/[0.08] font-semibold text-weldoo-indigo shadow-[0_0_0_3px_rgba(61,61,180,0.08)]"
          : "border-weldoo-border-light bg-white text-weldoo-slate hover:border-[#c8c8e4] hover:text-weldoo-indigo",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function EventCard({ index, item }: { index: number; item: AcademyItem }) {
  const location = item.location ?? item.provider?.location ?? "Location TBC";
  const dateLabel = formatEventDate(item.starts_at, item.ends_at);
  const badge = getDateBadge(item.starts_at);
  const isVirtual = isVirtualEvent(item);
  const badgeColor = getEventBadgeColor(index);
  const badgeTextColor = badgeColor === "#5ce8b4" ? "#0c2a1e" : "#fff";

  return (
    <article className="group flex cursor-pointer flex-col overflow-hidden rounded-[16px] border border-weldoo-border-light bg-white shadow-weldoo-sm transition hover:-translate-y-1 hover:border-[#d0d0ea] hover:shadow-[0_8px_32px_rgba(61,61,180,0.12)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-weldoo-bg-strong">
        <EventArtwork index={index} title={item.title} />
        <div
          className="absolute left-3 top-3 min-w-[42px] rounded-[8px] px-2.5 py-[5px] text-center leading-[1.1]"
          style={{ background: badgeColor }}
        >
          <span className="block text-[20px] font-black tracking-[-0.5px]" style={{ color: badgeTextColor }}>
            {badge.day}
          </span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.06em]" style={{ color: badgeTextColor === "#fff" ? "rgba(255,255,255,.8)" : "rgba(12,42,30,.7)" }}>
            {badge.month}
          </span>
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
        </div>

        <Link
          className="mt-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-weldoo-border bg-white px-4 text-[12.5px] font-semibold tracking-[-0.01em] text-weldoo-slate transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/[0.04] hover:text-weldoo-indigo"
          href={`/events/${item.id}`}
        >
          <ExternalLinkIcon />
          View details
        </Link>
      </div>
    </article>
  );
}

export function EventsListing({ items }: { items: AcademyItem[] }) {
  const [mode, setMode] = useState<EventMode>("all");
  const visibleItems = useMemo(() => items.filter((item) => matchesMode(item, mode)), [items, mode]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[18px] font-extrabold tracking-[-0.3px] text-weldoo-ink">
          <span>{visibleItems.length}</span> events found
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <FilterButton active={mode === "all"} onClick={() => setMode("all")}>
            All
          </FilterButton>
          <FilterButton active={mode === "in_person"} onClick={() => setMode("in_person")}>
            <PeopleIcon />
            In person
          </FilterButton>
          <FilterButton active={mode === "virtual"} onClick={() => setMode("virtual")}>
            <MonitorIcon />
            Virtual
          </FilterButton>
        </div>
      </div>

      {visibleItems.length ? (
        <section className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item, index) => (
            <EventCard index={index} item={item} key={item.id} />
          ))}
        </section>
      ) : (
        <section className="rounded-[16px] border border-weldoo-border-light bg-white p-6 shadow-weldoo-sm">
          <EmptyState
            description="Try switching to another tab or checking back when training providers publish more events."
            title="No events found"
          />
        </section>
      )}
    </div>
  );
}
