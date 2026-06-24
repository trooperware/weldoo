"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { PostImageUploadField } from "@/components/feed/post-image-upload-field";
import { Button, FormError, Input, Modal, Textarea } from "@/components/ui";
import type { PostFieldErrors } from "@/lib/validators/post";

type PostOwnerControlsProps = {
  defaultValues: {
    body: string;
    imageUrl?: string | null;
    tags: string[];
  };
  postId: string;
};

type SaveState = {
  errors?: PostFieldErrors;
  message?: string;
  status?: "error" | "success";
};

export function PostOwnerControls({ defaultValues, postId }: PostOwnerControlsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [updatePending, setUpdatePending] = useState(false);
  const [state, setState] = useState<SaveState>({});

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (updatePending) return;

    setUpdatePending(true);
    setState({});

    try {
      const response = await fetch(`/api/feed/posts/${postId}`, {
        body: new FormData(event.currentTarget),
        method: "PATCH",
      });
      const payload = (await response.json()) as SaveState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      setState({
        message: payload.message ?? "Post updated.",
        status: "success",
      });
      setEditing(false);
      router.refresh();
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not update post.",
        status: "error",
      });
    } finally {
      setUpdatePending(false);
    }
  }

  async function handleDelete() {
    if (deletePending) return;

    setDeletePending(true);
    setState({});

    try {
      const response = await fetch(`/api/feed/posts/${postId}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as SaveState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      setDeleteModalOpen(false);
      router.refresh();
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not delete post.",
        status: "error",
      });
    } finally {
      setDeletePending(false);
    }
  }

  if (!editing) {
    return (
      <div className="mt-4 border-t border-[var(--weldoo-border-light)] pt-4">
        <FormError>{state.status === "error" ? state.message : null}</FormError>
        {state.status === "success" && state.message ? (
          <div
            className="mb-3 rounded-weldoo-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12.5px] font-semibold text-emerald-700"
            role="status"
          >
            {state.message}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={deletePending}
            onClick={() => {
              setEditing(true);
              setState({});
            }}
            size="sm"
            variant="ghost"
          >
            Edit
          </Button>
          <Button
            disabled={deletePending}
            onClick={() => {
              setState({});
              setDeleteModalOpen(true);
            }}
            size="sm"
            variant="danger"
          >
            Delete
          </Button>
        </div>
        <Modal
          description="This action is irreversible. The post will be permanently removed from the feed."
          footer={
            <>
              <Button
                disabled={deletePending}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setState({});
                }}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button disabled={deletePending} onClick={handleDelete} variant="danger">
                {deletePending ? "Deleting" : "Delete permanently"}
              </Button>
            </>
          }
          onOpenChange={(open) => {
            if (deletePending) return;
            setDeleteModalOpen(open);
            if (!open) setState({});
          }}
          open={deleteModalOpen}
          title="Delete post?"
        >
          <div className="space-y-3">
            <p className="text-sm leading-6 text-weldoo-muted">
              Are you sure you want to delete this post? This action is irreversible and cannot
              be undone.
            </p>
            <div className="rounded-weldoo-sm border border-red-100 bg-red-50 px-3 py-2 text-[12.5px] font-semibold leading-5 text-red-700">
              The post and its media reference will be permanently removed from the feed.
            </div>
            <FormError>{state.status === "error" ? state.message : null}</FormError>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <form
      className="mt-4 space-y-4 border-t border-[var(--weldoo-border-light)] pt-4"
      onSubmit={handleUpdate}
    >
      <FormError>{state.status === "error" ? state.message : null}</FormError>
      <Textarea
        defaultValue={defaultValues.body}
        error={state.errors?.body}
        id={`body-${postId}`}
        label="Post text"
        name="body"
      />
      <Input
        defaultValue={defaultValues.tags.join(", ")}
        error={state.errors?.tags}
        id={`tags-${postId}`}
        label="Tags"
        name="tags"
      />
      <div className="rounded-weldoo-sm border border-weldoo-border-light px-3 py-2">
        <PostImageUploadField currentUrl={defaultValues.imageUrl} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={updatePending} size="sm" type="submit">
          {updatePending ? "Saving" : "Save changes"}
        </Button>
        <Button
          disabled={updatePending}
          onClick={() => {
            setEditing(false);
            setState({});
          }}
          size="sm"
          type="button"
          variant="ghost"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
