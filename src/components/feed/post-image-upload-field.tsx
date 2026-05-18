"use client";

import { useId, useState, type ChangeEvent } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PostImageUploadFieldProps = {
  currentUrl?: string | null;
};

function getFileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && ["jpg", "jpeg", "png", "webp"].includes(extension)) {
    return extension;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export function PostImageUploadField({ currentUrl }: PostImageUploadFieldProps) {
  const inputId = useId();
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [url, setUrl] = useState(currentUrl ?? "");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setStatus("error");
      setMessage("Use a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus("error");
      setMessage("Use an image smaller than 5 MB.");
      return;
    }

    setStatus("uploading");
    setMessage("Uploading image...");

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setStatus("error");
        setMessage("Sign in again before uploading images.");
        return;
      }

      const path = `${user.id}/post-${Date.now()}.${getFileExtension(file)}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        setStatus("error");
        setMessage(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      setUrl(data.publicUrl);
      setStatus("success");
      setMessage("Image uploaded. Publish or save the post to apply it.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not upload image.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <input name="imageUrl" type="hidden" value={url} />
      <input
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={status === "uploading"}
        id={inputId}
        onChange={handleFileChange}
        type="file"
      />
      <label
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-weldoo-sm px-3 py-[7px] text-[12.5px] font-medium tracking-[-0.01em] text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo"
        htmlFor={inputId}
      >
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
          <path d="M4 5H20V19H4V5ZM8.5 10A1.5 1.5 0 1 0 8.5 7A1.5 1.5 0 0 0 8.5 10ZM20 15L16 11L6 19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
        Photo
      </label>
      <button
        className="inline-flex items-center gap-1.5 rounded-weldoo-sm px-3 py-[7px] text-[12.5px] font-medium tracking-[-0.01em] text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo"
        disabled
        type="button"
      >
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
          <path d="M23 7L16 12L23 17V7ZM1 5H16V19H1V5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
        Video
      </button>
      <button
        className="inline-flex items-center gap-1.5 rounded-weldoo-sm px-3 py-[7px] text-[12.5px] font-medium tracking-[-0.01em] text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo"
        disabled
        type="button"
      >
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM14 2V8H20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
        Article
      </button>
      {url ? (
        <span className="text-xs font-semibold text-weldoo-indigo">Image ready</span>
      ) : null}
      {message ? (
        <p
          className={
            status === "error"
              ? "text-xs font-semibold text-red-600"
              : "text-xs font-semibold text-weldoo-muted"
          }
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
