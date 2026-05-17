"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, FormError } from "@/components/ui";

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
    <div>
      <FormError>{state.status === "error" ? state.message : null}</FormError>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={pendingAction !== null}
          onClick={() => submitInteraction("like", !isLiked)}
          size="sm"
          variant={isLiked ? "secondary" : "ghost"}
        >
          {isLiked ? `Liked (${likeCount})` : `Like (${likeCount})`}
        </Button>
        <Button
          disabled={pendingAction !== null}
          onClick={() => submitInteraction("save", !isSaved)}
          size="sm"
          variant={isSaved ? "secondary" : "ghost"}
        >
          {isSaved ? "Saved" : "Save"}
        </Button>
      </div>
    </div>
  );
}
