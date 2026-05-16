"use client";

import { useState, type FormEvent } from "react";

import { Button, FormError, Input, Select, Textarea } from "@/components/ui";
import type { ProfessionalProfileFieldErrors } from "@/lib/validators/professional-profile";

type ProfessionalProfileFormValues = {
  avatarUrl?: string | null;
  availability?: string | null;
  bio?: string | null;
  certifications?: string[] | null;
  coverUrl?: string | null;
  displayName: string;
  headline?: string | null;
  location?: string | null;
  materials?: string[] | null;
  positions?: string[] | null;
  travelAvailability?: boolean | null;
  websiteUrl?: string | null;
  weldingProcesses?: string[] | null;
  workPreferences?: string[] | null;
  yearsExperience?: number | null;
};

type ProfessionalProfileFormProps = {
  defaultValues: ProfessionalProfileFormValues;
};

type SaveState = {
  errors?: ProfessionalProfileFieldErrors;
  message?: string;
  status?: "error" | "success";
};

function listToText(value?: string[] | null) {
  return value?.join(", ") ?? "";
}

export function ProfessionalProfileForm({ defaultValues }: ProfessionalProfileFormProps) {
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SaveState>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState({});

    try {
      const response = await fetch("/api/profile/professional", {
        body: new FormData(event.currentTarget),
        method: "POST",
      });
      const payload = (await response.json()) as SaveState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      setState({
        message: payload.message ?? "Profile saved.",
        status: "success",
      });
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not save profile.",
        status: "error",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <FormError>{state.status === "error" ? state.message : null}</FormError>
      {state.status === "success" && state.message ? (
        <div
          className="rounded-[var(--weldoo-radius-sm)] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
          role="status"
        >
          {state.message}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <Input
          defaultValue={defaultValues.displayName}
          error={state.errors?.displayName}
          id="displayName"
          label="Display name"
          name="displayName"
          placeholder="Jane Smith"
        />
        <Input
          defaultValue={defaultValues.headline ?? ""}
          error={state.errors?.headline}
          id="headline"
          label="Professional headline"
          name="headline"
          placeholder="TIG Welder · Stainless steel · Pressure vessels"
        />
        <Input
          defaultValue={defaultValues.location ?? ""}
          error={state.errors?.location}
          id="location"
          label="Location"
          name="location"
          placeholder="Barcelona, Spain"
        />
        <Input
          defaultValue={defaultValues.yearsExperience ?? ""}
          error={state.errors?.yearsExperience}
          id="yearsExperience"
          label="Years of experience"
          min={0}
          name="yearsExperience"
          placeholder="8"
          type="number"
        />
        <Select
          defaultValue={defaultValues.availability ?? "open_to_opportunities"}
          error={state.errors?.availability}
          id="availability"
          label="Availability"
          name="availability"
        >
          <option value="available">Available</option>
          <option value="open_to_opportunities">Open to opportunities</option>
          <option value="not_available">Not available</option>
        </Select>
        <Input
          defaultValue={defaultValues.websiteUrl ?? ""}
          error={state.errors?.websiteUrl}
          id="websiteUrl"
          label="Website or portfolio URL"
          name="websiteUrl"
          placeholder="https://example.com"
          type="url"
        />
      </section>

      <Textarea
        defaultValue={defaultValues.bio ?? ""}
        error={state.errors?.bio}
        id="bio"
        label="Bio"
        name="bio"
        placeholder="Summarize your welding experience, sectors, materials, certifications, and work preferences."
      />

      <section className="grid gap-4 sm:grid-cols-2">
        <Input
          defaultValue={listToText(defaultValues.weldingProcesses)}
          error={state.errors?.weldingProcesses}
          id="weldingProcesses"
          label="Welding processes"
          name="weldingProcesses"
          placeholder="TIG, MIG/MAG, SMAW"
        />
        <Input
          defaultValue={listToText(defaultValues.materials)}
          error={state.errors?.materials}
          id="materials"
          label="Materials"
          name="materials"
          placeholder="Stainless steel, carbon steel, aluminium"
        />
        <Input
          defaultValue={listToText(defaultValues.positions)}
          error={state.errors?.positions}
          id="positions"
          label="Welding positions"
          name="positions"
          placeholder="1G, 2G, 5G, 6G"
        />
        <Input
          defaultValue={listToText(defaultValues.certifications)}
          error={state.errors?.certifications}
          id="certifications"
          label="Self-declared certifications"
          name="certifications"
          placeholder="EN ISO 9606-1, ASME IX"
        />
        <Input
          defaultValue={listToText(defaultValues.workPreferences)}
          error={state.errors?.workPreferences}
          id="workPreferences"
          label="Work preferences"
          name="workPreferences"
          placeholder="Workshop, field work, contract, full time"
        />
        <label className="flex min-h-11 items-center gap-3 rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border-light)] bg-[var(--weldoo-bg)] px-3 text-sm font-semibold">
          <input
            className="h-4 w-4 accent-[var(--weldoo-indigo)]"
            defaultChecked={Boolean(defaultValues.travelAvailability)}
            name="travelAvailability"
            type="checkbox"
          />
          Available for travel
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Input
          defaultValue={defaultValues.avatarUrl ?? ""}
          error={state.errors?.avatarUrl}
          id="avatarUrl"
          label="Avatar URL"
          name="avatarUrl"
          placeholder="https://..."
          type="url"
        />
        <Input
          defaultValue={defaultValues.coverUrl ?? ""}
          error={state.errors?.coverUrl}
          id="coverUrl"
          label="Cover image URL"
          name="coverUrl"
          placeholder="https://..."
          type="url"
        />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={pending} type="submit">
          {pending ? "Saving" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
