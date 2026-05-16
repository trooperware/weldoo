"use client";

import { useActionState } from "react";

import { FormError, Input } from "@/components/ui";
import { signUpAction, type AuthActionState } from "@/server/actions/auth";
import { SubmitButton } from "./submit-button";

const initialState: AuthActionState = {};

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
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
        label="Email"
        name="email"
        placeholder="you@example.com"
        type="email"
      />
      <Input
        autoComplete="new-password"
        error={state.errors?.password}
        id="password"
        label="Password"
        name="password"
        placeholder="At least 8 characters"
        type="password"
      />
      <Input
        autoComplete="new-password"
        error={state.errors?.confirmPassword}
        id="confirmPassword"
        label="Confirm password"
        name="confirmPassword"
        placeholder="Repeat your password"
        type="password"
      />
      <SubmitButton pendingLabel="Creating account">Create account</SubmitButton>
    </form>
  );
}
