"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, FormError, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { JobApplicationFieldErrors } from "@/lib/validators/job-application";

type ApplyState = {
  errors?: JobApplicationFieldErrors;
  message?: string;
  status?: "error" | "success";
};

type JobApplyButtonProps = {
  existingApplication?: {
    createdAt: string;
    status: string;
  } | null;
  jobId: string;
  jobSummary?: {
    company: string;
    location?: string | null;
    logoUrl?: string | null;
    title: string;
  };
  profileSummary?: {
    avatarUrl?: string | null;
    displayName: string;
    headline?: string | null;
  };
  profileType?: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

const jobActionButtonClass =
  "inline-flex h-9 items-center justify-center rounded-full px-5 text-[12px] font-semibold leading-none tracking-[-0.01em] transition";

const primaryJobActionButtonClass =
  "bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-white shadow-[0_2px_8px_rgba(61,61,180,0.25)] hover:brightness-105";

function ApplyIcon() {
  return (
    <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 24 24">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <line x1="10" x2="21" y1="14" y2="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export function JobApplyButton({
  existingApplication,
  jobId,
  jobSummary,
  profileSummary,
  profileType,
}: JobApplyButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [state, setState] = useState<ApplyState>({});
  const appliedAt = existingApplication?.createdAt ?? submittedAt;

  if (appliedAt) {
    return (
      <button
        className={cn(
          jobActionButtonClass,
          "border-[1.5px] border-weldoo-indigo text-weldoo-indigo opacity-80",
        )}
        disabled
        type="button"
      >
        Applied {formatDate(appliedAt)}
      </button>
    );
  }

  if (profileType !== "professional") {
    return (
      <>
        <button
          className={cn(jobActionButtonClass, primaryJobActionButtonClass, "gap-1.5")}
          onClick={() => setOpen(true)}
          type="button"
        >
          <ApplyIcon />
          Apply now
        </button>

        <Modal
          description={
            profileType
              ? "Only professional profiles can apply to jobs on Weldoo."
              : "Sign in with a professional profile to apply to this job."
          }
          footer={null}
          onOpenChange={setOpen}
          open={open}
          title={profileType ? "Professional profile required" : "Sign in to apply"}
        >
          <div className="space-y-4">
            <p className="text-sm leading-6 text-weldoo-muted">
              {profileType
                ? "Company and training provider accounts can browse jobs, but applications are limited to professional profiles."
                : "After signing in, you can confirm your application and share your professional profile with the employer."}
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setOpen(false)} type="button" variant="ghost">
                Cancel
              </Button>
              {!profileType ? (
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-weldoo-sm bg-weldoo-indigo px-4 text-sm font-semibold text-white shadow-weldoo-md transition hover:brightness-105"
                  href="/auth/sign-in"
                >
                  Sign in
                </Link>
              ) : null}
            </div>
          </div>
        </Modal>
      </>
    );
  }

  async function handleConfirm() {
    setPending(true);
    setState({});

    try {
      const formData = new FormData();
      formData.set(
        "message",
        "Application confirmed through Weldoo profile sharing.",
      );
      formData.set("externalCvUrl", "");

      const response = await fetch(`/api/jobs/${jobId}/applications`, {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json()) as ApplyState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        if (response.status === 409) {
          router.refresh();
        }
        return;
      }

      setState({
        message: payload.message ?? "Application submitted.",
        status: "success",
      });
      setSubmittedAt(new Date().toISOString());
      setOpen(false);
      router.refresh();
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not submit application.",
        status: "error",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        className={cn(jobActionButtonClass, primaryJobActionButtonClass, "gap-1.5")}
        onClick={() => setOpen(true)}
        type="button"
      >
        <ApplyIcon />
        Apply now
      </button>

      <Modal
        footer={null}
        onOpenChange={setOpen}
        open={open}
        title="Confirm application"
      >
        <div className="space-y-4">
          <FormError>{state.status === "error" ? state.message : null}</FormError>
          {state.status === "success" && state.message ? (
            <div className="rounded-weldoo-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {state.message}
            </div>
          ) : null}
          {state.errors?.message || state.errors?.externalCvUrl ? (
            <FormError>
              {state.errors.message ?? state.errors.externalCvUrl ?? null}
            </FormError>
          ) : null}
          <div className="flex items-center gap-3.5 rounded-xl bg-[#f7f7fb] px-4 py-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white text-base font-extrabold text-weldoo-indigo">
              {jobSummary?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="h-full w-full object-contain"
                  src={jobSummary.logoUrl}
                />
              ) : (
                (jobSummary?.company ?? "W").slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14.5px] font-bold text-weldoo-ink">
                {jobSummary?.title ?? "Selected job"}
              </div>
              <div className="mt-0.5 truncate text-[12.5px] text-weldoo-muted">
                {jobSummary?.company ?? "Weldoo company"}
                {jobSummary?.location ? ` · ${jobSummary.location}` : ""}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-weldoo-indigo text-sm font-bold text-white">
              {profileSummary?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  src={profileSummary.avatarUrl}
                />
              ) : (
                (profileSummary?.displayName ?? "W").slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-bold text-weldoo-ink">
                {profileSummary?.displayName ?? "Weldoo professional"}
              </div>
              <div className="mt-0.5 truncate text-xs text-weldoo-muted">
                {profileSummary?.headline ?? "Professional profile"}
              </div>
            </div>
          </div>
          <p className="text-[12.5px] leading-6 text-weldoo-muted">
            Your profile (name, role, and current avatar) will be shared with the employer as your application.
          </p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={pending || state.status === "success"}
              onClick={handleConfirm}
              type="button"
            >
              {pending ? "Applying..." : "Confirm application"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
