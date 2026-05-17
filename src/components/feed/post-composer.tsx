"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { PostImageUploadField } from "@/components/feed/post-image-upload-field";
import { Button, FormError, Input, Textarea } from "@/components/ui";
import type { PostFieldErrors } from "@/lib/validators/post";

type SaveState = {
  errors?: PostFieldErrors;
  message?: string;
  status?: "error" | "success";
};

export function PostComposer() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SaveState>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState({});

    try {
      const form = event.currentTarget;
      const response = await fetch("/api/feed/posts", {
        body: new FormData(form),
        method: "POST",
      });
      const payload = (await response.json()) as SaveState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      form.reset();
      setState({
        message: payload.message ?? "Post published.",
        status: "success",
      });
      router.refresh();
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not publish post.",
        status: "error",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="space-y-4 rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white p-5 shadow-weldoo-sm"
      onSubmit={handleSubmit}
    >
      <div>
        <h2 className="text-base font-bold text-[var(--weldoo-ink)]">Create post</h2>
        <p className="mt-1 text-sm text-[var(--weldoo-muted)]">
          Share welding work, shop updates, training notes, or job-relevant insights.
        </p>
      </div>

      <FormError>{state.status === "error" ? state.message : null}</FormError>
      {state.status === "success" && state.message ? (
        <div
          className="rounded-[var(--weldoo-radius-sm)] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
          role="status"
        >
          {state.message}
        </div>
      ) : null}

      <Textarea
        error={state.errors?.body}
        id="body"
        label="Post text"
        name="body"
        placeholder="Share a welding update..."
      />
      <Input
        error={state.errors?.tags}
        id="tags"
        label="Tags"
        name="tags"
        placeholder="TIG, stainless steel, inspection"
      />
      <PostImageUploadField />

      <Button disabled={pending} type="submit">
        {pending ? "Publishing" : "Publish post"}
      </Button>
    </form>
  );
}
