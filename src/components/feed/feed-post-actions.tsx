"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormError } from "@/components/ui";

type FeedPostActionsProps = {
  initialIsLiked: boolean;
  initialIsSaved: boolean;
  initialLikeCount: number;
  postId: string;
};

type ActionState = {
  message?: string;
  status?: "error" | "success";
};

export function FeedPostActions({
  initialIsLiked,
  initialIsSaved,
  initialLikeCount,
  postId,
}: FeedPostActionsProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [pendingAction, setPendingAction] = useState<"like" | "save" | null>(null);
  const [state, setState] = useState<ActionState>({});

  async function submitInteraction(kind: "like" | "save", nextActive: boolean) {
    setPendingAction(kind);
    setState({});

    const previousLiked = isLiked;
    const previousSaved = isSaved;
    const previousLikeCount = likeCount;

    if (kind === "like") {
      setIsLiked(nextActive);
      setLikeCount((current) => current + (nextActive ? 1 : -1));
    } else {
      setIsSaved(nextActive);
    }

    try {
      const response = await fetch(`/api/feed/posts/${postId}/${kind}`, {
        method: nextActive ? "POST" : "DELETE",
      });
      const payload = (await response.json()) as ActionState;

      if (!response.ok || payload.status === "error") {
        setIsLiked(previousLiked);
        setIsSaved(previousSaved);
        setLikeCount(previousLikeCount);
        setState({
          message: payload.message ?? "Could not update post interaction.",
          status: "error",
        });
        return;
      }

      router.refresh();
    } catch (error) {
      setIsLiked(previousLiked);
      setIsSaved(previousSaved);
      setLikeCount(previousLikeCount);
      setState({
        message:
          error instanceof Error ? error.message : "Could not update post interaction.",
        status: "error",
      });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="w-full">
      <FormError>{state.status === "error" ? state.message : null}</FormError>
      <div className="grid grid-cols-4">
        <button
          className={`inline-flex items-center justify-center gap-1.5 rounded-[10px] px-1.5 py-[9px] text-[13px] font-medium transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo ${
            isLiked ? "text-weldoo-indigo" : "text-weldoo-ink"
          }`}
          disabled={pendingAction !== null}
          onClick={() => submitInteraction("like", !isLiked)}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-[18px] w-[18px]"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 10V21M7 10L11 3C12.1 3 13 3.9 13 5V8H18.2C19.5 8 20.4 9.2 20.1 10.5L18.7 18.5C18.5 19.9 17.3 21 15.9 21H7M7 10H4V21H7"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
          <span>Like</span>
        </button>
        <button
          className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-1.5 py-[9px] text-[13px] font-medium text-weldoo-ink transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-[18px] w-[18px]"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 15C21 16.1 20.1 17 19 17H7L3 21V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V15Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
          <span>Comment</span>
        </button>
        <button
          className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-1.5 py-[9px] text-[13px] font-medium text-weldoo-ink transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-[18px] w-[18px]"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 5A3 3 0 1 0 18 11A3 3 0 0 0 18 5ZM6 9A3 3 0 1 0 6 15A3 3 0 0 0 6 9ZM18 13A3 3 0 1 0 18 19A3 3 0 0 0 18 13ZM8.6 13.5L15.4 16.5M15.4 7.5L8.6 10.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
          <span>Share</span>
        </button>
        <button
          className={`inline-flex items-center justify-center gap-1.5 rounded-[10px] px-1.5 py-[9px] text-[13px] font-medium transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo ${
            isSaved ? "text-weldoo-indigo" : "text-weldoo-ink"
          }`}
          disabled={pendingAction !== null}
          onClick={() => submitInteraction("save", !isSaved)}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-[18px] w-[18px]"
            fill={isSaved ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 4.5C6 3.67 6.67 3 7.5 3H16.5C17.33 3 18 3.67 18 4.5V21L12 17.5L6 21V4.5Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>
      </div>
    </div>
  );
}
