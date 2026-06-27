"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { FeedPostCard, type FeedPost } from "@/components/feed/feed-post-card";
import { Button, EmptyState, FormError } from "@/components/ui";

type FeedPageResponse = {
  hasNextPage: boolean;
  items: FeedPost[];
  page: number;
};

type FeedListProps = {
  initialFeed: FeedPageResponse;
  viewerAvatarUrl?: string | null;
  viewerDisplayName?: string | null;
  viewerHeadline?: string | null;
  viewerInitial: string;
};

type FeedErrorResponse = {
  message?: string;
  status?: "error";
};

function mergeUniquePosts(currentItems: FeedPost[], nextItems: FeedPost[]) {
  const seenPostIds = new Set(currentItems.map((item) => item.post.id));
  const uniqueNextItems = nextItems.filter((item) => {
    if (seenPostIds.has(item.post.id)) return false;
    seenPostIds.add(item.post.id);
    return true;
  });

  return [...currentItems, ...uniqueNextItems];
}

function FeedLoadingSpinner() {
  return (
    <div className="flex items-center justify-center gap-2 py-5 text-[13px] font-semibold text-weldoo-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-weldoo-indigo/20 border-t-weldoo-indigo" />
      Loading more posts
    </div>
  );
}

export function FeedList({
  initialFeed,
  viewerAvatarUrl,
  viewerDisplayName,
  viewerHeadline,
  viewerInitial,
}: FeedListProps) {
  const [items, setItems] = useState(initialFeed.items);
  const [page, setPage] = useState(initialFeed.page);
  const [hasNextPage, setHasNextPage] = useState(initialFeed.hasNextPage);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadNextPage = useCallback(async () => {
    if (loading || !hasNextPage) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/feed?page=${nextPage}`, {
        headers: {
          Accept: "application/json",
        },
      });
      const payload = (await response.json()) as FeedPageResponse & FeedErrorResponse;

      if (!response.ok || payload.status === "error") {
        setErrorMessage(payload.message ?? "Could not load more posts.");
        return;
      }

      setItems((currentItems) => mergeUniquePosts(currentItems, payload.items));
      setPage(payload.page);
      setHasNextPage(payload.hasNextPage);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load more posts.",
      );
    } finally {
      setLoading(false);
    }
  }, [hasNextPage, loading, page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadNextPage();
        }
      },
      {
        rootMargin: "420px 0px",
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasNextPage, loadNextPage]);

  if (items.length === 0) {
    return (
      <EmptyState
        description="Posts will appear here once members start publishing."
        title="No posts yet"
      />
    );
  }

  return (
    <section className="flex flex-col gap-5" aria-label="Feed posts">
      {items.map((item) => (
        <FeedPostCard
          item={item}
          key={item.post.id}
          viewerAvatarUrl={viewerAvatarUrl}
          viewerDisplayName={viewerDisplayName}
          viewerHeadline={viewerHeadline}
          viewerInitial={viewerInitial}
        />
      ))}

      <div ref={sentinelRef} />

      {loading ? <FeedLoadingSpinner /> : null}

      {errorMessage ? (
        <div className="rounded-weldoo-md border border-weldoo-border-light bg-white p-4 shadow-weldoo-sm">
          <FormError>{errorMessage}</FormError>
          <Button className="mt-3 h-9 rounded-full px-4 text-[12px]" onClick={loadNextPage}>
            Try again
          </Button>
        </div>
      ) : null}

      {!hasNextPage && !loading ? (
        <div className="rounded-weldoo-md border border-dashed border-weldoo-border-light bg-white px-4 py-5 text-center text-[13px] font-semibold text-weldoo-muted">
          You are all caught up.
        </div>
      ) : null}
    </section>
  );
}
