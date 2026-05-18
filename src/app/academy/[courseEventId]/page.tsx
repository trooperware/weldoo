import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { CourseInterestButton } from "@/components/academy/course-interest-button";
import { CourseSaveButton } from "@/components/academy/course-save-button";
import { getAppShellAuth } from "@/lib/auth/session";
import {
  getCourseEventInterestForCurrentUser,
  getPublishedAcademyItemById,
  getSavedCourseEventForCurrentUser,
  type AcademyDetail,
} from "@/lib/academy/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AcademyDetailPageProps = {
  params: Promise<{
    courseEventId: string;
  }>;
};

const typeLabels: Record<string, string> = {
  in_person_course: "In person",
  online_course: "Online training",
  sector_event: "Sector event",
  webinar: "Webinar",
  workshop: "Workshop",
};

const levelLabels: Record<string, string> = {
  advanced: "Advanced",
  basic: "Basic",
  intermediate: "Intermediate",
};

export async function generateMetadata({
  params,
}: AcademyDetailPageProps): Promise<Metadata> {
  const { courseEventId } = await params;
  const supabase = await createSupabaseServerClient();
  const item = await getPublishedAcademyItemById(supabase, courseEventId);

  return {
    description: item?.description ?? "Academy item on Weldoo.",
    title: item ? `${item.title} | Weldoo Academy` : "Academy item | Weldoo",
  };
}

function formatDate(value: string | null) {
  if (!value) return "Date TBC";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getLocationLabel(item: AcademyDetail) {
  if (item.type === "online_course" || item.type === "webinar" || item.online_url) {
    return "Online";
  }

  return item.location ?? item.provider?.location ?? "Location TBC";
}

function getHeroTone(type: AcademyDetail["type"]) {
  if (type === "webinar") return "from-[#1e1e4a] via-weldoo-indigo to-[#42b8d4]";
  if (type === "online_course") return "from-[#1e1e4a] to-weldoo-indigo";
  if (type === "sector_event") return "from-[#0a1e2e] to-[#0a3050]";
  return "from-[#0a2a1a] to-[#0e3a2a]";
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

function IconClock({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
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

function IconExternal({ className = "h-3.5 w-3.5" }: { className?: string }) {
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

function IconPlay({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="m5 3 14 9-14 9V3Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function IconText({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M21 6H3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M15 12H3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M17 18H3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function IconChevronRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
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

function DetailPill({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[14.3px] text-white/85">
      {icon}
      {children}
    </span>
  );
}

function AcademyTypeIcon({
  className = "h-3.5 w-3.5",
  type,
}: {
  className?: string;
  type: AcademyDetail["type"];
}) {
  if (type === "in_person_course" || type === "workshop") {
    return <IconPerson className={className} />;
  }

  if (type === "webinar" || type === "sector_event") {
    return <IconCalendar className={className} />;
  }

  return <IconPlay className={className} />;
}

function getIncludedItems(item: AcademyDetail) {
  if (item.type === "webinar") {
    return [
      "Live online session with external meeting link",
      "Practical welding-sector examples",
      "Q&A with the training provider",
      "Recording or follow-up materials when provided",
    ];
  }

  if (item.type === "sector_event") {
    return [
      item.capacity ? `Maximum ${item.capacity} attendees` : "Limited event capacity",
      "Sector updates and practical welding case studies",
      "Networking with welding professionals and companies",
      item.external_registration_url ? "External registration available" : "Interest registration available on Weldoo",
    ];
  }

  return [
    item.capacity ? `Maximum ${item.capacity} participants` : "Limited group format",
    "Training provider-led practical content",
    "Welding process and topic-focused agenda",
    item.external_registration_url ? "External registration available" : "Interest registration available on Weldoo",
    "Certificate or attendance details provided by the training provider",
  ];
}

function getContentItems(item: AcademyDetail) {
  if (item.agenda) return item.agenda.split(/\n+/).filter(Boolean);

  if (item.type === "webinar") {
    return [
      "Session introduction and objectives",
      "Technical topic walkthrough",
      "Live questions and next steps",
    ];
  }

  if (item.type === "sector_event") {
    return [
      "Welcome and registration",
      "Keynote and sector update",
      "Practical sessions and case studies",
      "Networking and closing discussion",
    ];
  }

  return [
    "Course introduction and safety briefing",
    "Technical practice and instructor guidance",
    "Wrap-up, feedback and next steps",
  ];
}

function getOnlineCourseChapters(item: AcademyDetail) {
  const topicLabel = item.topics[0] ?? item.welding_processes[0] ?? "Welding workflow";
  const duration = item.duration_text ?? "12 min";

  return [
    {
      lessons: [
        { duration, kind: "video", title: "Course overview" },
        { duration: "8 min", kind: "reading", title: "Safety and setup" },
      ],
      title: "Getting started",
    },
    {
      lessons: [
        { duration: "14 min", kind: "video", title: topicLabel },
        { duration: "10 min", kind: "reading", title: "Quality checklist" },
      ],
      title: "Core practice",
    },
  ];
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

export default async function AcademyDetailPage({ params }: AcademyDetailPageProps) {
  const { courseEventId } = await params;
  const appShellAuth = await getAppShellAuth();
  const supabase = await createSupabaseServerClient();
  const item = await getPublishedAcademyItemById(supabase, courseEventId);

  if (!item) notFound();

  const [savedItem, interest] = await Promise.all([
    getSavedCourseEventForCurrentUser(supabase, item.id, appShellAuth?.profileId),
    getCourseEventInterestForCurrentUser(supabase, item.id, appShellAuth?.profileId),
  ]);

  const providerName = item.provider?.name ?? "Weldoo academy provider";
  const location = getLocationLabel(item);
  const startTime = formatTime(item.starts_at);
  const endTime = formatTime(item.ends_at);
  const timeText = startTime && endTime ? `${startTime} - ${endTime}` : startTime;
  const isWebinar = item.type === "webinar";
  const isOnlineCourse = item.type === "online_course";
  const isSectorEvent = item.type === "sector_event";
  const isVirtualEvent = isSectorEvent && (Boolean(item.online_url) || item.location === "Online");
  const detailTypeLabel = typeLabels[item.type];
  const detailFormatLabel = isSectorEvent ? (isVirtualEvent ? "Virtual" : "In person") : detailTypeLabel;
  const eventLocationDetail =
    isVirtualEvent && location === "Online" ? "Online · Link on registration" : location;
  const registeredCount = item.capacity ? Math.max(1, Math.round(item.capacity * 0.68)) : null;
  const spotsLeft = item.capacity && registeredCount ? Math.max(item.capacity - registeredCount, 0) : null;
  const capacityPercentage = item.capacity && registeredCount ? Math.min(100, Math.round((registeredCount / item.capacity) * 100)) : 0;
  const includedItems = getIncludedItems(item);
  const contentItems = getContentItems(item);
  const allTags = [...item.welding_processes, ...item.topics];
  const onlineChapters = getOnlineCourseChapters(item);
  const onlineLessonCount = onlineChapters.reduce((total, chapter) => total + chapter.lessons.length, 0);

  if (isOnlineCourse) {
    return (
      <AppShell auth={appShellAuth}>
        <main className="mx-auto max-w-[1128px] px-4 pb-20 pt-7">
          <Link
            className="mb-5 inline-flex items-center gap-[7px] text-[14.3px] font-medium text-weldoo-muted transition hover:text-weldoo-indigo"
            href="/academy"
          >
            <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            Back to Academy
          </Link>

          <article className="grid min-h-[calc(100vh-200px)] overflow-hidden rounded-[16px] border border-weldoo-border-light bg-white shadow-weldoo-sm lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="flex flex-col overflow-hidden border-b border-weldoo-border-light lg:sticky lg:top-7 lg:max-h-[calc(100vh-96px)] lg:border-b-0 lg:border-r">
              <div className="border-b border-weldoo-border-light bg-white px-5 pb-4 pt-8">
                <h1 className="mb-3 text-[24px] font-extrabold leading-[1.25] tracking-[-0.3px] text-weldoo-ink">
                  {item.title}
                </h1>
                <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-weldoo-bg-strong">
                  <div className="h-full w-0 rounded-full bg-weldoo-indigo" />
                </div>
                <p className="text-[11.5px] font-medium text-weldoo-muted">
                  0/{onlineLessonCount} lessons completed · 0%
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {onlineChapters.map((chapter, chapterIndex) => (
                  <section className="border-b border-weldoo-border-light" key={chapter.title}>
                    <div className="flex items-center gap-2.5 px-5 py-3.5">
                      <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-weldoo-bg-strong text-[11px] font-bold text-weldoo-muted">
                        {chapterIndex + 1}
                      </span>
                      <h2 className="flex-1 text-[13px] font-semibold text-weldoo-ink">
                        {chapter.title}
                      </h2>
                      <svg aria-hidden="true" className="h-4 w-4 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                    </div>
                    <div className="pb-2">
                      {chapter.lessons.map((lesson, lessonIndex) => {
                        const active = chapterIndex === 0 && lessonIndex === 0;
                        return (
                          <div
                            className={`relative flex items-center gap-2.5 py-2.5 pl-[52px] pr-5 transition ${
                              active ? "bg-weldoo-indigo/[0.06]" : ""
                            }`}
                            key={lesson.title}
                          >
                            {active ? <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-sm bg-weldoo-indigo" /> : null}
                            <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-weldoo-border bg-white text-weldoo-muted">
                              {lesson.kind === "video" ? <IconPlay className="h-[9px] w-[9px]" /> : <IconText className="h-[9px] w-[9px]" />}
                            </span>
                            <span className="min-w-0">
                              <span
                                className={`block truncate text-[12.5px] leading-[1.35] ${
                                  active ? "font-semibold text-weldoo-indigo" : "font-medium text-weldoo-ink"
                                }`}
                              >
                                {lesson.title}
                              </span>
                              <span className="mt-px block text-[11px] text-weldoo-muted">
                                {lesson.kind === "video" ? "Video" : "Reading"} · {lesson.duration}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </aside>

            <section className="max-w-[780px] overflow-y-auto px-5 py-6 sm:px-10 sm:py-8">
              <div className="mb-6">
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.07em] text-weldoo-indigo">
                  1. Getting started
                </p>
                <h2 className="mb-2 text-[26px] font-extrabold leading-[1.2] tracking-[-0.4px] text-weldoo-ink">
                  Course overview
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-[13px] text-weldoo-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <IconPlay className="h-3.5 w-3.5" />
                    Video
                  </span>
                  <span>· {item.duration_text ?? "12 min"}</span>
                  <span>· {levelLabels[item.level ?? "intermediate"]}</span>
                </div>
              </div>

              <div className="relative mb-6 aspect-video overflow-hidden rounded-[12px] bg-[#050509] shadow-[0_18px_42px_rgba(10,10,30,0.22)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(61,61,180,0.28),transparent_34%),linear-gradient(135deg,#070713,#121238)]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/12 text-white shadow-[0_8px_26px_rgba(0,0,0,0.28)]">
                    <IconPlay className="h-6 w-6" />
                  </span>
                  <span className="text-[13px] font-semibold text-white/78">Course video placeholder</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-3.5 text-[22px] font-extrabold tracking-[-0.3px] text-weldoo-ink">
                  About this course
                </h3>
                <p className="mb-3.5 whitespace-pre-line text-[15px] leading-[1.75] text-weldoo-ink">
                  {item.description}
                </p>
                <p className="text-[15px] leading-[1.75] text-weldoo-ink">
                  Follow the lessons from the sidebar, review the practical checklist, and save the course if you want to return to it later.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="mb-3.5 text-[22px] font-extrabold tracking-[-0.3px] text-weldoo-ink">
                  What you will cover
                </h3>
                <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-[1.7] text-weldoo-ink">
                  {contentItems.map((contentItem, index) => (
                    <li key={`${contentItem}-${index}`}>{contentItem}</li>
                  ))}
                </ul>
              </div>

              {allTags.length ? (
                <div className="mb-6 flex flex-wrap gap-2">
                  {allTags.map((tag, index) => (
                    <span
                      className="inline-flex h-[30px] items-center rounded-full border border-weldoo-indigo/15 bg-weldoo-indigo/[0.07] px-3.5 text-[12.1px] font-semibold text-weldoo-indigo"
                      key={`${tag}-${index}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 border-t border-weldoo-border-light py-5 sm:flex-row sm:items-center sm:justify-between">
                <button className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#3d3db4,#5555e8)] px-6 text-[13.5px] font-semibold tracking-[-0.01em] text-white shadow-[0_2px_8px_rgba(61,61,180,0.25)]" type="button">
                  Mark as complete
                </button>
                <button className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full border-[1.5px] border-weldoo-indigo px-[22px] text-[13.5px] font-semibold text-weldoo-indigo transition hover:bg-weldoo-indigo/[0.05]" type="button">
                  Next lesson
                  <IconChevronRight />
                </button>
              </div>

              <div className="flex flex-col gap-2 border-t border-weldoo-border-light pt-5 sm:max-w-[260px]">
                <CourseInterestButton
                  courseEventId={item.id}
                  initialInterested={Boolean(interest)}
                  signedIn={Boolean(appShellAuth)}
                />
                <CourseSaveButton
                  courseEventId={item.id}
                  initialSaved={Boolean(savedItem)}
                  itemLabel="course"
                  signedIn={Boolean(appShellAuth)}
                />
              </div>
            </section>
          </article>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell auth={appShellAuth}>
      <main className="mx-auto max-w-[1128px] px-4 pb-20 pt-7">
        <Link
          className="mb-5 inline-flex items-center gap-[7px] text-[14.3px] font-medium text-weldoo-muted transition hover:text-weldoo-indigo"
          href={isSectorEvent ? "/events" : "/academy"}
        >
          <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
            <path d="m15 18-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          {isSectorEvent ? "Back to Events" : "Back to Academy"}
        </Link>

        <article className="overflow-hidden rounded-[16px] border border-weldoo-border-light bg-white shadow-weldoo-sm">
          {isWebinar ? (
            <section className={`relative overflow-hidden bg-gradient-to-br ${getHeroTone(item.type)} px-6 py-10 text-white sm:px-[52px] sm:py-12`}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_20%,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
              <div className="relative z-10">
                <span className="mb-4 inline-flex h-[30px] items-center gap-1.5 rounded-full bg-white/15 px-3.5 text-[12.1px] font-bold uppercase tracking-[0.04em]">
                  <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <path d="m23 7-7 5 7 5V7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    <rect height="14" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="15" x="1" y="5" />
                  </svg>
                  Webinar
                </span>
                <h1 className="mb-3 max-w-3xl text-[28.6px] font-extrabold leading-[1.2] tracking-[-0.5px]">
                  {item.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-[14.3px] text-white/80">
                  <DetailPill icon={<IconCalendar className="h-4 w-4" />}>{formatDate(item.starts_at)}</DetailPill>
                  {timeText ? <DetailPill icon={<IconClock />}>{timeText}</DetailPill> : null}
                  {item.duration_text ? <DetailPill icon={<IconClock />}>{item.duration_text}</DetailPill> : null}
                </div>
              </div>
            </section>
          ) : (
            <section className={`relative aspect-[21/7] min-h-[260px] overflow-hidden bg-gradient-to-br ${getHeroTone(item.type)} text-white`}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_20%,rgba(255,255,255,0.10)_0%,transparent_60%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_30%,rgba(10,10,30,0.75)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 px-6 py-7 sm:px-10 sm:py-8">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="inline-flex h-[30px] items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3.5 text-[12.1px] font-bold uppercase tracking-[0.04em] backdrop-blur">
                    {isVirtualEvent ? <IconMonitor className="h-3.5 w-3.5" /> : <AcademyTypeIcon className="h-3.5 w-3.5" type={item.type} />}
                    {detailFormatLabel}
                  </span>
                </div>
                <h1 className="mb-2.5 max-w-3xl text-[30.8px] font-extrabold leading-[1.15] tracking-[-0.5px]">
                  {item.title}
                </h1>
                <div className="flex flex-wrap gap-4">
                  <DetailPill icon={<IconCalendar className="h-4 w-4" />}>{formatDate(item.starts_at)}</DetailPill>
                  {timeText ? <DetailPill icon={<IconClock />}>{timeText}</DetailPill> : null}
                  <DetailPill icon={isVirtualEvent ? <IconMonitor /> : <IconLocation />}>
                    {isVirtualEvent ? "Online" : location}
                  </DetailPill>
                  {item.level && !isSectorEvent ? (
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.04em]">
                      {levelLabels[item.level]}
                    </span>
                  ) : null}
                </div>
              </div>
            </section>
          )}

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="border-weldoo-border-light px-6 py-7 sm:px-10 sm:py-9 lg:border-r">
              <div>
                <section>
                  <h2 className="mb-3.5 text-[17.6px] font-bold tracking-[-0.2px] text-weldoo-ink">
                    About this {isSectorEvent ? "event" : isWebinar ? "webinar" : "course"}
                  </h2>
                  <p className="mb-7 whitespace-pre-line text-[15.4px] leading-[1.75] text-weldoo-ink">
                    {item.description}
                  </p>
                </section>

                {!isWebinar ? (
                  <>
                    <section>
                      <h2 className="mb-3.5 text-[17.6px] font-bold tracking-[-0.2px] text-weldoo-ink">
                        {isSectorEvent ? "What to expect" : "What is included"}
                      </h2>
                      <ul className="mb-7 flex list-none flex-col gap-2.5 p-0">
                        {includedItems.map((included) => (
                          <li
                            className="flex items-start gap-3 text-[14.3px] leading-[1.6] text-weldoo-ink"
                            key={included}
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-weldoo-indigo/10 text-weldoo-indigo">
                              <IconCheck />
                            </span>
                            {included}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <h2 className="mb-3.5 text-[17.6px] font-bold tracking-[-0.2px] text-weldoo-ink">
                        {isSectorEvent ? "Agenda" : "Content"}
                      </h2>
                      <div className="mb-7 flex flex-col gap-2">
                        {contentItems.map((agendaItem, index) => (
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
                  </>
                ) : null}

                <section>
                  <h2 className="mb-3.5 text-[17.6px] font-bold tracking-[-0.2px] text-weldoo-ink">
                    {isSectorEvent ? "Speakers" : "Instructors"}
                  </h2>
                  <div className="flex items-center gap-3.5 rounded-[12px] bg-weldoo-bg px-4 py-3.5">
                    <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#42b8d4,#3d3db4)] text-[14.3px] font-bold text-white">
                      {item.provider?.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="" className="h-full w-full object-contain" src={item.provider.logo_url} />
                      ) : (
                        providerName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-[14.3px] font-bold text-weldoo-ink">{providerName}</p>
                      <p className="mt-0.5 text-[12.1px] text-weldoo-muted">
                        {item.provider?.description ?? "Training provider"}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </section>

            <aside className="border-t border-weldoo-border-light px-6 py-6 lg:border-t-0 lg:px-7 lg:py-8">
              <div className="flex flex-col gap-5">
                {isWebinar ? (
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-weldoo-indigo/[0.08] px-4 py-2 text-[13.2px] font-bold text-weldoo-indigo">
                    <IconCalendar className="h-4 w-4" />
                    Upcoming
                  </div>
                ) : (
                  <div className="flex items-baseline justify-between rounded-[12px] bg-weldoo-bg px-5 py-[18px]">
                    <div>
                      <div className="text-[12.1px] text-weldoo-muted">Price</div>
                      <div className="text-[28.6px] font-extrabold tracking-[-0.5px] text-weldoo-ink">
                        {item.price_text ?? "Free"}
                      </div>
                    </div>
                    {(item.price_text ?? "Free").toLowerCase().includes("free") ? (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[12.1px] font-bold text-emerald-600">
                        Free
                      </span>
                    ) : null}
                  </div>
                )}

                {isWebinar ? (
                  <div className="rounded-[12px] bg-weldoo-bg p-4 text-center">
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-weldoo-muted">
                      Starts
                    </div>
                    <div className="text-[28.6px] font-extrabold tracking-[-0.5px] text-weldoo-ink">
                      {formatDate(item.starts_at)}
                    </div>
                  </div>
                ) : null}

                {isWebinar ? (
                  <div className="flex items-center gap-2 text-[13.2px] text-weldoo-muted">
                    <div className="flex">
                      {["W", "JR", "AL", "SR"].map((initials, index) => (
                        <span
                          className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(135deg,#3d3db4,#7b7fe8)] text-[10px] font-bold text-white first:ml-0"
                          key={initials}
                          style={{ opacity: 1 - index * 0.04 }}
                        >
                          {initials}
                        </span>
                      ))}
                    </div>
                    <span>{item.capacity ? `${item.capacity} registered` : "Registration open"}</span>
                  </div>
                ) : item.capacity ? (
                  <div>
                    <div className="mb-[7px] flex justify-between text-[12.1px] text-weldoo-muted">
                      <span>{registeredCount} registered</span>
                      <span>{spotsLeft} spots left</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-weldoo-bg-strong">
                      <div className="h-full rounded-full bg-weldoo-indigo" style={{ width: `${capacityPercentage}%` }} />
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2">
                  {isSectorEvent && item.external_registration_url ? (
                    <a
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[linear-gradient(135deg,#3d3db4,#5555e8)] px-5 text-[15.4px] font-bold tracking-[-0.01em] text-white shadow-[0_2px_8px_rgba(61,61,180,0.25)] transition hover:brightness-105 hover:shadow-[0_4px_16px_rgba(61,61,180,0.32)]"
                      href={item.external_registration_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <IconExternal className="h-[17px] w-[17px]" />
                      Register now
                    </a>
                  ) : (
                    <CourseInterestButton
                      courseEventId={item.id}
                      initialInterested={Boolean(interest)}
                      signedIn={Boolean(appShellAuth)}
                    />
                  )}
                  <CourseSaveButton
                    courseEventId={item.id}
                    initialSaved={Boolean(savedItem)}
                    itemLabel={isSectorEvent ? "event" : "course"}
                    signedIn={Boolean(appShellAuth)}
                  />
                  {item.external_registration_url && !isSectorEvent ? (
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
                  {item.recording_url ? (
                    <a
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-weldoo-border bg-white px-5 text-[12px] font-semibold leading-none tracking-[-0.01em] text-weldoo-slate transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/[0.04] hover:text-weldoo-indigo"
                      href={item.recording_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <IconExternal />
                      Recording
                    </a>
                  ) : null}
                </div>

                <div className="h-px bg-weldoo-border-light" />

                <dl className="flex flex-col gap-4">
                  <InfoRow icon={<IconCalendar className="h-4 w-4" />} label="Date" value={formatDate(item.starts_at)} />
                  {timeText ? <InfoRow icon={<IconClock className="h-4 w-4" />} label="Time" value={timeText} /> : null}
                  {item.duration_text ? <InfoRow icon={<IconClock className="h-4 w-4" />} label="Duration" value={item.duration_text} /> : null}
                  <InfoRow
                    icon={isVirtualEvent ? <IconMonitor className="h-4 w-4" /> : <IconLocation className="h-4 w-4" />}
                    label="Location"
                    value={eventLocationDetail}
                  />
                  {isSectorEvent ? (
                    <InfoRow
                      icon={isVirtualEvent ? <IconMonitor className="h-4 w-4" /> : <IconPerson className="h-4 w-4" />}
                      label="Format"
                      value={detailFormatLabel}
                    />
                  ) : item.level ? (
                    <InfoRow
                      icon={<IconPerson className="h-4 w-4" />}
                      label="Level"
                      value={
                        <span
                          className={
                            item.level === "advanced"
                              ? "font-semibold text-[#e05c7e]"
                              : item.level === "intermediate"
                                ? "font-semibold text-[#f5a623]"
                                : "font-semibold text-emerald-600"
                          }
                        >
                          {levelLabels[item.level]}
                        </span>
                      }
                    />
                  ) : null}
                </dl>

                {allTags.length ? (
                  <>
                    <div className="h-px bg-weldoo-border-light" />
                    <section>
                      <h2 className="mb-2.5 text-[14.3px] font-bold text-weldoo-ink">
                        Topics
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag, index) => (
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

              {item.type === "webinar" ? (
                <p className="mt-5 rounded-[12px] border border-weldoo-indigo/15 bg-weldoo-indigo/[0.04] px-3 py-3 text-[12px] leading-5 text-weldoo-muted">
                  Phase 1 webinars use external meeting or registration links. Integrated live video is planned for Phase 2.
                </p>
              ) : null}
            </aside>
          </div>
        </article>
      </main>
    </AppShell>
  );
}
