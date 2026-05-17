"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui";

type SubmitButtonProps = {
  children: string;
  pendingLabel?: string;
};

export function SubmitButton({ children, pendingLabel = "Working" }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      className="h-14 w-full text-base shadow-[0_12px_24px_rgba(61,61,180,0.28)]"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
