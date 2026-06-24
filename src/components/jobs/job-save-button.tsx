"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

type JobSaveButtonProps = {
  initialSaved: boolean;
  jobId: string;
  signedIn: boolean;
};

export function JobSaveButton({ initialSaved, jobId, signedIn }: JobSaveButtonProps) {
  const router = useRouter();
  const [state, setState] = useState({
    error: "",
    isSaved: initialSaved,
    jobId,
    pending: false,
  });
  const isCurrentJob = state.jobId === jobId;
  const error = isCurrentJob ? state.error : "";
  const isSaved = isCurrentJob ? state.isSaved : initialSaved;
  const pending = isCurrentJob ? state.pending : false;

  async function toggleSave() {
    if (!signedIn || pending) return;

    const nextSaved = !isSaved;
    const previousSaved = isSaved;
    setState({ error: "", isSaved: nextSaved, jobId, pending: true });

    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: nextSaved ? "POST" : "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setState({
          error: payload?.message ?? "Could not update saved state.",
          isSaved: previousSaved,
          jobId,
          pending: false,
        });
        return;
      }

      router.refresh();
    } catch {
      setState({
        error: "Could not update saved state.",
        isSaved: previousSaved,
        jobId,
        pending: false,
      });
      return;
    } finally {
      setState((current) =>
        current.jobId === jobId ? { ...current, pending: false } : current,
      );
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        aria-busy={pending}
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-full border-[1.5px] px-5 text-[12px] font-semibold leading-none tracking-[-0.01em] text-weldoo-indigo transition",
          isSaved ? "border-weldoo-indigo bg-weldoo-indigo/10" : "border-weldoo-indigo",
          !signedIn || pending ? "opacity-60" : "hover:bg-weldoo-indigo/5",
        )}
        disabled={!signedIn || pending}
        onClick={toggleSave}
        type="button"
      >
        {isSaved ? "Saved" : "Save"}
      </button>
      {error ? (
        <span className="max-w-40 text-[11px] font-medium leading-snug text-red-600">
          {error}
        </span>
      ) : null}
    </span>
  );
}
