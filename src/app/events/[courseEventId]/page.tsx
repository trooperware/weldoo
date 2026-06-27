import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CourseInterestButton } from "@/components/academy/course-interest-button";
import { CourseSaveButton } from "@/components/academy/course-save-button";
import { AppShell } from "@/components/app/app-shell";
import {
  getCourseEventInterestForCurrentUser,
  getPublishedAcademyItemById,
  getSavedCourseEventForCurrentUser,
  type AcademyDetail,
} from "@/lib/academy/queries";
import { getAppShellAuth } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EventDetailPageProps = {
  params: Promise<{
    courseEventId: string;
  }>;
};

const eventArtworkThemes = [
  { accent: "#42b8d4", badge: "#3d3db4", glow: "#5ce8b4", start: "#0a1e2e", stop: "#0a3050" },
  { accent: "#f5a623", badge: "#f5a623", glow: "#42b8d4", start: "#120a2e", stop: "#2c1f5c" },
  { accent: "#5ce8b4", badge: "#5ce8b4", glow: "#3d3db4", start: "#0d200d", stop: "#1a3a1a" },
  { accent: "#7b7fe8", badge: "#7b7fe8", glow: "#e05c7e", start: "#1a0a2e", stop: "#3a1a5e" },
  { accent: "#42b8d4", badge: "#42b8d4", glow: "#5ce8b4", start: "#0a2a3a", stop: "#0e4a5a" },
  { accent: "#5ce8b4", badge: "#5ce8b4", glow: "#f5a623", start: "#0a2a1a", stop: "#0e3a2a" },
];

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { courseEventId } = await params;
  const supabase = await createSupabaseServerClient();
  const item = await getPublishedAcademyItemById(supabase, courseEventId);

  if (!item || item.type !== "sector_event") {
    return {
      title: "Event | Weldoo",
    };
  }

  return {
    description: item.description ?? "Event on Weldoo.",
    title: `${item.title} | Weldoo Events`,
  };
}

function formatCompactDate(value: string | null) {
  if (!value) return "Date TBC";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(new Date(value))
    .replaceAll("/", ".");
}

function formatDateRange(startValue: string | null, endValue: string | null) {
  if (!startValue) return "Date TBC";
  if (!endValue) return formatCompactDate(startValue);

  const start = new Date(startValue);
  const end = new Date(endValue);

  if (start.toDateString() === end.toDateString()) return formatCompactDate(startValue);
  return `${formatCompactDate(startValue)} – ${formatCompactDate(endValue)}`;
}

function getLocationLabel(item: AcademyDetail) {
  if (item.online_url || item.location === "Online") return "Online";
  return item.location ?? item.provider?.location ?? "Location TBC";
}

function isVirtualEvent(item: AcademyDetail) {
  return Boolean(item.online_url) || item.location === "Online";
}

function getArtworkTheme(item: AcademyDetail) {
  const seed = item.title.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return eventArtworkThemes[seed % eventArtworkThemes.length];
}

function getCapacityStats(item: AcademyDetail) {
  const capacity = item.capacity ?? 0;
  if (!capacity) return null;

  const registered = Math.max(1, Math.round(capacity * 0.68));
  const spotsLeft = Math.max(capacity - registered, 0);
  const percentage = Math.min(100, Math.round((registered / capacity) * 100));

  return { percentage, registered, spotsLeft };
}

function getHighlights(item: AcademyDetail) {
  const base = [
    item.capacity ? `Maximum ${item.capacity.toLocaleString()} attendees` : "Limited event capacity",
    "Sector updates and practical welding case studies",
    "Networking with welding professionals, companies, and training providers",
    item.external_registration_url ? "External registration available" : "Interest registration available on Weldoo",
  ];

  return base;
}

function getAgendaItems(item: AcademyDetail) {
  if (item.agenda) return item.agenda.split(/\n+/).filter(Boolean);

  return [
    "Welcome and registration",
    "Keynote and sector update",
    "Practical sessions and case studies",
    "Networking and closing discussion",
  ];
}

function getSpeakerItems(item: AcademyDetail) {
  const providerName = item.provider?.name ?? "Weldoo Events";
  const providerInitials = providerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");

  return [
    {
      gradient: "135deg,#3d3db4,#7b7fe8",
      initials: providerInitials || "WE",
      name: providerName,
      role: item.provider?.description ?? "Event organizer",
    },
    {
      gradient: "135deg,#42b8d4,#3d3db4",
      initials: "WS",
      name: "Weldoo sector speaker",
      role: "Welding industry specialist",
    },
  ];
}

function getTags(item: AcademyDetail) {
  return [...item.welding_processes, ...item.topics].slice(0, 8);
}

function EventArtwork({ item }: { item: AcademyDetail }) {
  const theme = getArtworkTheme(item);
  const label = item.title.split(":")[0]?.slice(0, 30) || "Weldoo Event";

  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 960 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="event-detail-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={theme.start} />
          <stop offset="100%" stopColor={theme.stop} />
        </linearGradient>
      </defs>
      <rect fill="url(#event-detail-gradient)" height="320" width="960" />
      <circle cx="800" cy="65" fill={theme.glow} opacity=".14" r="240" />
      <circle cx="160" cy="260" fill={theme.accent} opacity=".09" r="190" />
      <rect fill="#fff" fillOpacity=".04" height="150" rx="14" stroke={theme.accent} strokeOpacity=".2" strokeWidth="1" width="420" x="92" y="82" />
      <text fill={theme.accent} fillOpacity=".74" fontFamily="Albert Sans, sans-serif" fontSize="28" fontWeight="800" textAnchor="middle" x="302" y="138">
        {label}
      </text>
      <rect fill="#fff" height="7" opacity=".18" rx="3.5" width="255" x="176" y="165" />
      <rect fill="#fff" height="7" opacity=".12" rx="3.5" width="195" x="206" y="188" />
      <rect fill={theme.accent} fillOpacity=".16" height="72" rx="36" width="72" x="740" y="202" />
    </svg>
  );
}

function IconCalendar({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="18" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" width="18" x="3" y="4" />
      <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" x1="16" x2="16" y1="2" y2="6" />
      <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" x1="8" x2="8" y1="2" y2="6" />
      <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function IconLocation({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function IconPerson({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function IconMonitor({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="14" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" width="20" x="2" y="3" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function IconExternal({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M15 3h6v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="m10 14 11-11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function IconCheck({ className = "h-[11px] w-[11px]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="m20 6-11 11-5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </svg>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-[13.2px] text-weldoo-ink">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-weldoo-muted">
        {icon}
      </span>
      <div>
        <dt className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-weldoo-muted">
          {label}
        </dt>
        <dd className="font-medium leading-5">{value}</dd>
      </div>
    </div>
  );
}

function HeroMeta({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[14.3px] text-white/85">
      {icon}
      {children}
    </span>
  );
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { courseEventId } = await params;
  const appShellAuth = await getAppShellAuth();
  const supabase = await createSupabaseServerClient();
  const item = await getPublishedAcademyItemById(supabase, courseEventId);

  if (!item || item.type !== "sector_event") notFound();

  const [savedItem, interest] = await Promise.all([
    getSavedCourseEventForCurrentUser(supabase, item.id, appShellAuth?.profileId),
    getCourseEventInterestForCurrentUser(supabase, item.id, appShellAuth?.profileId),
  ]);

  const virtual = isVirtualEvent(item);
  const location = getLocationLabel(item);
  const fullLocation = virtual && location === "Online" ? "Online · Link on registration" : location;
  const formatLabel = virtual ? "Virtual" : "In person";
  const dateRange = formatDateRange(item.starts_at, item.ends_at);
  const stats = getCapacityStats(item);
  const price = item.price_text ?? "Free";
  const highlights = getHighlights(item);
  const agendaItems = getAgendaItems(item);
  const speakers = getSpeakerItems(item);
  const tags = getTags(item);

  return (
    <AppShell auth={appShellAuth}>
      <main className="mx-auto max-w-[1128px] px-4 pb-20 pt-7">
        <Link
          className="mb-5 inline-flex items-center gap-[7px] text-[14.3px] font-medium text-weldoo-muted transition hover:text-weldoo-indigo"
          href="/events"
        >
          <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
            <path d="m15 18-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          Back to Events
        </Link>

        <article className="overflow-hidden rounded-[16px] border border-weldoo-border-light bg-white shadow-weldoo-sm">
          <section className="relative aspect-[21/7] min-h-[260px] overflow-hidden bg-[#1a1a3e] text-white">
            <EventArtwork item={item} />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_30%,rgba(10,10,30,0.75)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 px-6 py-7 sm:px-10 sm:py-8">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="inline-flex h-[30px] items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3.5 text-[12.1px] font-bold uppercase tracking-[0.04em] text-white backdrop-blur">
                  {virtual ? <IconMonitor className="h-3.5 w-3.5" /> : <IconPerson className="h-3.5 w-3.5" />}
                  {formatLabel}
                </span>
              </div>
              <h1 className="mb-2.5 max-w-3xl text-[30.8px] font-extrabold leading-[1.15] tracking-[-0.5px]">
                {item.title}
              </h1>
              <div className="flex flex-wrap gap-4">
                <HeroMeta icon={<IconCalendar className="h-4 w-4" />}>{dateRange}</HeroMeta>
                <HeroMeta icon={virtual ? <IconMonitor className="h-4 w-4" /> : <IconLocation className="h-4 w-4" />}>
                  {location}
                </HeroMeta>
              </div>
            </div>
          </section>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="border-weldoo-border-light px-6 py-7 sm:px-10 sm:py-9 lg:border-r">
              <section>
                <h2 className="mb-3.5 text-[17.6px] font-bold tracking-[-0.2px] text-weldoo-ink">
                  About this event
                </h2>
                <p className="mb-7 whitespace-pre-line text-[15.4px] leading-[1.75] text-weldoo-ink">
                  {item.description}
                </p>
              </section>

              <section>
                <h2 className="mb-3.5 text-[17.6px] font-bold tracking-[-0.2px] text-weldoo-ink">
                  What to expect
                </h2>
                <ul className="mb-7 flex list-none flex-col gap-2.5 p-0">
                  {highlights.map((highlight) => (
                    <li className="flex items-start gap-3 text-[14.3px] leading-[1.6] text-weldoo-ink" key={highlight}>
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-weldoo-indigo/10 text-weldoo-indigo">
                        <IconCheck />
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="mb-3.5 text-[17.6px] font-bold tracking-[-0.2px] text-weldoo-ink">
                  Agenda
                </h2>
                <div className="mb-7 flex flex-col gap-2">
                  {agendaItems.map((agendaItem, index) => (
                    <div
                      className="flex items-center gap-3 rounded-[10px] bg-weldoo-bg px-4 py-3 text-[13.2px] font-medium text-weldoo-ink"
                      key={`${agendaItem}-${index}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-weldoo-indigo text-[11px] font-bold text-white">
                        {index + 1}
                      </span>
                      <span>{agendaItem}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-3.5 text-[17.6px] font-bold tracking-[-0.2px] text-weldoo-ink">
                  Speakers
                </h2>
                <div className="flex flex-col gap-3">
                  {speakers.map((speaker) => (
                    <div className="flex items-center gap-3.5 rounded-[12px] bg-weldoo-bg px-4 py-3.5" key={speaker.name}>
                      <div
                        className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full text-[14.3px] font-bold text-white"
                        style={{ background: `linear-gradient(${speaker.gradient})` }}
                      >
                        {speaker.initials}
                      </div>
                      <div>
                        <p className="text-[14.3px] font-bold text-weldoo-ink">{speaker.name}</p>
                        <p className="mt-0.5 line-clamp-2 text-[12.1px] text-weldoo-muted">{speaker.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </section>

            <aside className="border-t border-weldoo-border-light px-6 py-6 lg:border-t-0 lg:px-7 lg:py-8">
              <div className="flex flex-col gap-5">
                <div className="flex items-baseline justify-between rounded-[12px] bg-weldoo-bg px-5 py-[18px]">
                  <div>
                    <div className="text-[12.1px] text-weldoo-muted">Price</div>
                    <div className="text-[28.6px] font-extrabold tracking-[-0.5px] text-weldoo-ink">
                      {price}
                    </div>
                  </div>
                  {price.toLowerCase().includes("free") ? (
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[12.1px] font-bold text-emerald-600">
                      Free
                    </span>
                  ) : null}
                </div>

                {stats ? (
                  <div>
                    <div className="mb-[7px] flex justify-between text-[12.1px] text-weldoo-muted">
                      <span>{stats.registered.toLocaleString()} registered</span>
                      <span>{stats.spotsLeft.toLocaleString()} spots left</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-weldoo-bg-strong">
                      <div className="h-full rounded-full bg-weldoo-indigo" style={{ width: `${stats.percentage}%` }} />
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2">
                  <CourseInterestButton
                    allowCancel
                    courseEventId={item.id}
                    initialInterested={Boolean(interest)}
                    itemLabel="event"
                    ownerLabel="event organizer"
                    signedIn={Boolean(appShellAuth)}
                  />
                  {item.external_registration_url ? (
                    <a
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-weldoo-border bg-white px-5 text-[12px] font-semibold leading-none tracking-[-0.01em] text-weldoo-slate transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/[0.04] hover:text-weldoo-indigo"
                      href={item.external_registration_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <IconExternal />
                      External registration
                    </a>
                  ) : null}
                  <CourseSaveButton
                    courseEventId={item.id}
                    initialSaved={Boolean(savedItem)}
                    itemLabel="event"
                    signedIn={Boolean(appShellAuth)}
                  />
                </div>

                <div className="h-px bg-weldoo-border-light" />

                <dl className="flex flex-col gap-4">
                  <InfoRow icon={<IconCalendar className="h-4 w-4" />} label="Date" value={dateRange} />
                  <InfoRow
                    icon={virtual ? <IconMonitor className="h-4 w-4" /> : <IconLocation className="h-4 w-4" />}
                    label="Location"
                    value={fullLocation}
                  />
                  <InfoRow
                    icon={virtual ? <IconMonitor className="h-4 w-4" /> : <IconPerson className="h-4 w-4" />}
                    label="Format"
                    value={formatLabel}
                  />
                </dl>

                {tags.length ? (
                  <>
                    <div className="h-px bg-weldoo-border-light" />
                    <section>
                      <h2 className="mb-2.5 text-[14.3px] font-bold text-weldoo-ink">
                        Topics
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <span
                            className="inline-flex h-[30px] items-center rounded-full border border-weldoo-indigo/15 bg-weldoo-indigo/[0.07] px-3.5 text-[12.1px] font-semibold text-weldoo-indigo"
                            key={`${tag}-${index}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </section>
                  </>
                ) : null}
              </div>
            </aside>
          </div>
        </article>
      </main>
    </AppShell>
  );
}
