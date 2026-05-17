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
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SaveState>({});

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
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
      setPending(false);
    }
  }

  async function handleDelete() {
    setPending(true);
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
      setPending(false);
    }
  }

  if (!editing) {
    return (
      <div className="mt-4 border-t border-[var(--weldoo-border-light)] pt-4">
        <FormError>{state.status === "error" ? state.message : null}</FormError>
        <div className="flex flex-wrap gap-2">
          <Button disabled={pending} onClick={() => setEditing(true)} size="sm" variant="ghost">
            Edit
          </Button>
          <Button
            disabled={pending}
            onClick={() => setDeleteModalOpen(true)}
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
                disabled={pending}
                onClick={() => setDeleteModalOpen(false)}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button disabled={pending} onClick={handleDelete} variant="danger">
                {pending ? "Deleting" : "Delete permanently"}
              </Button>
            </>
          }
          onOpenChange={setDeleteModalOpen}
          open={deleteModalOpen}
          title="Delete post?"
        >
          <p className="text-sm leading-6 text-weldoo-muted">
            Are you sure you want to delete this post? This cannot be undone.
          </p>
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
      <PostImageUploadField currentUrl={defaultValues.imageUrl} />
      <div className="flex flex-wrap gap-2">
        <Button disabled={pending} size="sm" type="submit">
          {pending ? "Saving" : "Save changes"}
        </Button>
        <Button
          disabled={pending}
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
