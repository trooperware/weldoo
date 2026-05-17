"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, FormError, Modal, Textarea } from "@/components/ui";
import type { CommentFieldErrors } from "@/lib/validators/comment";
import type { FeedComment } from "@/components/feed/feed-post-card";

type FeedCommentsProps = {
  canComment: boolean;
  comments: FeedComment[];
  postId: string;
};

type CommentState = {
  errors?: CommentFieldErrors;
  message?: string;
  status?: "error" | "success";
};

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function FeedComments({ canComment, comments, postId }: FeedCommentsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [state, setState] = useState<CommentState>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
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
      setPending(false);
    }
  }

  async function handleDeleteComment() {
    if (!deleteCommentId) return;

    setPending(true);
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
      setPending(false);
    }
  }

  return (
    <section className="mt-4 border-t border-[var(--weldoo-border-light)] pt-4">
      <h3 className="text-sm font-bold text-[var(--weldoo-ink)]">Comments</h3>
      <FormError>{state.status === "error" ? state.message : null}</FormError>

      {comments.length > 0 ? (
        <div className="mt-3 space-y-3">
          {comments.map((comment) => (
            <article
              className="rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border-light)] bg-[var(--weldoo-bg)] p-3"
              key={comment.comment.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--weldoo-ink)]">
                    {comment.author?.display_name ?? "Weldoo member"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--weldoo-muted)]">
                    {formatCommentDate(comment.comment.created_at)}
                  </p>
                </div>
                {comment.canDelete ? (
                  <Button
                    disabled={pending}
                    onClick={() => setDeleteCommentId(comment.comment.id)}
                    size="sm"
                    variant="danger"
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--weldoo-ink)]">
                {comment.comment.body}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-[var(--weldoo-radius-sm)] border border-dashed border-[var(--weldoo-border-light)] bg-white p-3 text-sm text-[var(--weldoo-muted)]">
          No comments yet.
        </p>
      )}

      {canComment ? (
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <Textarea
            error={state.errors?.body}
            id={`comment-${postId}`}
            label="Add comment"
            name="body"
            placeholder="Add a professional comment..."
          />
          <Button disabled={pending} size="sm" type="submit">
            {pending ? "Posting" : "Post comment"}
          </Button>
        </form>
      ) : null}

      <Modal
        description="This action is irreversible. The comment will be permanently removed."
        footer={
          <>
            <Button
              disabled={pending}
              onClick={() => setDeleteCommentId(null)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button disabled={pending} onClick={handleDeleteComment} variant="danger">
              {pending ? "Deleting" : "Delete permanently"}
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
