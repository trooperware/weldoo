"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui";
import { FormError, Input } from "@/components/ui";
import type { OnboardingFieldErrors } from "@/lib/validators/onboarding";
import type { Enums } from "@/types/database";

type SelectableProfileType = Exclude<Enums<"profile_type">, "admin">;

type OnboardingFormProps = {
  defaultDisplayName?: string;
  defaultProfileType?: SelectableProfileType;
};

const profileTypeOptions: Array<{
  description: string;
  label: string;
  value: SelectableProfileType;
}> = [
  {
    description: "I weld, fabricate, inspect, or work hands-on in the trade.",
    label: "Professional / Welder",
    value: "professional",
  },
  {
    description: "I hire welders, publish jobs, or represent an industrial company.",
    label: "Company",
    value: "company",
  },
  {
    description: "I publish courses, webinars, workshops, or sector events.",
    label: "Training provider",
    value: "training_provider",
  },
];

type OnboardingClientState = {
  errors?: OnboardingFieldErrors;
  message?: string;
  status?: "error" | "success";
};

export function OnboardingForm({
  defaultDisplayName = "",
  defaultProfileType = "professional",
}: OnboardingFormProps) {
  const [state, setState] = useState<OnboardingClientState>({});
  const [pending, setPending] = useState(false);
  const [selectedType, setSelectedType] = useState<SelectableProfileType>(defaultProfileType);

  const needsOrganization =
    selectedType === "company" || selectedType === "training_provider";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState({});

    try {
      const response = await fetch("/api/onboarding/complete", {
        body: new FormData(event.currentTarget),
        method: "POST",
      });
      const payload = (await response.json()) as OnboardingClientState & {
        redirectTo?: string;
      };

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      window.location.assign(payload.redirectTo ?? "/dashboard");
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not complete onboarding.",
        status: "error",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <FormError>{state.status === "error" ? state.message : null}</FormError>

      <fieldset className="space-y-3">
        <legend className="text-sm font-bold text-[var(--weldoo-ink)]">
          Choose your Weldoo profile type
        </legend>
        <div className="grid gap-3">
          {profileTypeOptions.map((option) => (
            <label
              className="flex cursor-pointer gap-3 rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border)] bg-white p-4 transition hover:border-[var(--weldoo-indigo)] has-[:checked]:border-[var(--weldoo-indigo)] has-[:checked]:bg-[var(--weldoo-bg)]"
              key={option.value}
            >
              <input
                checked={selectedType === option.value}
                className="mt-1 h-4 w-4 accent-[var(--weldoo-indigo)]"
                name="profileType"
                onChange={() => setSelectedType(option.value)}
                type="radio"
                value={option.value}
              />
              <span>
                <span className="block text-sm font-bold text-[var(--weldoo-ink)]">
                  {option.label}
                </span>
                <span className="mt-1 block text-sm leading-6 text-[var(--weldoo-muted)]">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
        {state.errors?.profileType ? (
          <p className="text-xs font-medium text-red-600">{state.errors.profileType}</p>
        ) : null}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          error={state.errors?.displayName}
          id="displayName"
          label={needsOrganization ? "Your name" : "Display name"}
          name="displayName"
          placeholder={needsOrganization ? "Jane Smith" : "Jane Smith · TIG Welder"}
          type="text"
          defaultValue={defaultDisplayName}
        />
        <Input
          error={state.errors?.location}
          id="location"
          label="Location"
          name="location"
          placeholder="Barcelona, Spain"
          type="text"
        />
      </div>

      {needsOrganization ? (
        <Input
          error={state.errors?.organizationName}
          id="organizationName"
          label={selectedType === "company" ? "Company name" : "Training provider name"}
          name="organizationName"
          placeholder={selectedType === "company" ? "Acme Fabrication" : "Welding Academy"}
          type="text"
        />
      ) : null}

      <div className="sm:max-w-40">
        <Button className="w-full" disabled={pending} type="submit">
          {pending ? "Saving" : "Continue"}
        </Button>
      </div>
    </form>
  );
}
