"use client";

import { useId, useState, type ChangeEvent } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ProfileMediaUploadFieldProps = {
  bucket: "avatars" | "covers";
  currentUrl?: string | null;
  description: string;
  label: string;
  name: string;
};

const limits = {
  avatars: {
    label: "2 MB",
    value: 2 * 1024 * 1024,
  },
  covers: {
    label: "5 MB",
    value: 5 * 1024 * 1024,
  },
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

export function ProfileMediaUploadField({
  bucket,
  currentUrl,
  description,
  label,
  name,
}: ProfileMediaUploadFieldProps) {
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

    if (file.size > limits[bucket].value) {
      setStatus("error");
      setMessage(`Use an image smaller than ${limits[bucket].label}.`);
      return;
    }

    setStatus("uploading");
    setMessage("Uploading image...");

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

    const extension = getFileExtension(file);
    const path = `${user.id}/${name}-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (uploadError) {
      setStatus("error");
      setMessage(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setUrl(data.publicUrl);
    setStatus("success");
    setMessage("Image uploaded. Save the profile to apply it.");
  }

  const isCover = bucket === "covers";

  return (
    <div className="space-y-3 rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border-light)] bg-[var(--weldoo-bg)] p-3">
      <input name={name} type="hidden" value={url} />
      <div>
        <label
          className="block text-sm font-semibold text-[var(--weldoo-ink)]"
          htmlFor={inputId}
        >
          {label}
        </label>
        <p className="mt-1 text-xs leading-5 text-[var(--weldoo-muted)]">{description}</p>
      </div>

      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className={
            isCover
              ? "h-28 w-full rounded-[var(--weldoo-radius-sm)] object-cover"
              : "h-20 w-20 rounded-full object-cover"
          }
          src={url}
        />
      ) : null}

      <input
        accept="image/jpeg,image/png,image/webp"
        className="block w-full text-sm text-[var(--weldoo-muted)] file:mr-3 file:h-9 file:rounded-[var(--weldoo-radius-sm)] file:border-0 file:bg-white file:px-3 file:text-sm file:font-semibold file:text-[var(--weldoo-slate)]"
        disabled={status === "uploading"}
        id={inputId}
        onChange={handleFileChange}
        type="file"
      />

      {message ? (
        <p
          className={
            status === "error"
              ? "text-xs font-semibold text-red-600"
              : "text-xs font-semibold text-[var(--weldoo-muted)]"
          }
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
