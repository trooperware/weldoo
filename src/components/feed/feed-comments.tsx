"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Avatar, FormError } from "@/components/ui";
import type { CommentFieldErrors } from "@/lib/validators/comment";
import type { FeedComment } from "@/components/feed/feed-post-card";

type FeedCommentsProps = {
  canComment: boolean;
  commentCount: number;
  comments: FeedComment[];
  postId: string;
  viewerAvatarUrl?: string | null;
  viewerDisplayName?: string | null;
  viewerHeadline?: string | null;
  viewerInitial?: string;
};

type CommentState = {
  comment?: FeedComment["comment"];
  comments?: FeedComment[];
  errors?: CommentFieldErrors;
  message?: string;
  status?: "error" | "success";
};

function emitCommentCountChange(postId: string, delta: number) {
  window.dispatchEvent(
    new CustomEvent("weldoo:post-comment-count", {
      detail: {
        delta,
        postId,
      },
    }),
  );
}

function MoreIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

export function FeedComments({
  canComment,
  commentCount,
  comments,
  postId,
  viewerAvatarUrl,
  viewerDisplayName,
  viewerHeadline,
  viewerInitial = "W",
}: FeedCommentsProps) {
  const [open, setOpen] = useState(false);
  const [submitPending, setSubmitPending] = useState(false);
  const [activeMenuCommentId, setActiveMenuCommentId] = useState<string | null>(null);
  const [deletePendingCommentId, setDeletePendingCommentId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editPendingCommentId, setEditPendingCommentId] = useState<string | null>(null);
  const [allCommentsLoaded, setAllCommentsLoaded] = useState(comments.length >= commentCount);
  const [loadAllPending, setLoadAllPending] = useState(false);
  const [totalCommentCount, setTotalCommentCount] = useState(commentCount);
  const [visibleComments, setVisibleComments] = useState(comments);
  const [state, setState] = useState<CommentState>({});
  const shouldShowAllComments =
    totalCommentCount > visibleComments.length && !allCommentsLoaded;

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
      if (payload.comment) {
        const createdComment = payload.comment;
        const didAddComment = !visibleComments.some(
          (item) => item.comment.id === createdComment.id,
        );

        if (didAddComment) {
          setVisibleComments((currentComments) => [
            {
              author: {
                avatar_url: viewerAvatarUrl ?? null,
                display_name: viewerDisplayName ?? "Weldoo member",
                headline: viewerHeadline ?? null,
                id: createdComment.author_profile_id,
              },
              canDelete: true,
              comment: createdComment,
            },
            ...currentComments,
          ]);
          emitCommentCountChange(postId, 1);
          setTotalCommentCount((currentCount) => currentCount + 1);
        }
      }
      setOpen(true);
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not post comment.",
        status: "error",
      });
    } finally {
      setSubmitPending(false);
    }
  }

  function startEdit(comment: FeedComment) {
    setActiveMenuCommentId(null);
    setEditingCommentId(comment.comment.id);
    setEditBody(comment.comment.body);
    setState({});
  }

  function cancelEdit() {
    setEditingCommentId(null);
    setEditBody("");
    setState({});
  }

  async function saveEdit(commentId: string) {
    setEditPendingCommentId(commentId);
    setState({});

    try {
      const formData = new FormData();
      formData.set("body", editBody);

      const response = await fetch(`/api/feed/comments/${commentId}`, {
        body: formData,
        method: "PATCH",
      });
      const payload = (await response.json()) as CommentState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      if (payload.comment) {
        setVisibleComments((currentComments) =>
          currentComments.map((item) =>
            item.comment.id === commentId
              ? {
                  ...item,
                  comment: {
                    ...item.comment,
                    body: payload.comment?.body ?? item.comment.body,
                    updated_at: payload.comment?.updated_at ?? item.comment.updated_at,
                  },
                }
              : item,
          ),
        );
      }

      setEditingCommentId(null);
      setEditBody("");
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not update comment.",
        status: "error",
      });
    } finally {
      setEditPendingCommentId(null);
    }
  }

  async function deleteComment(commentId: string) {
    setActiveMenuCommentId(null);
    setDeletePendingCommentId(commentId);
    setState({});

    try {
      const response = await fetch(`/api/feed/comments/${commentId}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as CommentState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      const didDeleteComment = visibleComments.some((item) => item.comment.id === commentId);

      if (didDeleteComment) {
        setVisibleComments((currentComments) =>
          currentComments.filter((item) => item.comment.id !== commentId),
        );
        emitCommentCountChange(postId, -1);
        setTotalCommentCount((currentCount) => Math.max(0, currentCount - 1));
      }
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not delete comment.",
        status: "error",
      });
    } finally {
      setDeletePendingCommentId(null);
    }
  }

  async function loadAllComments() {
    setLoadAllPending(true);
    setState({});

    try {
      const response = await fetch(`/api/feed/posts/${postId}/comments`);
      const payload = (await response.json()) as CommentState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      setVisibleComments(payload.comments ?? []);
      setTotalCommentCount(payload.comments?.length ?? 0);
      setAllCommentsLoaded(true);
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not load comments.",
        status: "error",
      });
    } finally {
      setLoadAllPending(false);
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

      {visibleComments.length > 0 ? (
        <div className="flex flex-col border-t border-weldoo-border-light py-1">
          {visibleComments.map((comment) => (
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
                  {comment.canDelete ? (
                    <div className="relative shrink-0">
                      <button
                        aria-expanded={activeMenuCommentId === comment.comment.id}
                        aria-label="Comment actions"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-weldoo-muted transition hover:bg-white hover:text-weldoo-indigo"
                        disabled={
                          deletePendingCommentId === comment.comment.id ||
                          editPendingCommentId === comment.comment.id
                        }
                        onClick={() =>
                          setActiveMenuCommentId((currentId) =>
                            currentId === comment.comment.id ? null : comment.comment.id,
                          )
                        }
                        type="button"
                      >
                        <MoreIcon />
                      </button>
                      {activeMenuCommentId === comment.comment.id ? (
                        <div className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-weldoo-sm border border-weldoo-border-light bg-white shadow-weldoo-lg">
                          <button
                            className="block w-full px-3 py-2 text-left text-[12.5px] font-semibold text-weldoo-slate transition hover:bg-weldoo-bg hover:text-weldoo-ink"
                            onClick={() => startEdit(comment)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="block w-full px-3 py-2 text-left text-[12.5px] font-semibold text-red-600 transition hover:bg-red-50"
                            onClick={() => deleteComment(comment.comment.id)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                {editingCommentId === comment.comment.id ? (
                  <div className="mt-1.5">
                    <textarea
                      aria-label="Edit comment"
                      className="min-h-[76px] w-full resize-y rounded-weldoo-sm border border-weldoo-border-light bg-white px-3 py-2 text-[13.5px] leading-[1.55] text-weldoo-ink outline-none transition focus:border-weldoo-indigo focus:ring-4 focus:ring-weldoo-indigo/10"
                      maxLength={2000}
                      onChange={(event) => setEditBody(event.currentTarget.value)}
                      value={editBody}
                    />
                    {state.errors?.body ? (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {state.errors.body}
                      </p>
                    ) : null}
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        className="inline-flex h-8 items-center justify-center rounded-weldoo-sm border border-weldoo-border-light bg-white px-3 text-xs font-semibold text-weldoo-slate transition hover:bg-weldoo-bg"
                        disabled={editPendingCommentId === comment.comment.id}
                        onClick={cancelEdit}
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        className="inline-flex h-8 items-center justify-center rounded-weldoo-sm bg-weldoo-indigo px-3 text-xs font-semibold text-white transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60"
                        disabled={editPendingCommentId === comment.comment.id}
                        onClick={() => saveEdit(comment.comment.id)}
                        type="button"
                      >
                        {editPendingCommentId === comment.comment.id ? "Saving" : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-line text-[13.5px] leading-[1.55] text-weldoo-ink">
                    {comment.comment.body}
                  </p>
                )}
              </div>
            </article>
          ))}
          {shouldShowAllComments ? (
            <button
              className="mx-4 my-1 self-start rounded-weldoo-sm px-2 py-1 text-[12.5px] font-semibold text-weldoo-muted transition hover:bg-weldoo-bg hover:text-weldoo-indigo"
              disabled={loadAllPending}
              onClick={loadAllComments}
              type="button"
            >
              {loadAllPending
                ? "Loading comments"
                : `Show all ${totalCommentCount} comments`}
            </button>
          ) : null}
        </div>
      ) : null}

    </section>
  );
}
