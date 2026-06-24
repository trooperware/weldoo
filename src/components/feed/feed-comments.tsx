"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Avatar, Button, FormError, Modal, Textarea } from "@/components/ui";
import { ReportContentButton } from "@/components/feed/report-content-button";
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

function formatCommentDate(value: string) {
  const createdAt = new Date(value);
  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(createdAt);
}

export function FeedComments({
  canComment,
  comments,
  postId,
  viewerAvatarUrl,
  viewerInitial = "W",
}: FeedCommentsProps) {
  const router = useRouter();
  const [submitPending, setSubmitPending] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [state, setState] = useState<CommentState>({});

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

  async function handleDeleteComment() {
    if (!deleteCommentId) return;

    setDeletePending(true);
    setState({});

    try {
      const response = await fetch(`/api/feed/comments/${deleteCommentId}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as CommentState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      setDeleteCommentId(null);
      router.refresh();
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not delete comment.",
        status: "error",
      });
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <section className="border-t border-weldoo-border-light bg-white">
      <div className="px-[18px] pt-3">
        <FormError>{state.status === "error" ? state.message : null}</FormError>
      </div>

      {comments.length > 0 ? (
        <div className="space-y-2 px-[18px] py-3">
          {comments.map((comment) => (
            <article
              className="flex gap-2.5"
              key={comment.comment.id}
            >
              <Avatar
                className="h-8 w-8 text-[11px] shadow-none"
                initials={(comment.author?.display_name ?? "W").slice(0, 1).toUpperCase()}
                src={comment.author?.avatar_url}
              />
              <div className="min-w-0 flex-1 rounded-[4px_14px_14px_14px] bg-weldoo-bg px-3 py-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold leading-tight text-weldoo-ink">
                      {comment.author?.display_name ?? "Weldoo member"}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-weldoo-muted">
                      {formatCommentDate(comment.comment.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    {canComment ? (
                      <ReportContentButton
                        commentId={comment.comment.id}
                        targetLabel="comment"
                        targetType="comment"
                      />
                    ) : null}
                    {comment.canDelete ? (
                      <Button
                        className="h-7 rounded-full px-2 text-[11.5px]"
                        disabled={deletePending}
                        onClick={() => setDeleteCommentId(comment.comment.id)}
                        size="sm"
                        variant="ghost"
                      >
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </div>
                <p className="mt-1 whitespace-pre-line text-[13px] leading-5 text-weldoo-ink">
                  {comment.comment.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {canComment ? (
        <form
          className="flex items-start gap-2.5 border-t border-weldoo-border-light px-[18px] py-3"
          onSubmit={handleSubmit}
        >
          <Avatar
            className="mt-0.5 h-8 w-8 text-[11px] shadow-none"
            initials={viewerInitial}
            src={viewerAvatarUrl}
          />
          <div className="min-w-0 flex-1">
            <Textarea
              aria-label="Add comment"
              className="min-h-10 resize-none rounded-[20px] px-4 py-2 text-[13px] leading-5"
              error={state.errors?.body}
              id={`comment-${postId}`}
              maxLength={2000}
              name="body"
              placeholder="Add a professional comment..."
              rows={1}
            />
          </div>
          <Button
            className="mt-0.5 h-8 shrink-0 rounded-full px-3 text-[12px]"
            disabled={submitPending}
            size="sm"
            type="submit"
          >
            {submitPending ? "Posting" : "Post"}
          </Button>
        </form>
      ) : null}

      <Modal
        description="This action is irreversible. The comment will be permanently removed."
        footer={
          <>
            <Button
              disabled={deletePending}
              onClick={() => setDeleteCommentId(null)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button disabled={deletePending} onClick={handleDeleteComment} variant="danger">
              {deletePending ? "Deleting" : "Delete permanently"}
            </Button>
          </>
        }
        onOpenChange={(open) => {
          if (!open) setDeleteCommentId(null);
        }}
        open={Boolean(deleteCommentId)}
        title="Delete comment?"
      >
        <p className="text-sm leading-6 text-weldoo-muted">
          Are you sure you want to delete this comment? This cannot be undone.
        </p>
      </Modal>
    </section>
  );
}
