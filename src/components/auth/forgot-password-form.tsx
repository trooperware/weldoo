"use client";

import { useActionState } from "react";

import { FormError, Input } from "@/components/ui";
import { forgotPasswordAction, type AuthActionState } from "@/server/actions/auth";
import { SubmitButton } from "./submit-button";

const initialState: AuthActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, initialState);

  return (
    <form action={formAction}>
      <FormError>{state.status === "error" ? state.message : null}</FormError>
      {state.status === "success" && state.message ? (
        <div
          className="rounded-[var(--weldoo-radius-sm)] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
          role="status"
        >
          {state.message}
        </div>
      ) : null}
      <Input
        autoComplete="email"
        error={state.errors?.email}
        id="email"
        label="Email address"
        name="email"
        placeholder="you@example.com"
        type="email"
        className="h-[42px] rounded-[10px] border-[1.5px] px-3.5 text-[15.4px] tracking-[-0.01em]"
      />
      <SubmitButton pendingLabel="Sending link">Send reset link</SubmitButton>
    </form>
  );
}
