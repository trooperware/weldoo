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
  const [state, setState] = useState<ReportState>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      <Button onClick={() => setOpen(true)} size="sm" variant="ghost">
        Report
      </Button>
      <Modal
        description={`Tell us why this ${targetLabel} should be reviewed.`}
        footer={
          <>
            <Button disabled={pending} onClick={() => setOpen(false)} variant="ghost">
              Close
            </Button>
            {state.status === "success" ? null : (
              <Button disabled={pending} form={`report-${targetType}-${postId ?? commentId}`} type="submit">
                {pending ? "Submitting" : "Submit report"}
              </Button>
            )}
          </>
        }
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setState({});
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
          {state.status === "success" ? null : (
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
