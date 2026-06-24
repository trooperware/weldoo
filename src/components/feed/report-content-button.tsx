"use client";

import { useState, type FormEvent } from "react";

import { Button, FormError, Modal, Select, Textarea } from "@/components/ui";
import type { ReportFieldErrors } from "@/lib/validators/report";

type ReportContentButtonProps = {
  commentId?: string;
  postId?: string;
  targetLabel: string;
  targetType: "post" | "comment";
};

type ReportState = {
  errors?: ReportFieldErrors;
  message?: string;
  status?: "error" | "success";
};

export function ReportContentButton({
  commentId,
  postId,
  targetLabel,
  targetType,
}: ReportContentButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [reported, setReported] = useState(false);
  const [state, setState] = useState<ReportState>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || reported) return;

    setPending(true);
    setState({});

    try {
      const response = await fetch("/api/feed/reports", {
        body: new FormData(event.currentTarget),
        method: "POST",
      });
      const payload = (await response.json()) as ReportState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      setState({
        message: payload.message ?? "Report submitted for review.",
        status: "success",
      });
      setReported(true);
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not submit report.",
        status: "error",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        aria-pressed={reported}
        className="h-7 rounded-full px-2 text-[11.5px] font-semibold"
        disabled={reported}
        onClick={() => setOpen(true)}
        size="sm"
        variant="ghost"
      >
        <svg
          aria-hidden="true"
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 21V4.5M5 4.5C7.8 2.9 10.4 3.2 12.8 4.6C15.2 6 17.7 6.3 20 4.8V14.7C17.7 16.2 15.2 15.9 12.8 14.5C10.4 13.1 7.8 12.8 5 14.4V4.5Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
        {reported ? "Reported" : "Report"}
      </Button>
      <Modal
        description={`Tell us why this ${targetLabel} should be reviewed.`}
        footer={
          <>
            <Button disabled={pending} onClick={() => setOpen(false)} variant="ghost">
              Close
            </Button>
            {reported || state.status === "success" ? null : (
              <Button
                disabled={pending}
                form={`report-${targetType}-${postId ?? commentId}`}
                type="submit"
              >
                {pending ? "Submitting" : "Submit report"}
              </Button>
            )}
          </>
        }
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen && !reported) setState({});
        }}
        open={open}
        title={`Report ${targetLabel}`}
      >
        <form
          className="space-y-4"
          id={`report-${targetType}-${postId ?? commentId}`}
          onSubmit={handleSubmit}
        >
          <input name="targetType" type="hidden" value={targetType} />
          {postId ? <input name="postId" type="hidden" value={postId} /> : null}
          {commentId ? <input name="commentId" type="hidden" value={commentId} /> : null}
          <FormError>{state.status === "error" ? state.message : null}</FormError>
          {state.status === "success" && state.message ? (
            <div
              className="rounded-[var(--weldoo-radius-sm)] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
              role="status"
            >
              {state.message}
            </div>
          ) : null}
          {reported || state.status === "success" ? null : (
            <>
              <Select
                error={state.errors?.reason}
                id={`reason-${targetType}-${postId ?? commentId}`}
                label="Reason"
                name="reason"
              >
                <option value="">Select a reason</option>
                <option value="Spam or scam">Spam or scam</option>
                <option value="Harassment or abuse">Harassment or abuse</option>
                <option value="Unsafe or illegal content">Unsafe or illegal content</option>
                <option value="Misleading professional claim">
                  Misleading professional claim
                </option>
                <option value="Other">Other</option>
              </Select>
              <Textarea
                error={state.errors?.note}
                id={`note-${targetType}-${postId ?? commentId}`}
                label="Optional note"
                name="note"
                placeholder="Add context for the moderation team."
              />
            </>
          )}
        </form>
      </Modal>
    </>
  );
}
