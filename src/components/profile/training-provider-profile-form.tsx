"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { ProfileMediaUploadField } from "@/components/profile/profile-media-upload-field";
import { Button, FormError, Input, Textarea } from "@/components/ui";
import type { TrainingProviderProfileFieldErrors } from "@/lib/validators/training-provider-profile";

type TrainingProviderProfileFormValues = {
  contactEmail?: string | null;
  coverUrl?: string | null;
  description?: string | null;
  location?: string | null;
  logoUrl?: string | null;
  name: string;
  trainingTypes?: string[] | null;
  websiteUrl?: string | null;
};

type TrainingProviderProfileFormProps = {
  defaultValues: TrainingProviderProfileFormValues;
  publicProfileUrl?: string | null;
};

type SaveState = {
  errors?: TrainingProviderProfileFieldErrors;
  message?: string;
  publicProfileUrl?: string;
  status?: "error" | "success";
  trainingProviderId?: string;
};

function listToText(value?: string[] | null) {
  return value?.join(", ") ?? "";
}

export function TrainingProviderProfileForm({
  defaultValues,
  publicProfileUrl,
}: TrainingProviderProfileFormProps) {
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SaveState>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState({});

    try {
      const response = await fetch("/api/profile/training-provider", {
        body: new FormData(event.currentTarget),
        method: "POST",
      });
      const payload = (await response.json()) as SaveState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      setState({
        message: payload.message ?? "Training provider profile saved.",
        publicProfileUrl: payload.publicProfileUrl,
        status: "success",
        trainingProviderId: payload.trainingProviderId,
      });
    } catch (error) {
      setState({
        message:
          error instanceof Error ? error.message : "Could not save training provider profile.",
        status: "error",
      });
    } finally {
      setPending(false);
    }
  }

  const savedPublicUrl = state.publicProfileUrl ?? publicProfileUrl;

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
          defaultValue={defaultValues.name}
          error={state.errors?.name}
          id="name"
          label="Organisation name"
          name="name"
          placeholder="Welding Academy Barcelona"
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
          defaultValue={defaultValues.websiteUrl ?? ""}
          error={state.errors?.websiteUrl}
          id="websiteUrl"
          label="Website URL"
          name="websiteUrl"
          placeholder="https://example.com"
          type="url"
        />
        <Input
          defaultValue={defaultValues.contactEmail ?? ""}
          error={state.errors?.contactEmail}
          id="contactEmail"
          label="Contact email"
          name="contactEmail"
          placeholder="training@example.com"
          type="email"
        />
      </section>

      <Input
        defaultValue={listToText(defaultValues.trainingTypes)}
        error={state.errors?.trainingTypes}
        id="trainingTypes"
        label="Training types offered"
        name="trainingTypes"
        placeholder="TIG courses, MIG/MAG workshops, certification preparation"
      />

      <Textarea
        defaultValue={defaultValues.description ?? ""}
        error={state.errors?.description}
        id="description"
        label="Training provider description"
        name="description"
        placeholder="Describe your training offer, facilities, instructors, sectors, and certification focus."
      />

      <section className="grid gap-4 sm:grid-cols-2">
        <ProfileMediaUploadField
          bucket="avatars"
          currentUrl={defaultValues.logoUrl}
          description="JPG, PNG, or WebP. Maximum 2 MB."
          label="Logo"
          name="logoUrl"
        />
        <ProfileMediaUploadField
          bucket="covers"
          currentUrl={defaultValues.coverUrl}
          description="JPG, PNG, or WebP. Maximum 5 MB."
          label="Cover image"
          name="coverUrl"
        />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={pending} type="submit">
          {pending ? "Saving" : "Save training profile"}
        </Button>
        {savedPublicUrl ? (
          <Link
            className="inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] border border-[var(--weldoo-border-light)] bg-white px-5 text-sm font-semibold text-[var(--weldoo-slate)] transition hover:border-[var(--weldoo-indigo)] hover:text-[var(--weldoo-indigo)]"
            href={savedPublicUrl}
          >
            View public profile
          </Link>
        ) : null}
      </div>
    </form>
  );
}
