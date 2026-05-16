"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormError, Input } from "@/components/ui";
import { signInAction, type AuthActionState } from "@/server/actions/auth";
import { SubmitButton } from "./submit-button";

type SignInFormProps = {
  redirectTo?: string;
};

const initialState: AuthActionState = {};

export function SignInForm({ redirectTo }: SignInFormProps) {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input name="redirectTo" type="hidden" value={redirectTo ?? ""} />
      <FormError>{state.status === "error" ? state.message : null}</FormError>
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
        autoComplete="current-password"
        error={state.errors?.password}
        id="password"
        label="Password"
        name="password"
        placeholder="Enter your password"
        type="password"
      />
      <div className="text-right">
        <Link
          className="text-sm font-semibold text-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo-dark)]"
          href="/auth/forgot-password"
        >
          Forgot password?
        </Link>
      </div>
      <SubmitButton pendingLabel="Signing in">Sign in</SubmitButton>
    </form>
  );
}
