"use client";

import { useActionState } from "react";

import { FormError, Input } from "@/components/ui";
import { resetPasswordAction, type AuthActionState } from "@/server/actions/auth";
import { SubmitButton } from "./submit-button";

const initialState: AuthActionState = {};

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.status === "error" ? state.message : null}</FormError>
      <Input
        autoComplete="new-password"
        error={state.errors?.password}
        id="password"
        label="New password"
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
        placeholder="Repeat your new password"
        type="password"
      />
      <SubmitButton pendingLabel="Updating password">Update password</SubmitButton>
    </form>
  );
}
