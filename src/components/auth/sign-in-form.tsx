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

      <div className="mb-[18px] flex items-start gap-2.5 rounded-[8px] border border-weldoo-indigo/15 bg-weldoo-indigo/[0.06] px-3.5 py-[11px]">
        <svg
          aria-hidden="true"
          className="mt-px h-[15px] w-[15px] shrink-0 text-weldoo-indigo"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <line
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            x1="12"
            x2="12"
            y1="8"
            y2="12"
          />
          <line
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            x1="12"
            x2="12.01"
            y1="16"
            y2="16"
          />
        </svg>
        <div className="min-w-0 text-[13.8px] leading-[1.6] text-weldoo-ink">
          <strong className="mb-[3px] block font-bold text-weldoo-indigo">
            Demo access
          </strong>
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[12.8px] leading-[1.45]">
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              Email:
              <code className="rounded bg-weldoo-indigo/[0.08] px-1 py-px font-mono text-[12px]">
                demo@weldoo.net
              </code>
            </span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              Password:
              <code className="rounded bg-weldoo-indigo/[0.08] px-1 py-px font-mono text-[12px]">
                Weldoo2026
              </code>
            </span>
          </div>
        </div>
      </div>

      <form action={formAction}>
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
          className="h-[42px] rounded-[10px] border-[1.5px] px-3.5 text-[15.4px] tracking-[-0.01em]"
        />
        <label className="mt-3.5 block" htmlFor="password">
          <div className="mb-[5px] flex items-center justify-between gap-4 leading-[1.15]">
            <span className="text-[13.8px] font-semibold text-weldoo-ink">Password</span>
            <Link
              className="text-[13.2px] font-medium text-weldoo-indigo hover:underline"
              href="/auth/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              aria-invalid={Boolean(state.errors?.password)}
              autoComplete="current-password"
              className="h-[42px] w-full rounded-[10px] border-[1.5px] border-weldoo-border-light bg-weldoo-bg px-3.5 pr-16 text-[15.4px] tracking-[-0.01em] text-weldoo-ink outline-none transition placeholder:text-[#c0c0d8] focus:border-weldoo-indigo focus:bg-white focus:ring-[3px] focus:ring-weldoo-indigo/10"
              id="password"
              name="password"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
            />
            <button
              className="absolute inset-y-0 right-3 px-0 text-[13.2px] font-semibold text-weldoo-muted outline-none hover:text-weldoo-indigo focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-weldoo-indigo/30"
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
