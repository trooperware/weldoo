"use client";

import { useActionState, useState } from "react";

import { AuthDivider, AuthSocialButtons } from "@/components/auth/auth-card";
import { FormError, Input } from "@/components/ui";
import { signUpAction, type AuthActionState } from "@/server/actions/auth";
import { SubmitButton } from "./submit-button";

const initialState: AuthActionState = {};

const purposeOptions = [
  "Networking",
  "Find a job",
  "Hire talent",
  "Learn & grow",
  "Events",
  "Mentorship",
];

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>(["Networking"]);

  function togglePurpose(purpose: string) {
    setSelectedPurposes((current) => {
      if (current.includes(purpose)) {
        return current.length === 1 ? current : current.filter((item) => item !== purpose);
      }

      return [...current, purpose];
    });
  }

  return (
    <div>
      <AuthSocialButtons />
      <AuthDivider />

      <form action={formAction}>
        <input name="confirmPassword" type="hidden" value={password} />
        <input name="purposes" type="hidden" value={selectedPurposes.join(",")} />
        <FormError>{state.status === "error" ? state.message : null}</FormError>
        {state.status === "success" && state.message ? (
          <div
            className="rounded-weldoo-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
            role="status"
          >
            {state.message}
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            autoComplete="given-name"
            error={state.errors?.firstName}
            id="firstName"
            label="First name"
            name="firstName"
            placeholder="Ana"
            type="text"
            className="h-[42px] rounded-[10px] border-[1.5px] px-3.5 text-[15.4px] tracking-[-0.01em]"
          />
          <Input
            autoComplete="family-name"
            error={state.errors?.lastName}
            id="lastName"
            label="Last name"
            name="lastName"
            placeholder="Lopez"
            type="text"
            className="h-[42px] rounded-[10px] border-[1.5px] px-3.5 text-[15.4px] tracking-[-0.01em]"
          />
        </div>
        <div className="mt-3.5">
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
        </div>
        <label className="mt-3.5 block" htmlFor="password">
          <span className="mb-[6px] block text-[13.8px] font-semibold leading-[1.15] text-weldoo-ink">
            Password
          </span>
          <div className="relative">
            <input
              aria-invalid={Boolean(state.errors?.password)}
              autoComplete="new-password"
              className="h-[42px] w-full rounded-[10px] border-[1.5px] border-weldoo-border-light bg-weldoo-bg px-3.5 pr-16 text-[15.4px] tracking-[-0.01em] text-weldoo-ink outline-none transition placeholder:text-[#c0c0d8] focus:border-weldoo-indigo focus:bg-white focus:ring-[3px] focus:ring-weldoo-indigo/10"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              type={showPassword ? "text" : "password"}
              value={password}
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
        <div className="mt-3.5">
          <div className="mb-2 text-[13.8px] font-semibold text-weldoo-ink">
            What brings you to Weldoo?
          </div>
          <div className="mb-[18px] flex flex-wrap gap-1.5">
            {purposeOptions.map((purpose) => {
              const isSelected = selectedPurposes.includes(purpose);

              return (
                <button
                  className={
                    isSelected
                      ? "inline-flex h-[30px] items-center gap-[5px] rounded-full border-[1.5px] border-weldoo-indigo bg-weldoo-indigo/[0.07] px-[13px] text-[13.2px] font-medium leading-none tracking-[-0.01em] text-weldoo-indigo"
                      : "inline-flex h-[30px] items-center gap-[5px] rounded-full border-[1.5px] border-weldoo-border-light bg-weldoo-bg px-[13px] text-[13.2px] font-medium leading-none tracking-[-0.01em] text-weldoo-ink transition hover:border-[#c8c8e4] hover:bg-white hover:text-weldoo-indigo"
                  }
                  key={purpose}
                  onClick={() => togglePurpose(purpose)}
                  type="button"
                >
                  <span
                    className={
                      isSelected
                        ? "h-[5px] w-[5px] shrink-0 rounded-full bg-current opacity-100"
                        : "h-[5px] w-[5px] shrink-0 rounded-full bg-current opacity-0"
                    }
                  />
                  {purpose}
                </button>
              );
            })}
          </div>
        </div>
        <SubmitButton pendingLabel="Creating account">Create account</SubmitButton>
      </form>
    </div>
  );
}
