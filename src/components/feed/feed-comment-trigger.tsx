"use client";

type FeedCommentTriggerProps = {
  commentCount: number;
  postId: string;
};

export function FeedCommentTrigger({ commentCount, postId }: FeedCommentTriggerProps) {
  const label =
    commentCount === 0
      ? "Add comment"
      : `${commentCount} comment${commentCount === 1 ? "" : "s"}`;

  return (
    <button
      className="cursor-pointer border-0 bg-transparent p-0 text-xs font-semibold tracking-[-0.01em] text-weldoo-muted transition hover:text-weldoo-indigo"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent("weldoo:toggle-comments", {
            detail: {
              focus: commentCount === 0,
              postId,
            },
          }),
        );
      }}
      type="button"
    >
      {label}
    </button>
  );
}
