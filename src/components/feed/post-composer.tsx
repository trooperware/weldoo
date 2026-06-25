"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { Avatar, FormError } from "@/components/ui";
import { POST_BODY_MAX_LENGTH } from "@/lib/constants/posts";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { PostFieldErrors } from "@/lib/validators/post";

type SaveState = {
  errors?: PostFieldErrors;
  message?: string;
  status?: "error" | "success";
};

type PostComposerProps = {
  avatarUrl?: string | null;
  displayName: string;
  initial: string;
};

type ComposerMode = "photo" | "text" | "video";
type PhotoStep = "compose" | "select";
type VideoStep = "compose" | "select";

type SelectedVideo = {
  file: File;
  objectUrl: string;
};

type SelectedPhoto = {
  file: File;
  id: string;
  previewUrl: string;
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

function getFileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && ["jpg", "jpeg", "png", "webp"].includes(extension)) {
    return extension;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function formatMegabytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function PostComposer({ avatarUrl, displayName, initial }: PostComposerProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<ComposerMode>("text");
  const [photoStep, setPhotoStep] = useState<PhotoStep>("select");
  const [videoStep, setVideoStep] = useState<VideoStep>("select");
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo | null>(null);
  const [photoPreviewIndex, setPhotoPreviewIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SaveState>({});

  const characterCount = body.length;
  const selectedPhotoPreviews = selectedPhotos.map((photo) => photo.previewUrl);
  const canSubmit =
    body.trim().length > 0 &&
    (mode !== "photo" || selectedPhotos.length > 0) &&
    (mode !== "video" || Boolean(selectedVideo)) &&
    characterCount <= POST_BODY_MAX_LENGTH &&
    !pending;

  useEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(() => {
      if (
        mode === "text" ||
        (mode === "photo" && photoStep === "compose") ||
        (mode === "video" && videoStep === "compose")
      ) {
        textareaRef.current?.focus();
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [mode, open, photoStep, videoStep]);

  function handleModalKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      closeComposer();
    }
  }

  function openComposer(nextMode: ComposerMode = "text") {
    setMode(nextMode);
    setPhotoStep("select");
    setVideoStep("select");
    clearSelectedPhotos();
    clearSelectedVideo();
    setBody("");
    setOpen(true);
    setState({});
  }

  function closeComposer() {
    if (!pending) {
      setOpen(false);
      if (mode === "photo") {
        clearSelectedPhotos();
      }
      if (mode === "video") {
        clearSelectedVideo();
      }
    }
  }

  function handleOverlayMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      closeComposer();
    }
  }

  function clearSelectedPhotos() {
    selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setSelectedPhotos([]);
    setPhotoPreviewIndex(0);

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  }

  function setSelectedPhotoFiles(fileList?: FileList | File[]) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    const validFiles: File[] = [];

    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setState({ message: "Use JPG, PNG, or WebP images.", status: "error" });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setState({ message: "Use images smaller than 5 MB.", status: "error" });
        return;
      }

      validFiles.push(file);
    }

    setState({});
    selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setSelectedPhotos(
      validFiles.map((file, index) => ({
        file,
        id: `${file.name}-${file.lastModified}-${index}`,
        previewUrl: URL.createObjectURL(file),
      })),
    );
    setPhotoPreviewIndex(0);
  }

  function removeSelectedPhoto(photoId: string) {
    setSelectedPhotos((currentPhotos) => {
      const photo = currentPhotos.find((item) => item.id === photoId);
      if (photo) {
        URL.revokeObjectURL(photo.previewUrl);
      }

      const nextPhotos = currentPhotos.filter((item) => item.id !== photoId);
      if (nextPhotos.length === 0) {
        setPhotoPreviewIndex(0);
      } else {
        setPhotoPreviewIndex((currentIndex) => Math.min(currentIndex, nextPhotos.length - 1));
      }

      return nextPhotos;
    });
  }

  function handlePhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    setSelectedPhotoFiles(event.target.files ?? undefined);
  }

  function handlePhotoDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedPhotoFiles(event.dataTransfer.files);
  }

  function clearSelectedVideo() {
    setSelectedVideo((current) => {
      if (current?.objectUrl) {
        URL.revokeObjectURL(current.objectUrl);
      }

      return null;
    });

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  }

  function setSelectedVideoFile(file?: File) {
    if (!file) return;

    const validVideoTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
      "video/ogg",
      "video/mpeg",
    ];
    const hasValidType = validVideoTypes.includes(file.type);
    const hasValidExtension = /\.(mp4|mov|avi|webm|ogv|mpeg|mpg)$/i.test(file.name);

    if (!hasValidType && !hasValidExtension) {
      setState({ message: "Use an MP4, MOV, AVI, WebM, OGV, or MPEG video.", status: "error" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setState({ message: "Use a video smaller than 10 MB.", status: "error" });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setState({});
    setSelectedVideo((current) => {
      if (current?.objectUrl) {
        URL.revokeObjectURL(current.objectUrl);
      }

      return { file, objectUrl };
    });
  }

  function handleVideoSelected(event: ChangeEvent<HTMLInputElement>) {
    setSelectedVideoFile(event.target.files?.[0]);
  }

  function handleVideoDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedVideoFile(event.dataTransfer.files?.[0]);
  }

  async function uploadSelectedPhoto(file: File) {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Sign in again before uploading images.");
    }

    const path = `${user.id}/post-${Date.now()}-${crypto.randomUUID()}.${getFileExtension(file)}`;
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    return supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
  }

  async function uploadSelectedPhotos(photos: SelectedPhoto[]) {
    return Promise.all(photos.map((photo) => uploadSelectedPhoto(photo.file)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setState({});

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      if (mode === "video") {
        if (!selectedVideo) {
          setState({ message: "Select a video before publishing.", status: "error" });
          return;
        }

        if (!body.trim()) {
          setState({ message: "Write something before publishing.", status: "error" });
          return;
        }

        form.reset();
        setBody("");
        clearSelectedVideo();
        setOpen(false);
        setState({
          message: "Video post preview ready. Video hosting will be connected later.",
          status: "success",
        });
        return;
      }

      if (mode === "photo") {
        if (selectedPhotos.length === 0) {
          setState({ message: "Select a photo before publishing.", status: "error" });
          return;
        }

        const imageUrls = await uploadSelectedPhotos(selectedPhotos);
        formData.set("imageUrl", imageUrls[0] ?? "");
        formData.set("imageUrls", JSON.stringify(imageUrls));
      }

      const response = await fetch("/api/feed/posts", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json()) as SaveState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      form.reset();
      setBody("");
      clearSelectedPhotos();
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
          onKeyDown={handleModalKeyDown}
          onMouseDown={handleOverlayMouseDown}
        >
          <form
            className="flex max-h-[calc(100dvh-32px)] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(22,22,48,0.22)]"
            onSubmit={handleSubmit}
          >
            <header className="flex shrink-0 items-center justify-between border-b border-weldoo-border-light px-5 py-4">
              {(mode === "photo" && photoStep === "compose") ||
              (mode === "video" && videoStep === "compose") ? (
                <button
                  className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-1 text-sm font-semibold text-weldoo-indigo"
                  disabled={pending}
                  onClick={() => {
                    if (mode === "photo") {
                      setPhotoStep("select");
                    } else {
                      setVideoStep("select");
                    }
                  }}
                  type="button"
                >
                  <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Back
                </button>
              ) : (
                <h2 className="text-[16.5px] font-bold leading-none text-weldoo-ink">
                  {mode === "photo" ? "Add photos" : mode === "video" ? "Add video" : "Create post"}
                </h2>
              )}
              {(mode === "photo" && photoStep === "compose") ||
              (mode === "video" && videoStep === "compose") ? (
                <h2 className="absolute left-1/2 -translate-x-1/2 text-[16.5px] font-bold leading-none text-weldoo-ink">
                  Create post
                </h2>
              ) : null}
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

            {mode === "photo" && photoStep === "select" ? (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto p-6">
                  <button
                    className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c7c7e8] px-6 py-12 text-center transition hover:border-weldoo-indigo hover:bg-[#f4f4fc]"
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "copy";
                    }}
                    onDrop={handlePhotoDrop}
                    onClick={() => photoInputRef.current?.click()}
                    type="button"
                  >
                    <svg aria-hidden="true" className="h-12 w-12 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                      <rect
                        height="18"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        width="18"
                        x="3"
                        y="3"
                      />
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span className="mt-3 text-[16px] font-semibold text-weldoo-ink">
                      Select photos
                    </span>
                    <span className="mt-1 text-[13px] text-weldoo-muted">
                      Click to browse or drag & drop
                    </span>
                  </button>
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handlePhotoSelected}
                    multiple
                    ref={photoInputRef}
                    type="file"
                  />
                  {selectedPhotos.length > 0 ? (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {selectedPhotos.map((photo) => (
                        <button
                          className="group relative cursor-pointer overflow-hidden rounded-lg border-2 border-transparent transition hover:border-weldoo-indigo"
                          key={photo.id}
                          onClick={() => removeSelectedPhoto(photo.id)}
                          title="Click to remove"
                          type="button"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt=""
                            className="h-20 w-full object-cover"
                            src={photo.previewUrl}
                          />
                          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
                            &times;
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <FormError className="mt-3">{state.status === "error" ? state.message : null}</FormError>
                </div>
                <footer className="flex shrink-0 justify-end gap-2 px-6 pb-5">
                  <button
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-weldoo-border-light px-4 text-[13.2px] font-semibold text-weldoo-ink transition hover:bg-weldoo-bg"
                    disabled={pending}
                    onClick={closeComposer}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-weldoo-indigo px-5 text-[13.2px] font-semibold text-white shadow-weldoo-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={selectedPhotos.length === 0}
                    onClick={() => setPhotoStep("compose")}
                    type="button"
                  >
                    Next
                  </button>
                </footer>
              </>
            ) : mode === "video" && videoStep === "select" ? (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto p-6">
                  <button
                    className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c7c7e8] px-6 py-12 text-center transition hover:border-weldoo-indigo hover:bg-[#f4f4fc]"
                    onClick={() => videoInputRef.current?.click()}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "copy";
                    }}
                    onDrop={handleVideoDrop}
                    type="button"
                  >
                    <svg aria-hidden="true" className="h-12 w-12 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                      <polygon
                        points="23 7 16 12 23 17 23 7"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                      <rect
                        height="14"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        width="15"
                        x="1"
                        y="5"
                      />
                    </svg>
                    <span className="mt-3 text-[16px] font-semibold text-weldoo-ink">
                      Select video
                    </span>
                    <span className="mt-1 text-[13px] text-weldoo-muted">
                      MP4, MOV, AVI, WebM · Max 10 MB
                    </span>
                  </button>
                  <input
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/ogg,video/mpeg"
                    className="sr-only"
                    onChange={handleVideoSelected}
                    ref={videoInputRef}
                    type="file"
                  />
                  {selectedVideo ? (
                    <div className="mt-4 overflow-hidden rounded-[10px] bg-black">
                      <video
                        className="block max-h-60 w-full"
                        controls
                        src={selectedVideo.objectUrl}
                      >
                        <track kind="captions" />
                      </video>
                      <div className="bg-weldoo-ink px-3 py-2 text-xs text-weldoo-muted">
                        {selectedVideo.file.name} · {formatMegabytes(selectedVideo.file.size)}
                      </div>
                    </div>
                  ) : null}
                  <FormError className="mt-3">{state.status === "error" ? state.message : null}</FormError>
                </div>
                <footer className="flex shrink-0 justify-end gap-2 px-6 pb-5">
                  <button
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-weldoo-border-light px-4 text-[13.2px] font-semibold text-weldoo-ink transition hover:bg-weldoo-bg"
                    disabled={pending}
                    onClick={closeComposer}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-weldoo-indigo px-5 text-[13.2px] font-semibold text-white shadow-weldoo-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!selectedVideo}
                    onClick={() => setVideoStep("compose")}
                    type="button"
                  >
                    Next
                  </button>
                </footer>
              </>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                  {mode === "photo" || mode === "video" ? (
                    <div className="mb-3 flex items-center gap-2.5">
                      <ComposerAvatar avatarUrl={avatarUrl} initial={initial} />
                      <div>
                        <div className="text-sm font-semibold text-weldoo-ink">{displayName}</div>
                        <div className="text-xs text-weldoo-muted">Sharing with: Everyone</div>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex gap-3">
                    {mode === "text" ? (
                      <ComposerAvatar avatarUrl={avatarUrl} initial={initial} />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <textarea
                        aria-label="Post text"
                        className={`w-full resize-none border-0 bg-transparent p-0 text-[14.3px] leading-[1.6] text-weldoo-ink outline-none placeholder:text-weldoo-muted ${
                          mode === "text" ? "min-h-[120px]" : "min-h-[100px]"
                        }`}
                        maxLength={POST_BODY_MAX_LENGTH}
                        name="body"
                        onChange={(event) => setBody(event.target.value)}
                        placeholder={
                          mode === "photo"
                            ? "What do you want to say about these photos?"
                            : mode === "video"
                              ? "What do you want to say about this video?"
                              : "What do you want to share with the community?"
                        }
                        ref={textareaRef}
                        value={body}
                      />
                      <FormError className="mt-2">{state.errors?.body}</FormError>
                    </div>
                  </div>
                  <input name="tags" type="hidden" value="" />
                  {mode === "photo" && selectedPhotoPreviews.length === 1 ? (
                    <div className="mt-3 overflow-hidden rounded-[10px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        className="max-h-80 w-full object-cover"
                        src={selectedPhotoPreviews[0]}
                      />
                    </div>
                  ) : null}
                  {mode === "photo" && selectedPhotoPreviews.length > 1 ? (
                    <div className="mt-3 overflow-hidden rounded-[10px] bg-[#0c0c18]">
                      <div className="relative overflow-hidden">
                        <div
                          className="flex transition-transform duration-300 ease-out"
                          style={{ transform: `translateX(-${photoPreviewIndex * 100}%)` }}
                        >
                          {selectedPhotoPreviews.map((previewUrl) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt=""
                              className="max-h-80 min-w-full flex-shrink-0 object-cover"
                              key={previewUrl}
                              src={previewUrl}
                            />
                          ))}
                        </div>
                        <button
                          aria-label="Previous image"
                          className="absolute left-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-black/55 text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-30"
                          disabled={photoPreviewIndex === 0}
                          onClick={() => setPhotoPreviewIndex((index) => Math.max(0, index - 1))}
                          type="button"
                        >
                          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                          </svg>
                        </button>
                        <button
                          aria-label="Next image"
                          className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-black/55 text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-30"
                          disabled={photoPreviewIndex === selectedPhotoPreviews.length - 1}
                          onClick={() =>
                            setPhotoPreviewIndex((index) =>
                              Math.min(selectedPhotoPreviews.length - 1, index + 1),
                            )
                          }
                          type="button"
                        >
                          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex justify-center gap-[5px] bg-black py-1.5">
                        {selectedPhotoPreviews.map((previewUrl, index) => (
                          <button
                            aria-label={`Show image ${index + 1}`}
                            className={`h-1.5 w-1.5 cursor-pointer rounded-full border-0 p-0 transition ${
                              photoPreviewIndex === index ? "bg-white" : "bg-white/40"
                            }`}
                            key={previewUrl}
                            onClick={() => setPhotoPreviewIndex(index)}
                            type="button"
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {mode === "video" && selectedVideo ? (
                    <div className="mt-3 overflow-hidden rounded-[10px] bg-black">
                      <video
                        className="block max-h-[220px] w-full"
                        controls
                        src={selectedVideo.objectUrl}
                      >
                        <track kind="captions" />
                      </video>
                    </div>
                  ) : null}
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
              </>
            )}
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
            className="h-10 min-w-0 flex-1 cursor-pointer rounded-full border-[1.5px] border-weldoo-border-light bg-weldoo-bg-strong px-[18px] text-left text-sm leading-5 tracking-[-0.01em] text-weldoo-muted transition hover:border-[#c8c8e0] hover:bg-weldoo-bg"
            onClick={() => openComposer("text")}
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
          <ComposerActionButton icon={<PhotoIcon />} onClick={() => openComposer("photo")}>
            Photo
          </ComposerActionButton>
          <ComposerActionButton icon={<VideoIcon />} onClick={() => openComposer("video")}>
            Video
          </ComposerActionButton>
        </div>
      </section>
      {modal}
    </>
  );
}
