"use client";

import { useActionState, useState } from "react";

import { AuthDivider, AuthSocialButtons } from "@/components/auth/auth-card";
import { FormError, Input } from "@/components/ui";
import { signUpAction, type AuthActionState } from "@/server/actions/auth";
import { SubmitButton } from "./submit-button";

const initialState: AuthActionState = {};

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div>
      <AuthSocialButtons />
      <AuthDivider />

      <form action={formAction} className="space-y-4">
        <FormError>{state.status === "error" ? state.message : null}</FormError>
        {state.status === "success" && state.message ? (
          <div
            className="rounded-weldoo-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
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
        />
        <label className="block space-y-2" htmlFor="password">
          <span className="text-sm font-semibold">Password</span>
          <div className="relative">
            <input
              aria-invalid={Boolean(state.errors?.password)}
              autoComplete="new-password"
              className="h-12 w-full rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-4 pr-20 text-sm outline-none transition placeholder:text-weldoo-muted/60 focus:border-weldoo-indigo focus:bg-white focus:ring-4 focus:ring-weldoo-indigo/10"
              id="password"
              name="password"
              placeholder="At least 8 characters"
              type={showPassword ? "text" : "password"}
            />
            <button
              className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-weldoo-muted hover:text-weldoo-indigo"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {state.errors?.password ? (
            <p className="text-xs font-medium text-red-600">{state.errors.password}</p>
          ) : null}
        </label>
        <label className="block space-y-2" htmlFor="confirmPassword">
          <span className="text-sm font-semibold">Confirm password</span>
          <div className="relative">
            <input
              aria-invalid={Boolean(state.errors?.confirmPassword)}
              autoComplete="new-password"
              className="h-12 w-full rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-4 pr-20 text-sm outline-none transition placeholder:text-weldoo-muted/60 focus:border-weldoo-indigo focus:bg-white focus:ring-4 focus:ring-weldoo-indigo/10"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Repeat your password"
              type={showConfirmPassword ? "text" : "password"}
            />
            <button
              className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-weldoo-muted hover:text-weldoo-indigo"
              onClick={() => setShowConfirmPassword((current) => !current)}
              type="button"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
          {state.errors?.confirmPassword ? (
            <p className="text-xs font-medium text-red-600">
              {state.errors.confirmPassword}
            </p>
          ) : null}
        </label>
        <SubmitButton pendingLabel="Creating account">{"Create account ->"}</SubmitButton>
      </form>
    </div>
  );
}
