"use client";

import { useState } from "react";

type CourseSaveButtonProps = {
  courseEventId: string;
  initialSaved: boolean;
  itemLabel?: string;
  signedIn: boolean;
};

export function CourseSaveButton({
  courseEventId,
  initialSaved,
  itemLabel = "course",
  signedIn,
}: CourseSaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  async function saveCourseEvent() {
    if (!signedIn || saved || pending) return;

    setPending(true);

    try {
      const response = await fetch(`/api/academy/${courseEventId}/save`, {
        method: "POST",
      });

      if (response.ok) {
        setSaved(true);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      className={[
        "inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[12px] border-[1.5px] px-5 text-[14.3px] font-semibold leading-none tracking-[-0.01em] transition",
        saved
          ? "border-weldoo-indigo bg-weldoo-indigo/10 text-weldoo-indigo"
          : "border-weldoo-indigo bg-transparent text-weldoo-indigo hover:bg-weldoo-indigo/[0.05]",
        !signedIn || pending ? "opacity-60" : "",
      ].join(" ")}
      disabled={!signedIn || saved || pending}
      onClick={saveCourseEvent}
      type="button"
    >
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path d="M19 21 12 17l-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
      {saved ? "Saved" : `Save ${itemLabel}`}
    </button>
  );
}
