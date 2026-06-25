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

type InteractionKind = "like" | "save";

const actionButtonClass =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[10px] px-1.5 py-[9px] text-[13px] font-medium transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo active:scale-[0.97] disabled:cursor-wait disabled:opacity-70";

function emitLikeCountChange(postId: string, likeCount: number) {
  window.dispatchEvent(
    new CustomEvent("weldoo:post-like-count", {
      detail: {
        likeCount,
        postId,
      },
    }),
  );
}

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
  const [pendingActions, setPendingActions] = useState<Record<InteractionKind, boolean>>({
    like: false,
    save: false,
  });
  const [state, setState] = useState<ActionState>({});

  async function submitInteraction(kind: InteractionKind, nextActive: boolean) {
    if (pendingActions[kind]) return;

    setPendingActions((current) => ({ ...current, [kind]: true }));
    setState({});

    const previousLiked = isLiked;
    const previousSaved = isSaved;
    const previousLikeCount = likeCount;

    if (kind === "like") {
      const nextLikeCount = Math.max(0, previousLikeCount + (nextActive ? 1 : -1));

      setIsLiked(nextActive);
      setLikeCount(nextLikeCount);
      emitLikeCountChange(postId, nextLikeCount);
    } else {
      setIsSaved(nextActive);
    }

    try {
      const response = await fetch(`/api/feed/posts/${postId}/${kind}`, {
        method: nextActive ? "POST" : "DELETE",
      });
      const payload = (await response.json()) as ActionState;

      if (!response.ok || payload.status === "error") {
        if (kind === "like") {
          setIsLiked(previousLiked);
          setLikeCount(previousLikeCount);
          emitLikeCountChange(postId, previousLikeCount);
        } else {
          setIsSaved(previousSaved);
        }
        setState({
          message: payload.message ?? "Could not update post interaction.",
          status: "error",
        });
        return;
      }

      router.refresh();
    } catch (error) {
      if (kind === "like") {
        setIsLiked(previousLiked);
        setLikeCount(previousLikeCount);
        emitLikeCountChange(postId, previousLikeCount);
      } else {
        setIsSaved(previousSaved);
      }
      setState({
        message:
          error instanceof Error ? error.message : "Could not update post interaction.",
        status: "error",
      });
    } finally {
      setPendingActions((current) => ({ ...current, [kind]: false }));
    }
  }

  function focusCommentInput() {
    window.dispatchEvent(
      new CustomEvent("weldoo:toggle-comments", {
        detail: {
          focus: true,
          open: true,
          postId,
        },
      }),
    );
  }

  return (
    <div className="w-full">
      <FormError>{state.status === "error" ? state.message : null}</FormError>
      <div className="grid grid-cols-3">
        <button
          aria-busy={pendingActions.like}
          aria-pressed={isLiked}
          className={`${actionButtonClass} ${
            isLiked ? "text-weldoo-indigo" : "text-weldoo-ink"
          }`}
          disabled={pendingActions.like}
          onClick={() => submitInteraction("like", !isLiked)}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-[18px] w-[18px]"
            fill={isLiked ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
            <path
              d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
          <span>Like</span>
        </button>
        <button
          className={`${actionButtonClass} text-weldoo-ink`}
          onClick={focusCommentInput}
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
          aria-busy={pendingActions.save}
          aria-pressed={isSaved}
          className={`${actionButtonClass} ${
            isSaved ? "text-weldoo-indigo" : "text-weldoo-ink"
          }`}
          disabled={pendingActions.save}
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
