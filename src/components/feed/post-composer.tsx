"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { PostImageUploadField } from "@/components/feed/post-image-upload-field";
import { Avatar, FormError } from "@/components/ui";
import { POST_BODY_MAX_LENGTH } from "@/lib/constants/posts";
import type { PostFieldErrors } from "@/lib/validators/post";

type SaveState = {
  errors?: PostFieldErrors;
  message?: string;
  status?: "error" | "success";
};

type PostComposerProps = {
  avatarUrl?: string | null;
  initial: string;
};

type ComposerAvatarProps = {
  avatarUrl?: string | null;
  initial: string;
};

function ComposerAvatar({ avatarUrl, initial }: ComposerAvatarProps) {
  return (
    <Avatar
      className="h-10 w-10 text-sm shadow-[0_8px_20px_rgba(61,61,180,0.22)]"
      initials={initial}
      src={avatarUrl}
    />
  );
}

function ComposerActionButton({
  children,
  icon,
  onClick,
}: {
  children: ReactNode;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-5 py-[9px] text-[13px] font-medium tracking-[-0.01em] text-weldoo-ink transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo"
      onClick={onClick}
      type="button"
    >
      {icon}
      {children}
    </button>
  );
}

function PhotoIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <path d="M4 5H20V19H4V5ZM8.5 10A1.5 1.5 0 1 0 8.5 7A1.5 1.5 0 0 0 8.5 10ZM20 15L16 11L6 19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <path d="M23 7L16 12L23 17V7ZM1 5H16V19H1V5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function ArticleIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM14 2V8H20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export function PostComposer({ avatarUrl, initial }: PostComposerProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SaveState>({});

  const characterCount = body.length;
  const canSubmit = body.trim().length > 0 && characterCount <= POST_BODY_MAX_LENGTH && !pending;

  useEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  function openComposer() {
    setOpen(true);
    setState({});
  }

  function closeComposer() {
    if (!pending) setOpen(false);
  }

  function handleOverlayMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      closeComposer();
    }
  }

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
      setBody("");
      setFormKey((currentKey) => currentKey + 1);
      setOpen(false);
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

  const modal = open
    ? createPortal(
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center bg-[rgba(12,12,24,0.45)] p-4"
          onMouseDown={handleOverlayMouseDown}
        >
          <form
            className="flex max-h-[calc(100dvh-32px)] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(22,22,48,0.22)]"
            onSubmit={handleSubmit}
          >
            <header className="flex shrink-0 items-center justify-between border-b border-weldoo-border-light px-5 py-4">
              <h2 className="text-[16.5px] font-bold leading-none text-weldoo-ink">Create post</h2>
              <button
                aria-label="Close post composer"
                className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-weldoo-bg text-[22px] leading-none text-weldoo-slate transition hover:bg-weldoo-bg-strong hover:text-weldoo-ink"
                disabled={pending}
                onClick={closeComposer}
                type="button"
              >
                &times;
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="flex gap-3">
                <ComposerAvatar avatarUrl={avatarUrl} initial={initial} />
                <div className="min-w-0 flex-1">
                  <textarea
                    aria-label="Post text"
                    className="min-h-[120px] w-full resize-none border-0 bg-transparent p-0 text-[14.3px] leading-[1.6] text-weldoo-ink outline-none placeholder:text-weldoo-muted"
                    maxLength={POST_BODY_MAX_LENGTH}
                    name="body"
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="What would you like to share?"
                    ref={textareaRef}
                    value={body}
                  />
                  <FormError className="mt-2">{state.errors?.body}</FormError>
                </div>
              </div>

              <input name="tags" type="hidden" value="" />

              <div className="mt-3 rounded-weldoo-sm border border-weldoo-border-light px-3 py-2">
                <PostImageUploadField key={formKey} variant="editor" />
              </div>

              <FormError className="mt-3">{state.status === "error" ? state.message : null}</FormError>
            </div>

            <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-weldoo-border-light px-5 py-3">
              <span
                className={
                  characterCount >= POST_BODY_MAX_LENGTH
                    ? "mr-auto text-[12.1px] font-semibold text-red-600"
                    : "mr-auto text-[12.1px] font-medium text-weldoo-muted"
                }
              >
                {characterCount} / {POST_BODY_MAX_LENGTH}
              </span>
              <button
                className="h-[38px] rounded-full bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] px-[22px] text-[13.2px] font-semibold text-white shadow-weldoo-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canSubmit}
                type="submit"
              >
                {pending ? "Publishing" : "Post"}
              </button>
            </footer>
          </form>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <section className="rounded-weldoo-md border border-weldoo-border-light bg-white px-[18px] py-4 shadow-weldoo-sm transition hover:shadow-weldoo-md">
        <div className="mb-3 flex items-center gap-3">
          <ComposerAvatar avatarUrl={avatarUrl} initial={initial} />
          <button
            className="h-10 min-w-0 flex-1 rounded-full border-[1.5px] border-weldoo-border-light bg-weldoo-bg-strong px-[18px] text-left text-sm leading-5 tracking-[-0.01em] text-weldoo-muted transition hover:border-[#c8c8e0] hover:bg-weldoo-bg"
            onClick={openComposer}
            type="button"
          >
            Share something with the community...
          </button>
        </div>

        {state.status === "success" && state.message ? (
          <div
            className="mb-3 rounded-weldoo-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
            role="status"
          >
            {state.message}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-0">
          <ComposerActionButton icon={<PhotoIcon />} onClick={openComposer}>
            Photo
          </ComposerActionButton>
          <ComposerActionButton icon={<VideoIcon />} onClick={openComposer}>
            Video
          </ComposerActionButton>
          <ComposerActionButton icon={<ArticleIcon />} onClick={openComposer}>
            Article
          </ComposerActionButton>
        </div>
      </section>
      {modal}
    </>
  );
}
