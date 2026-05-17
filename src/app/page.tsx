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

  return (
    <AppShell auth={appShellAuth}>
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--weldoo-indigo)]">
                Feed
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-normal text-[var(--weldoo-ink)]">
                Weldoo professional feed
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--weldoo-muted)]">
                Latest welding-sector updates from professionals, companies, and training providers.
              </p>
            </div>

            {user ? (
              <PostComposer />
            ) : (
              <section className="rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white p-5 shadow-weldoo-sm">
                <h2 className="text-base font-bold text-[var(--weldoo-ink)]">Join the feed</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--weldoo-muted)]">
                  Sign in to publish welding updates, shop notes, training content, and opportunities.
                </p>
                <Link
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-[var(--weldoo-radius-sm)] bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] px-4 text-sm font-semibold text-white shadow-weldoo-md transition hover:brightness-105"
                  href="/auth/sign-in"
                >
                  Sign in
                </Link>
              </section>
            )}

            {feed.items.length > 0 ? (
              <div className="space-y-4">
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

          <aside className="space-y-4">
            <section className="rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white p-5 shadow-weldoo-sm">
              <h2 className="text-base font-bold text-[var(--weldoo-ink)]">Feed status</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-[var(--weldoo-ink)]">Data source</dt>
                  <dd className="mt-1 text-[var(--weldoo-muted)]">Supabase posts table</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--weldoo-ink)]">Ordering</dt>
                  <dd className="mt-1 text-[var(--weldoo-muted)]">Newest published posts first</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--weldoo-ink)]">Next task</dt>
                  <dd className="mt-1 text-[var(--weldoo-muted)]">
                    Create, edit, and delete posts
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
