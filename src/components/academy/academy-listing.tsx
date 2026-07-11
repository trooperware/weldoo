"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/ui";
import {
  getAcademyHref,
  hasActiveAcademyFilters,
  type AcademyFilters,
  type AcademyItem,
} from "@/lib/academy/queries";

type AcademyLocalType = NonNullable<AcademyFilters["type"]> | "all";

type AcademyListingProps = {
  filters: AcademyFilters;
  items: AcademyItem[];
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

function ActiveFilterPills({
  filters,
  localType,
  setLocalType,
}: {
  filters: AcademyFilters;
  localType: AcademyLocalType;
  setLocalType: (type: AcademyLocalType) => void;
}) {
  const serverFilters = { ...filters, type: undefined };
  const pills = [
    filters.query ? ["query", `Search: ${filters.query}`] : null,
    filters.level ? ["level", levelLabels[filters.level] ?? filters.level] : null,
    filters.location ? ["location", `Location: ${filters.location}`] : null,
    filters.process ? ["process", `Process: ${filters.process}`] : null,
    filters.topic ? ["topic", `Topic: ${filters.topic}`] : null,
    filters.provider ? ["provider", `Provider: ${filters.provider}`] : null,
  ].filter(Boolean) as Array<[keyof AcademyFilters, string]>;

  if (!pills.length && localType === "all") return null;

  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {localType !== "all" ? (
        <button
          className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-weldoo-indigo/20 bg-weldoo-indigo/[0.08] px-3 text-xs font-semibold text-weldoo-indigo"
          onClick={() => setLocalType("all")}
          type="button"
        >
          {typeLabels[localType] ?? localType}
          <span className="text-sm leading-none opacity-70">x</span>
        </button>
      ) : null}
      {pills.map(([key, label]) => (
        <Link
          className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-weldoo-indigo/20 bg-weldoo-indigo/[0.08] px-3 text-xs font-semibold text-weldoo-indigo"
          href={clearFilterHref(serverFilters, key)}
          key={key}
        >
          {label}
          <span className="text-sm leading-none opacity-70">x</span>
        </Link>
      ))}
      <Link
        className="inline-flex h-[26px] items-center rounded-full px-2 text-xs font-semibold text-weldoo-muted hover:text-weldoo-indigo"
        href="/academy"
        onClick={() => setLocalType("all")}
      >
        Clear all
      </Link>
    </div>
  );
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
          href={`/academy/${item.id}`}
        >
          <PlayIcon />
          View course
        </Link>
      </div>
    </article>
  );
}

export function AcademyListing({ filters, items }: AcademyListingProps) {
  const [localType, setLocalType] = useState<AcademyLocalType>(filters.type ?? "all");
  const visibleItems = useMemo(
    () => (localType === "all" ? items : items.filter((item) => item.type === localType)),
    [items, localType],
  );
  const serverFilters = { ...filters, type: undefined };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[18px] font-extrabold tracking-[-0.3px] text-weldoo-ink">
          <span>{visibleItems.length}</span> courses available
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <FilterButton active={localType === "all"} onClick={() => setLocalType("all")}>
            All
          </FilterButton>
          <FilterButton
            active={localType === "online_course"}
            onClick={() => setLocalType(localType === "online_course" ? "all" : "online_course")}
          >
            <AcademyTypeIcon type="online_course" />
            Online training
          </FilterButton>
          <FilterButton
            active={localType === "webinar"}
            onClick={() => setLocalType(localType === "webinar" ? "all" : "webinar")}
          >
            <AcademyTypeIcon type="webinar" />
            Webinar
          </FilterButton>
          <FilterButton
            active={localType === "in_person_course"}
            onClick={() =>
              setLocalType(localType === "in_person_course" ? "all" : "in_person_course")
            }
          >
            <AcademyTypeIcon type="in_person" />
            In person
          </FilterButton>
        </div>
      </div>

      <ActiveFilterPills
        filters={serverFilters}
        localType={localType}
        setLocalType={setLocalType}
      />

      {visibleItems.length ? (
        <section className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <AcademyCard item={item} key={item.id} />
          ))}
        </section>
      ) : (
        <section className="rounded-[16px] border border-weldoo-border-light bg-white p-6 shadow-weldoo-sm">
          <EmptyState
            description={
              hasActiveAcademyFilters(serverFilters)
                ? "Try clearing filters or searching for a broader welding process, provider, or topic."
                : "Try switching to another tab or checking back when training providers publish more academy items."
            }
            title="No academy items found"
          />
        </section>
      )}
    </div>
  );
}
