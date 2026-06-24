"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, FormError, Input, Modal, Textarea } from "@/components/ui";
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

export function JobApplyButton({
  existingApplication,
  jobId,
  profileType,
}: JobApplyButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<ApplyState>({});

  if (existingApplication) {
    return (
      <button
        className={cn(
          jobActionButtonClass,
          "border-[1.5px] border-weldoo-indigo text-weldoo-indigo opacity-80",
        )}
        disabled
        type="button"
      >
        Applied {formatDate(existingApplication.createdAt)}
      </button>
    );
  }

  if (profileType !== "professional") {
    return (
      <button
        className={cn(jobActionButtonClass, primaryJobActionButtonClass, "opacity-50")}
        disabled
        type="button"
      >
        Apply now
      </button>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState({});

    try {
      const response = await fetch(`/api/jobs/${jobId}/applications`, {
        body: new FormData(event.currentTarget),
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
        <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 24 24">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <line x1="10" x2="21" y1="14" y2="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
        Apply now
      </button>

      <Modal
        description="Send a short application message. The company will see it in their applications panel."
        footer={<></>}
        onOpenChange={setOpen}
        open={open}
        title="Apply to this job"
      >
        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <FormError>{state.status === "error" ? state.message : null}</FormError>
          {state.status === "success" && state.message ? (
            <div className="rounded-weldoo-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {state.message}
            </div>
          ) : null}
          <Textarea
            error={state.errors?.message}
            id="message"
            label="Message"
            name="message"
            placeholder="Introduce yourself, your welding experience, and why this role fits your profile."
            rows={5}
          />
          <Input
            error={state.errors?.externalCvUrl}
            id="externalCvUrl"
            label="External CV URL"
            name="externalCvUrl"
            placeholder="https://..."
            type="url"
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button disabled={pending || state.status === "success"} type="submit">
              {pending ? "Submitting" : "Submit application"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
