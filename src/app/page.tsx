import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { FeedList } from "@/components/feed/feed-list";
import { PostComposer } from "@/components/feed/post-composer";
import { Avatar } from "@/components/ui";
import { getAppShellAuth } from "@/lib/auth/session";
import { getFeedPage } from "@/lib/feed/queries";

function getProfileTypeLabel(profileType?: string | null) {
  if (profileType === "company") return "Company";
  if (profileType === "training_provider") return "Training provider";
  if (profileType === "professional") return "Professional";
  return "Weldoo Community";
}

function getEditProfileHref(profileType?: string | null) {
  if (profileType === "company") return "/company/edit";
  if (profileType === "training_provider") return "/training-provider/edit";
  return "/profile/edit";
}

function getPublicProfileHref(profileType?: string | null, profileId?: string | null) {
  if (!profileId) return null;
  if (profileType === "professional") return `/professionals/${profileId}`;
  if (profileType === "company") return `/companies/${profileId}`;
  if (profileType === "training_provider") return `/training-providers/${profileId}`;
  return null;
}

const upcomingEvents = [
  {
    city: "Bilbao",
    day: "18",
    href: "/events",
    month: "JUL",
    title: "Welding Innovation Forum",
    type: "In person",
  },
  {
    city: "Online",
    day: "23",
    href: "/events",
    month: "JUL",
    title: "WPS Review Clinic",
    type: "Virtual",
  },
  {
    city: "Valencia",
    day: "02",
    href: "/events",
    month: "AUG",
    title: "Structural Welding Meetup",
    type: "In person",
  },
];

export default async function Home() {
  const appShellAuth = await getAppShellAuth();
  const feed = await getFeedPage(1, appShellAuth?.profileId);
  const displayEmail = appShellAuth?.email ?? "Weldoo member";
  const displayName = appShellAuth?.displayName ?? displayEmail;
  const initial = displayName.slice(0, 1).toUpperCase();
  const profileTypeLabel = getProfileTypeLabel(appShellAuth?.profileType);
  const profileSummary = appShellAuth?.headline ?? profileTypeLabel;
  const profileActionHref = appShellAuth
    ? getEditProfileHref(appShellAuth.profileType)
    : "/auth/sign-in";
  const sidebarProfiles = feed.items
    .map((item) => item.author)
    .filter((author) => Boolean(author && author.id !== appShellAuth?.profileId))
    .filter(
      (author, index, authors) =>
        authors.findIndex((candidate) => candidate?.id === author?.id) === index,
    )
    .slice(0, 4);

  return (
    <AppShell auth={appShellAuth}>
      <main>
        <section className="mx-auto grid max-w-[1128px] grid-cols-1 items-start gap-5 px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-7 md:px-5 lg:grid-cols-[225px_minmax(0,1fr)_280px] lg:gap-6 lg:pb-20">
          <aside className="hidden flex-col gap-3 lg:sticky lg:top-20 lg:flex">
            <section className="overflow-hidden rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm">
              <div className="h-16 bg-[linear-gradient(135deg,#2a2a8a_0%,#3d3db4_35%,#42b8d4_70%,#5ce8b4_100%)]" />
              <div className="px-4 pb-4">
                <Avatar
                  className="-mt-[22px] mb-2.5 h-12 w-12 rounded-weldoo-md text-base shadow-weldoo-sm [&>span]:rounded-weldoo-md"
                  initials={initial}
                  src={appShellAuth?.avatarUrl}
                />
                <h2 className="mb-0.5 truncate text-[15px] font-bold tracking-[-0.01em] text-weldoo-ink">
                  {displayName}
                </h2>
                <p className="mb-2.5 text-xs font-normal leading-[1.45] text-weldoo-slate">
                  {profileSummary}
                </p>
                <div className="flex flex-col gap-1.5 border-t border-weldoo-border-light pt-2.5 text-xs font-normal text-weldoo-slate">
                  <div className="flex items-center gap-[7px]">
                    <svg aria-hidden="true" className="h-[13px] w-[13px] shrink-0 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                      <path d="M21 10C21 17 12 23 12 23S3 17 3 10A9 9 0 0 1 21 10Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                    <span>{appShellAuth?.location ?? "Location not set"}</span>
                  </div>
                  <div className="flex items-center gap-[7px]">
                    <svg aria-hidden="true" className="h-[13px] w-[13px] shrink-0 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                      <path d="M9 7V5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V7M5 7H19V20H5V7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                    </svg>
                    <span>{profileTypeLabel}</span>
                  </div>
                </div>
                <Link
                  className="mt-3.5 flex h-9 w-full items-center justify-center rounded-full border-[1.5px] border-weldoo-border bg-white text-[13px] font-semibold tracking-[-0.01em] text-weldoo-slate transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/5 hover:text-weldoo-indigo"
                  href={profileActionHref}
                >
                  {appShellAuth ? "Edit profile" : "Sign in"}
                </Link>
              </div>
            </section>

            <section className="hidden rounded-weldoo-md border border-weldoo-border-light bg-white p-4 shadow-weldoo-sm">
              <h2 className="text-sm font-bold text-weldoo-ink">Feed filters</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {["All", "Welders", "Companies", "Training"].map((filter) => (
                  <span
                    className="rounded-full border border-weldoo-border-light bg-weldoo-bg px-3 py-1.5 text-xs font-semibold text-weldoo-slate"
                    key={filter}
                  >
                    {filter}
                  </span>
                ))}
              </div>
            </section>
          </aside>

          <div className="flex flex-col gap-5">
            {appShellAuth ? (
              <PostComposer avatarUrl={appShellAuth.avatarUrl} initial={initial} />
            ) : (
              <section className="rounded-weldoo-md border border-weldoo-border-light bg-white p-4 shadow-weldoo-sm">
                <h2 className="text-base font-bold text-weldoo-ink">Join the feed</h2>
                <p className="mt-2 text-sm leading-6 text-weldoo-muted">
                  Sign in to publish welding updates, shop notes, training content, and opportunities.
                </p>
                <Link
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-weldoo-sm bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] px-4 text-sm font-semibold text-white shadow-weldoo-md transition hover:brightness-105"
                  href="/auth/sign-in"
                >
                  Sign in
                </Link>
              </section>
            )}

            <FeedList
              initialFeed={feed}
              key={feed.items.map((item) => item.post.id).join(":")}
              viewerAvatarUrl={appShellAuth?.avatarUrl}
              viewerInitial={initial}
            />
          </div>

          <aside className="hidden flex-col gap-3 lg:sticky lg:top-20 lg:flex">
            <section className="rounded-weldoo-md border border-weldoo-border-light bg-white px-4 py-[18px] shadow-weldoo-sm">
              <h2 className="mb-3.5 text-[13.2px] font-bold leading-none text-weldoo-ink">
                People you may know
              </h2>
              <div className="flex flex-col gap-3">
                {sidebarProfiles.length > 0 ? (
                  sidebarProfiles.map((author) => {
                    const href = getPublicProfileHref(author?.profile_type, author?.id);
                    const initials = author?.display_name.slice(0, 1).toUpperCase() ?? "W";
                    const content = (
                      <>
                        <Avatar
                          className="h-9 w-9 text-[12px] shadow-[0_4px_12px_rgba(61,61,180,0.18)]"
                          initials={initials}
                          src={author?.avatar_url}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-semibold leading-[1.3] text-weldoo-ink">
                            {author?.display_name ?? "Weldoo member"}
                          </span>
                          <span className="block truncate text-[11px] leading-[1.35] text-weldoo-muted">
                            {author?.headline ?? getProfileTypeLabel(author?.profile_type)}
                          </span>
                        </span>
                      </>
                    );

                    return href ? (
                      <Link
                        className="flex items-center gap-2.5 rounded-[10px] transition hover:text-weldoo-indigo"
                        href={href}
                        key={author?.id}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2.5" key={author?.id}>
                        {content}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[12.5px] leading-5 text-weldoo-muted">
                    New member suggestions will appear as the community grows.
                  </p>
                )}
              </div>
              <Link
                className="mt-3.5 flex h-[34px] w-full items-center justify-center rounded-[8px] border-[1.5px] border-weldoo-border-light bg-white text-[12.5px] font-semibold text-weldoo-indigo transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/5"
                href="/network"
              >
                View all
              </Link>
            </section>

            <section className="rounded-weldoo-md border border-weldoo-border-light bg-white px-4 py-[18px] shadow-weldoo-sm">
              <h2 className="mb-3.5 text-[13.2px] font-bold leading-none text-weldoo-ink">
                Upcoming events
              </h2>
              <div className="flex flex-col gap-3">
                {upcomingEvents.map((event) => (
                  <Link className="flex gap-2.5 rounded-[10px] transition hover:text-weldoo-indigo" href={event.href} key={`${event.month}-${event.day}-${event.title}`}>
                    <span className="w-9 shrink-0 text-center">
                      <span className="block text-[16px] font-extrabold leading-none text-weldoo-indigo">
                        {event.day}
                      </span>
                      <span className="block text-[10px] font-semibold uppercase leading-[1.4] text-weldoo-muted">
                        {event.month}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold leading-[1.35] text-weldoo-ink">
                        {event.title}
                      </span>
                      <span className="block text-[11px] leading-[1.35] text-weldoo-muted">
                        {event.type} · {event.city}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                className="mt-3.5 flex h-[34px] w-full items-center justify-center rounded-[8px] border-[1.5px] border-weldoo-border-light bg-white text-[12.5px] font-semibold text-weldoo-indigo transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/5"
                href="/events"
              >
                View all events
              </Link>
            </section>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
