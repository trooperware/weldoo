"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { PostImageUploadField } from "@/components/feed/post-image-upload-field";
import { Button, FormError, Textarea } from "@/components/ui";
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
      className="rounded-weldoo-md border border-weldoo-border-light bg-white px-[18px] py-4 shadow-weldoo-sm transition hover:shadow-weldoo-md"
      onSubmit={handleSubmit}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-sm font-bold text-white">
          W
        </div>
        <div className="min-w-0 flex-1">
          <Textarea
            aria-label="Post text"
            error={state.errors?.body}
            id="body"
            className="!h-10 !min-h-10 resize-none overflow-hidden rounded-full border-[1.5px] bg-[#eeeef8] px-[18px] py-2.5 text-sm leading-5"
            name="body"
            placeholder="Share something with the community..."
            rows={1}
          />
        </div>
      </div>

      <div className="mt-3">
        <FormError>{state.status === "error" ? state.message : null}</FormError>
        {state.status === "success" && state.message ? (
          <div
            className="rounded-weldoo-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
            role="status"
          >
            {state.message}
          </div>
        ) : null}
      </div>

      <input name="tags" type="hidden" value="" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PostImageUploadField />
        <Button
          className="h-[34px] rounded-weldoo-sm border border-weldoo-border-light bg-white px-3 text-xs font-semibold text-weldoo-indigo shadow-none hover:bg-weldoo-bg-strong"
          disabled={pending}
          size="sm"
          type="submit"
        >
          {pending ? "Publishing" : "Publish"}
        </Button>
      </div>
    </form>
  );
}
