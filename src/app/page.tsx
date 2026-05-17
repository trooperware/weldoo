import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { FeedPostCard } from "@/components/feed/feed-post-card";
import { PostComposer } from "@/components/feed/post-composer";
import { EmptyState } from "@/components/ui";
import { getAppShellAuth, getCurrentUser } from "@/lib/auth/session";
import { FEED_PAGE_SIZE, getFeedPage } from "@/lib/feed/queries";

type HomePageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

function parsePage(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export default async function Home({ searchParams }: HomePageProps) {
  const [{ page: requestedPage }, appShellAuth, user] = await Promise.all([
    searchParams,
    getAppShellAuth(),
    getCurrentUser(),
  ]);
  const page = parsePage(requestedPage);
  const feed = await getFeedPage(page, user?.id);
  const displayEmail = appShellAuth?.email ?? "Weldoo member";
  const initial = displayEmail.slice(0, 1).toUpperCase();

  return (
    <AppShell auth={appShellAuth}>
      <main className="px-4 py-6 sm:px-6 lg:px-0">
        <section className="mx-auto grid max-w-[1160px] justify-center gap-5 lg:grid-cols-[240px_minmax(0,560px)_300px]">
          <aside className="hidden space-y-3 lg:block">
            <section className="overflow-hidden rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm">
              <div className="h-16 bg-[linear-gradient(135deg,#2a2a8a_0%,#3d3db4_35%,#42b8d4_70%,#5ce8b4_100%)]" />
              <div className="px-4 pb-4">
                <div className="-mt-6 mb-3 flex h-12 w-12 items-center justify-center rounded-weldoo-md bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-sm font-bold text-white shadow-weldoo-sm">
                  {initial}
                </div>
                <h2 className="truncate text-[15px] font-bold text-weldoo-ink">
                  Demo User
                </h2>
                <p className="mt-1 text-sm leading-5 text-weldoo-slate">
                  Product Designer · Weldoo Community
                </p>
                <div className="mt-3 space-y-2 border-t border-weldoo-border-light pt-3 text-sm text-weldoo-slate">
                  <div className="flex items-center gap-2">
                    <svg aria-hidden="true" className="h-4 w-4 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                      <path d="M12 21S5 14.5 5 9.5C5 5.6 8.1 3 12 3S19 5.6 19 9.5C19 14.5 12 21 12 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                      <path d="M12 12A2.5 2.5 0 1 0 12 7A2.5 2.5 0 0 0 12 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                    </svg>
                    <span>Barcelona, Spain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg aria-hidden="true" className="h-4 w-4 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                      <path d="M9 7V5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V7M5 7H19V20H5V7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                    </svg>
                    <span>Weldoo</span>
                  </div>
                </div>
                <Link
                  className="mt-4 flex h-10 w-full items-center justify-center rounded-full border border-weldoo-border bg-white text-sm font-bold text-weldoo-slate transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
                  href="/profile/edit"
                >
                  Edit profile
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

          <div className="space-y-5">
            {user ? (
              <PostComposer />
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

            {feed.items.length > 0 ? (
              <div className="space-y-5">
                {feed.items.map((item) => (
                  <FeedPostCard item={item} key={item.post.id} />
                ))}
              </div>
            ) : (
              <EmptyState
                description="Posts will appear here once members start publishing. Post creation is the next feed task."
                title="No posts yet"
              />
            )}

            <nav className="flex items-center justify-between gap-3" aria-label="Feed pagination">
              {page > 1 ? (
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border)] bg-white px-4 text-sm font-semibold text-[var(--weldoo-slate)] shadow-weldoo-sm transition hover:border-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo)]"
                  href={page === 2 ? "/" : `/?page=${page - 1}`}
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-xs font-semibold text-[var(--weldoo-muted)]">
                Page {feed.page} · {FEED_PAGE_SIZE} posts per page
              </span>
              {feed.hasNextPage ? (
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border)] bg-white px-4 text-sm font-semibold text-[var(--weldoo-slate)] shadow-weldoo-sm transition hover:border-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo)]"
                  href={`/?page=${page + 1}`}
                >
                  Next
                </Link>
              ) : (
                <span />
              )}
            </nav>
          </div>

          <aside className="hidden space-y-3 lg:block">
            <section className="rounded-weldoo-md border border-weldoo-border-light bg-white p-5 shadow-weldoo-sm">
              <div className="flex h-52 items-center justify-center rounded-weldoo-sm border border-dashed border-weldoo-border-light bg-weldoo-bg">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-weldoo-muted">
                  Right sidebar
                </span>
              </div>
            </section>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
