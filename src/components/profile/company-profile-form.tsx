"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { Button, FormError, Input, Textarea } from "@/components/ui";
import type { CompanyProfileFieldErrors } from "@/lib/validators/company-profile";

type CompanyProfileFormValues = {
  companySize?: string | null;
  contactEmail?: string | null;
  coverUrl?: string | null;
  description?: string | null;
  location?: string | null;
  logoUrl?: string | null;
  name: string;
  sector?: string | null;
  websiteUrl?: string | null;
};

type CompanyProfileFormProps = {
  defaultValues: CompanyProfileFormValues;
  publicProfileUrl?: string | null;
};

type SaveState = {
  companyId?: string;
  errors?: CompanyProfileFieldErrors;
  message?: string;
  publicProfileUrl?: string;
  status?: "error" | "success";
};

export function CompanyProfileForm({
  defaultValues,
  publicProfileUrl,
}: CompanyProfileFormProps) {
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SaveState>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState({});

    try {
      const response = await fetch("/api/profile/company", {
        body: new FormData(event.currentTarget),
        method: "POST",
      });
      const payload = (await response.json()) as SaveState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      setState({
        companyId: payload.companyId,
        message: payload.message ?? "Company profile saved.",
        publicProfileUrl: payload.publicProfileUrl,
        status: "success",
      });
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not save company profile.",
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
          label="Company name"
          name="name"
          placeholder="Acme Welding"
        />
        <Input
          defaultValue={defaultValues.sector ?? ""}
          error={state.errors?.sector}
          id="sector"
          label="Sector"
          name="sector"
          placeholder="Industrial fabrication"
        />
        <Input
          defaultValue={defaultValues.companySize ?? ""}
          error={state.errors?.companySize}
          id="companySize"
          label="Company size"
          name="companySize"
          placeholder="11-50 employees"
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
          placeholder="talent@example.com"
          type="email"
        />
      </section>

      <Textarea
        defaultValue={defaultValues.description ?? ""}
        error={state.errors?.description}
        id="description"
        label="Company description"
        name="description"
        placeholder="Describe your welding operations, sectors, materials, certifications, and hiring needs."
      />

      <section className="grid gap-4 sm:grid-cols-2">
        <Input
          defaultValue={defaultValues.logoUrl ?? ""}
          error={state.errors?.logoUrl}
          id="logoUrl"
          label="Logo URL"
          name="logoUrl"
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
          {pending ? "Saving" : "Save company profile"}
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
