"use client";

import { useState } from "react";

import { Button, FormError, Modal } from "@/components/ui";

type ResetState = {
  message?: string;
  redirectTo?: string;
  status?: "error" | "success";
};

export function ResetTestActivityCard() {
  const [confirmation, setConfirmation] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<ResetState>({});
  const canReset = confirmation === "RESET" && !pending;

  async function handleResetActivity() {
    if (!canReset) return;

    setPending(true);
    setState({});

    try {
      const response = await fetch("/api/settings/reset-test-activity", {
        body: JSON.stringify({ confirmation }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as ResetState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      window.location.replace(payload.redirectTo ?? "/settings?status=activity-reset");
    } catch (error) {
      setState({
        message:
          error instanceof Error ? error.message : "Could not reset test activity.",
        status: "error",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div>
        <p className="text-[13.2px] font-medium text-amber-700">
          Reset test activity
        </p>
        <p className="mt-0.5 text-[11.5px] text-weldoo-muted">
          Clear messages, notifications, posts, saved items, applications, and
          connections while keeping this account and profile.
        </p>
      </div>
      <Button
        className="shrink-0 border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300 hover:bg-amber-100"
        onClick={() => {
          setConfirmation("");
          setState({});
          setModalOpen(true);
        }}
        size="sm"
        variant="secondary"
      >
        Reset
      </Button>

      <Modal
        description="This keeps your account and profile, but removes activity created while testing."
        footer={
          <>
            <Button
              disabled={pending}
              onClick={() => setModalOpen(false)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button disabled={!canReset} onClick={handleResetActivity} variant="danger">
              {pending ? "Resetting" : "Reset activity"}
            </Button>
          </>
        }
        onOpenChange={(open) => {
          if (!open) {
            setConfirmation("");
            setState({});
          }
          setModalOpen(open);
        }}
        open={modalOpen}
        title="Reset test activity?"
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-weldoo-muted">
            This removes your conversations, messages, notifications, feed activity,
            saved items, job applications, course interests, contact requests, and
            network connections. Your login, base profile, onboarding status, company
            profile, training provider profile, or professional profile are preserved.
          </p>
          <label className="block">
            <span className="text-[12.5px] font-semibold text-weldoo-ink">
              Type RESET to confirm
            </span>
            <input
              className="mt-2 h-10 w-full rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 text-sm text-weldoo-ink outline-none transition focus:border-weldoo-indigo focus:bg-white"
              onChange={(event) => setConfirmation(event.target.value)}
              value={confirmation}
            />
          </label>
          <FormError>{state.status === "error" ? state.message : null}</FormError>
        </div>
      </Modal>
    </div>
  );
}
