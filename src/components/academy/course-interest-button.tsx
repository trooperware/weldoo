"use client";

import { useState, type FormEvent } from "react";

import { Button, Modal, Textarea } from "@/components/ui";

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
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function registerInterest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signedIn || interested || pending) return;

    setPending(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const note = String(formData.get("note") ?? "");
      const response = await fetch(`/api/academy/${courseEventId}/interest`, {
        body: JSON.stringify({ note }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (response.ok) {
        setInterested(true);
        setOpen(false);
        return;
      }

      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      setError(payload.message ?? "Could not register interest.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        className={[
          "inline-flex h-12 w-full items-center justify-center gap-[9px] rounded-[12px] px-5 text-[15.4px] font-bold leading-none tracking-[-0.01em] shadow-[0_2px_8px_rgba(61,61,180,0.25)] transition",
          interested
            ? "border-[1.5px] border-weldoo-indigo bg-weldoo-indigo/10 text-weldoo-indigo"
            : "bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-white hover:brightness-105 hover:shadow-[0_4px_16px_rgba(61,61,180,0.32)]",
          !signedIn || pending ? "opacity-60" : "",
        ].join(" ")}
        disabled={!signedIn || interested || pending}
        onClick={() => setOpen(true)}
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

      <Modal
        description="Send a short note to the training provider. This is not real-time chat; they will see it in their interested users list."
        footer={
          <>
            <Button disabled={pending} onClick={() => setOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button disabled={pending} form={`course-interest-${courseEventId}`} type="submit">
              Register interest
            </Button>
          </>
        }
        onOpenChange={setOpen}
        open={open}
        title="Register interest"
      >
        <form id={`course-interest-${courseEventId}`} onSubmit={registerInterest}>
          {error ? (
            <div className="mb-3 rounded-weldoo-sm border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}
          <Textarea
            id={`course-interest-note-${courseEventId}`}
            label="Message"
            maxLength={1000}
            name="note"
            placeholder="Introduce yourself and explain why you are interested."
            rows={5}
          />
        </form>
      </Modal>
    </>
  );
}
