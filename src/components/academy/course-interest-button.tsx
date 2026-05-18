"use client";

import { useState } from "react";

type CourseInterestButtonProps = {
  courseEventId: string;
  initialInterested: boolean;
  signedIn: boolean;
};

export function CourseInterestButton({
  courseEventId,
  initialInterested,
  signedIn,
}: CourseInterestButtonProps) {
  const [interested, setInterested] = useState(initialInterested);
  const [pending, setPending] = useState(false);

  async function registerInterest() {
    if (!signedIn || interested || pending) return;

    setPending(true);

    try {
      const response = await fetch(`/api/academy/${courseEventId}/interest`, {
        method: "POST",
      });

      if (response.ok) {
        setInterested(true);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      className={[
        "inline-flex h-12 w-full items-center justify-center gap-[9px] rounded-[12px] px-5 text-[15.4px] font-bold leading-none tracking-[-0.01em] shadow-[0_2px_8px_rgba(61,61,180,0.25)] transition",
        interested
          ? "border-[1.5px] border-weldoo-indigo bg-weldoo-indigo/10 text-weldoo-indigo"
          : "bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-white hover:brightness-105 hover:shadow-[0_4px_16px_rgba(61,61,180,0.32)]",
        !signedIn || pending ? "opacity-60" : "",
      ].join(" ")}
      disabled={!signedIn || interested || pending}
      onClick={registerInterest}
      type="button"
    >
      <svg aria-hidden="true" className="h-[17px] w-[17px]" fill="none" viewBox="0 0 24 24">
        {interested ? (
          <path d="m20 6-11 11-5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        ) : (
          <>
            <path d="M22 2 11 13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="m22 2-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </>
        )}
      </svg>
      {interested ? "Registered" : "Register now"}
    </button>
  );
}
