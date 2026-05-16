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
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? pendingLabel : children}
    </Button>
  );
}
