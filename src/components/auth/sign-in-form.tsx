"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { AuthDivider, AuthSocialButtons } from "@/components/auth/auth-card";
import { FormError, Input } from "@/components/ui";
import { signInAction, type AuthActionState } from "@/server/actions/auth";
import { SubmitButton } from "./submit-button";

type SignInFormProps = {
  redirectTo?: string;
};

const initialState: AuthActionState = {};

export function SignInForm({ redirectTo }: SignInFormProps) {
  const [state, formAction] = useActionState(signInAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <AuthSocialButtons />
      <AuthDivider />

      <div className="mb-5 rounded-weldoo-sm border border-weldoo-indigo/20 bg-weldoo-indigo/5 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-bold text-weldoo-indigo">
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8H12.01M11 11H12V16H13M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          Demo access
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-weldoo-slate">
          <span>Email:</span>
          <code className="whitespace-nowrap rounded bg-white/80 px-1.5 py-0.5 font-mono">
            demo@weldoo.net
          </code>
          <span>Password:</span>
          <code className="whitespace-nowrap rounded bg-white/80 px-1.5 py-0.5 font-mono">
            Weldoo2026
          </code>
        </div>
      </div>

      <form action={formAction} className="space-y-3.5">
        <input name="redirectTo" type="hidden" value={redirectTo ?? ""} />
        <FormError>{state.status === "error" ? state.message : null}</FormError>
        <Input
          autoComplete="email"
          error={state.errors?.email}
          id="email"
          label="Email address"
          name="email"
          placeholder="you@example.com"
          type="email"
        />
        <label className="block space-y-1.5" htmlFor="password">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold">Password</span>
            <Link
              className="text-sm font-semibold text-weldoo-indigo hover:text-weldoo-indigo-dark"
              href="/auth/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              aria-invalid={Boolean(state.errors?.password)}
              autoComplete="current-password"
              className="h-11 w-full rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-4 pr-20 text-sm outline-none transition placeholder:text-weldoo-muted/60 focus:border-weldoo-indigo focus:bg-white focus:ring-4 focus:ring-weldoo-indigo/10"
              id="password"
              name="password"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
            />
            <button
              className="absolute inset-y-0 right-0 rounded-r-weldoo-sm px-4 text-sm font-semibold text-weldoo-muted outline-none hover:text-weldoo-indigo focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-weldoo-indigo/30"
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
        <SubmitButton pendingLabel="Signing in">Sign in</SubmitButton>
      </form>
    </div>
  );
}
