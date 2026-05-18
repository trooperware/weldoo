"use client";

import { useState } from "react";

type JobSaveButtonProps = {
  initialSaved: boolean;
  jobId: string;
  signedIn: boolean;
};

export function JobSaveButton({ initialSaved, jobId, signedIn }: JobSaveButtonProps) {
  const [state, setState] = useState({
    isSaved: initialSaved,
    jobId,
    pending: false,
  });
  const isCurrentJob = state.jobId === jobId;
  const isSaved = isCurrentJob ? state.isSaved : initialSaved;
  const pending = isCurrentJob ? state.pending : false;

  async function toggleSave() {
    if (!signedIn || pending) return;

    const nextSaved = !isSaved;
    const previousSaved = isSaved;
    setState({ isSaved: nextSaved, jobId, pending: true });

    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: nextSaved ? "POST" : "DELETE",
      });

      if (!response.ok) {
        setState({ isSaved: previousSaved, jobId, pending: false });
        return;
      }
    } catch {
      setState({ isSaved: previousSaved, jobId, pending: false });
      return;
    } finally {
      setState((current) =>
        current.jobId === jobId ? { ...current, pending: false } : current,
      );
    }
  }

  return (
    <button
      className={[
        "inline-flex h-9 items-center justify-center rounded-full border-[1.5px] px-5 font-semibold tracking-[-0.01em] transition",
        isSaved
          ? "border-weldoo-indigo bg-weldoo-indigo/10 text-weldoo-indigo"
          : "border-weldoo-indigo text-weldoo-indigo",
        !signedIn || pending ? "opacity-60" : "hover:bg-weldoo-indigo/5",
      ].join(" ")}
      disabled={!signedIn || pending}
      onClick={toggleSave}
      style={{ fontSize: "12px", lineHeight: 1 }}
      type="button"
    >
      {isSaved ? "Saved" : "Save"}
    </button>
  );
}
