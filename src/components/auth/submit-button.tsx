"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: string;
  pendingLabel?: string;
};

export function SubmitButton({ children, pendingLabel = "Working" }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[11px] bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] px-4 text-[15.4px] font-bold tracking-[-0.01em] text-white shadow-[0_2px_8px_rgba(61,61,180,0.2),0_6px_20px_rgba(61,61,180,0.18)] transition hover:brightness-105 hover:shadow-[0_4px_14px_rgba(61,61,180,0.28),0_10px_28px_rgba(61,61,180,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : children}
      {!pending ? (
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 12H19M13 6L19 12L13 18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
        </svg>
      ) : null}
    </button>
  );
}
