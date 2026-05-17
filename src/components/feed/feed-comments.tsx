"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, FormError, Modal, Textarea } from "@/components/ui";
import { ReportContentButton } from "@/components/feed/report-content-button";
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
    <section className="border-t border-weldoo-border-light">
      <FormError>{state.status === "error" ? state.message : null}</FormError>

      {comments.length > 0 ? (
        <div className="space-y-0.5 py-1">
          {comments.map((comment) => (
            <article
              className="flex gap-2 px-4 py-2"
              key={comment.comment.id}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-xs font-bold text-white">
                {(comment.author?.display_name ?? "W").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 rounded-[4px_14px_14px_14px] border border-weldoo-border-light bg-weldoo-bg px-3 py-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-tight text-weldoo-ink">
                    {comment.author?.display_name ?? "Weldoo member"}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-weldoo-muted">
                    {formatCommentDate(comment.comment.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {canComment ? (
                      <ReportContentButton
                        commentId={comment.comment.id}
                        targetLabel="comment"
                        targetType="comment"
                      />
                    ) : null}
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
                </div>
                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-weldoo-ink">
                  {comment.comment.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mx-4 my-3 rounded-weldoo-sm border border-dashed border-weldoo-border-light bg-white p-3 text-sm text-weldoo-muted">
          No comments yet.
        </p>
      )}

      {canComment ? (
        <form className="flex items-start gap-2 border-t border-weldoo-border-light px-[18px] py-3" onSubmit={handleSubmit}>
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-xs font-bold text-white">
            W
          </div>
          <div className="min-w-0 flex-1">
          <Textarea
            aria-label="Add comment"
            error={state.errors?.body}
            id={`comment-${postId}`}
            className="min-h-11 rounded-full px-4 py-2"
            name="body"
            placeholder="Add a professional comment..."
            rows={1}
          />
          </div>
          <Button className="mt-1 h-9 shrink-0" disabled={pending} size="sm" type="submit">
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
