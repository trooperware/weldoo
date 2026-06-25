"use client";

import { useEffect, useState } from "react";

import { FeedCommentTrigger } from "@/components/feed/feed-comment-trigger";

type FeedPostCountsProps = {
  commentCount: number;
  initialLikeCount: number;
  postId: string;
};

type LikeCountEvent = CustomEvent<{
  likeCount: number;
  postId: string;
}>;

export function FeedPostCounts({
  commentCount,
  initialLikeCount,
  postId,
}: FeedPostCountsProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  useEffect(() => {
    function handleLikeCountChange(event: Event) {
      const detail = (event as LikeCountEvent).detail;

      if (detail?.postId !== postId) return;

      setLikeCount(Math.max(0, detail.likeCount));
    }

    window.addEventListener("weldoo:post-like-count", handleLikeCountChange);

    return () => {
      window.removeEventListener("weldoo:post-like-count", handleLikeCountChange);
    };
  }, [postId]);

  return (
    <footer className="flex items-center justify-between px-[18px] py-2 text-xs tracking-[-0.01em] text-weldoo-muted">
      <div className="flex min-h-[18px] items-center">
        {likeCount > 0 ? (
          <span className="flex items-center gap-[3px]">
            <svg
              aria-hidden="true"
              className="h-3.5 w-3.5"
              fill="#3d3db4"
              stroke="#3d3db4"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
            </svg>
            <span>{likeCount}</span>
          </span>
        ) : null}
      </div>
      <FeedCommentTrigger commentCount={commentCount} postId={postId} />
    </footer>
  );
}
