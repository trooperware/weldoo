"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Avatar, FormError } from "@/components/ui";
import type { CommentFieldErrors } from "@/lib/validators/comment";
import type { FeedComment } from "@/components/feed/feed-post-card";

type FeedCommentsProps = {
  canComment: boolean;
  comments: FeedComment[];
  postId: string;
  viewerAvatarUrl?: string | null;
  viewerInitial?: string;
};

type CommentState = {
  errors?: CommentFieldErrors;
  message?: string;
  status?: "error" | "success";
};

export function FeedComments({
  canComment,
  comments,
  postId,
  viewerAvatarUrl,
  viewerInitial = "W",
}: FeedCommentsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitPending, setSubmitPending] = useState(false);
  const [state, setState] = useState<CommentState>({});

  useEffect(() => {
    function handleToggleComments(event: Event) {
      const detail = (event as CustomEvent<{
        focus?: boolean;
        open?: boolean;
        postId?: string;
      }>).detail;

      if (detail?.postId !== postId) return;

      setOpen((currentOpen) => {
        const nextOpen = detail.open ?? !currentOpen;

        if (nextOpen && detail.focus) {
          window.requestAnimationFrame(() => {
            const commentInput = document.getElementById(`comment-${postId}`);

            commentInput?.scrollIntoView({ behavior: "smooth", block: "center" });
            commentInput?.focus();
          });
        }

        return nextOpen;
      });
    }

    window.addEventListener("weldoo:toggle-comments", handleToggleComments);

    return () => {
      window.removeEventListener("weldoo:toggle-comments", handleToggleComments);
    };
  }, [postId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitPending(true);
    setState({});

    try {
      const form = event.currentTarget;
      const response = await fetch(`/api/feed/posts/${postId}/comments`, {
        body: new FormData(form),
        method: "POST",
      });
      const payload = (await response.json()) as CommentState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      form.reset();
      setOpen(true);
      router.refresh();
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not post comment.",
        status: "error",
      });
    } finally {
      setSubmitPending(false);
    }
  }

  return (
    <section
      className={
        open
          ? "border-t border-weldoo-border-light bg-white"
          : "hidden border-t border-weldoo-border-light bg-white"
      }
    >
      <div className="px-[18px] pt-3">
        <FormError>{state.status === "error" ? state.message : null}</FormError>
      </div>

      {canComment ? (
        <form
          className="flex items-start gap-2.5 px-[18px] pb-3.5 pt-2.5"
          onSubmit={handleSubmit}
        >
          <Avatar
            className="mt-[3px] h-9 w-9 text-xs shadow-none"
            initials={viewerInitial}
            src={viewerAvatarUrl}
          />
          <div className="min-w-0 flex-1">
            <div className="group relative">
              <textarea
                aria-label="Add comment"
                aria-invalid={Boolean(state.errors?.body)}
                className="box-border min-h-[42px] max-h-[140px] w-full resize-none overflow-y-auto rounded-full border-[1.5px] border-weldoo-border-light bg-weldoo-bg px-[18px] py-2.5 pr-12 font-sans text-[13.5px] leading-[1.45] text-weldoo-ink outline-none transition placeholder:text-[#b8b8cc] focus:rounded-[14px] focus:border-weldoo-indigo focus:bg-white focus:shadow-[0_0_0_3px_rgba(61,61,180,0.09)]"
                id={`comment-${postId}`}
                maxLength={2000}
                name="body"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Add a comment…"
                rows={1}
              />
              <button
                aria-label={submitPending ? "Posting comment" : "Post comment"}
                className="absolute right-2 top-1/2 flex h-[30px] w-[30px] -translate-y-1/2 scale-[0.85] cursor-pointer items-center justify-center rounded-full border-0 bg-weldoo-indigo text-white opacity-0 transition group-focus-within:scale-100 group-focus-within:opacity-100 disabled:cursor-wait disabled:opacity-60"
                disabled={submitPending}
                type="submit"
              >
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5 stroke-white"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <line x1="22" x2="11" y1="2" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            {state.errors?.body ? (
              <p className="mt-1.5 text-xs font-medium text-red-600">{state.errors.body}</p>
            ) : null}
          </div>
        </form>
      ) : null}

      {comments.length > 0 ? (
        <div className="flex flex-col border-t border-weldoo-border-light py-1">
          {comments.map((comment) => (
            <article
              className="flex items-start gap-2.5 border-weldoo-border-light/70 px-4 py-2.5 not-first:border-t"
              key={comment.comment.id}
            >
              <Avatar
                className="h-[34px] w-[34px] text-xs shadow-none"
                initials={(comment.author?.display_name ?? "W").slice(0, 1).toUpperCase()}
                src={comment.author?.avatar_url}
              />
              <div className="min-w-0 flex-1 rounded-[4px_14px_14px_14px] border border-weldoo-border-light bg-weldoo-bg px-3.5 py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold leading-[1.3] text-weldoo-ink">
                      {comment.author?.display_name ?? "Weldoo member"}
                    </p>
                    <p className="mb-1 mt-0.5 text-[11.5px] font-normal leading-[1.3] text-weldoo-muted">
                      {comment.author?.headline ?? "Weldoo member"}
                    </p>
                  </div>
                </div>
                <p className="whitespace-pre-line text-[13.5px] leading-[1.55] text-weldoo-ink">
                  {comment.comment.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : null}

    </section>
  );
}
