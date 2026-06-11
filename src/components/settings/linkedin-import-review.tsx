"use client";

import { useMemo, useState, type FormEvent } from "react";

import { Button, FormError } from "@/components/ui";
import type { LinkedInProfileImport } from "@/lib/auth/linkedin-profile-import";

type CurrentProfileValues = {
  avatarUrl: string | null;
  displayName: string;
  headline: string | null;
};

type ImportField = {
  current: string | null;
  description: string;
  imported: string | undefined;
  label: string;
  name: "avatarUrl" | "displayName" | "headline";
};

type LinkedInImportReviewProps = {
  currentProfile: CurrentProfileValues;
  importedProfile: LinkedInProfileImport;
};

type ImportState = {
  message?: string;
  status?: "error" | "success";
};

function normalize(value: string | null | undefined) {
  return value?.trim() || "";
}

function FieldComparison({
  checked,
  disabled,
  field,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  field: ImportField;
  onChange: (field: ImportField["name"], checked: boolean) => void;
}) {
  return (
    <label
      className={[
        "grid gap-3 rounded-weldoo-md border p-4 transition sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]",
        checked
          ? "border-weldoo-indigo bg-weldoo-indigo/5"
          : "border-weldoo-border-light bg-white",
        disabled ? "opacity-60" : "cursor-pointer",
      ].join(" ")}
    >
      <div>
        <p className="text-[13.2px] font-bold text-weldoo-ink">{field.label}</p>
        <p className="mt-1 text-[11.5px] leading-5 text-weldoo-muted">{field.description}</p>
      </div>
      <div className="grid gap-2 text-[12.1px] sm:grid-cols-2 sm:gap-3">
        <div>
          <p className="font-semibold text-weldoo-muted">Current</p>
          <p className="mt-1 break-words rounded-weldoo-sm bg-weldoo-bg px-3 py-2 text-weldoo-ink">
            {field.current || "Empty"}
          </p>
        </div>
        <div>
          <p className="font-semibold text-weldoo-muted">LinkedIn</p>
          <p className="mt-1 break-words rounded-weldoo-sm bg-weldoo-bg px-3 py-2 text-weldoo-ink">
            {field.imported || "Not returned"}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <input
          checked={checked}
          className="h-4 w-4 accent-weldoo-indigo"
          disabled={disabled}
          name="fields"
          onChange={(event) => onChange(field.name, event.currentTarget.checked)}
          type="checkbox"
          value={field.name}
        />
      </div>
    </label>
  );
}

export function LinkedInImportReview({
  currentProfile,
  importedProfile,
}: LinkedInImportReviewProps) {
  const fields = useMemo<ImportField[]>(
    () => [
      {
        current: currentProfile.displayName,
        description: "Used as your visible Weldoo identity.",
        imported: importedProfile.displayName,
        label: "Display name",
        name: "displayName",
      },
      {
        current: currentProfile.headline,
        description: "Used on your profile summary when available.",
        imported: importedProfile.headline,
        label: "Professional headline",
        name: "headline",
      },
      {
        current: currentProfile.avatarUrl,
        description: "Stored as your base profile image URL.",
        imported: importedProfile.avatarUrl,
        label: "Profile image",
        name: "avatarUrl",
      },
    ],
    [currentProfile, importedProfile],
  );
  const initialSelected = useMemo(
    () =>
      new Set(
        fields
          .filter(
            (field) =>
              normalize(field.imported).length > 0 &&
              normalize(field.imported) !== normalize(field.current),
          )
          .map((field) => field.name),
      ),
    [fields],
  );
  const [selectedFields, setSelectedFields] = useState(initialSelected);
  const [state, setState] = useState<ImportState>({});
  const [pending, setPending] = useState(false);

  function updateSelection(field: ImportField["name"], checked: boolean) {
    setSelectedFields((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(field);
      } else {
        next.delete(field);
      }

      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState({});

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/settings/linkedin-import", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json()) as ImportState & { redirectTo?: string };

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      window.location.assign(payload.redirectTo ?? "/settings/linkedin-import?status=success");
    } catch (error) {
      setState({
        message:
          error instanceof Error ? error.message : "Could not import LinkedIn profile data.",
        status: "error",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormError>{state.status === "error" ? state.message : null}</FormError>

      <div className="rounded-weldoo-md border border-weldoo-border-light bg-white p-4">
        <p className="text-[13.2px] font-bold text-weldoo-ink">LinkedIn account data</p>
        <dl className="mt-3 grid gap-3 text-[12.1px] text-weldoo-muted sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-weldoo-ink">First name</dt>
            <dd className="mt-1">{importedProfile.firstName ?? "Not returned"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-weldoo-ink">Last name</dt>
            <dd className="mt-1">{importedProfile.lastName ?? "Not returned"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold text-weldoo-ink">Email</dt>
            <dd className="mt-1">{importedProfile.email ?? "Not returned"}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[11.5px] leading-5 text-weldoo-muted">
          First name, last name, and email are shown for review. Weldoo currently stores
          a single display name, so name changes are applied through the display name field.
        </p>
      </div>

      <div className="space-y-3">
        {fields.map((field) => {
          const disabled = normalize(field.imported).length === 0;

          return (
            <FieldComparison
              checked={selectedFields.has(field.name)}
              disabled={disabled}
              field={field}
              key={field.name}
              onChange={updateSelection}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={pending || selectedFields.size === 0} type="submit">
          {pending ? "Importing" : "Import selected fields"}
        </Button>
        <p className="text-[11.5px] leading-5 text-weldoo-muted">
          Nothing is changed until you confirm this import.
        </p>
      </div>
    </form>
  );
}
