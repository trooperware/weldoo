"use client";

import { useState } from "react";

import { Button, FormError, Modal } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type DeleteState = {
  message?: string;
  redirectTo?: string;
  status?: "error" | "success";
};

export function DeleteTestAccountCard() {
  const [confirmation, setConfirmation] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<DeleteState>({});
  const canDelete = confirmation === "DELETE" && !pending;

  async function handleDeleteAccount() {
    if (!canDelete) return;

    setPending(true);
    setState({});

    try {
      const response = await fetch("/api/settings/delete-test-account", {
        body: JSON.stringify({ confirmation }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "DELETE",
      });
      const payload = (await response.json()) as DeleteState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      window.location.assign(payload.redirectTo ?? "/auth/sign-up");
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not delete account.",
        status: "error",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div>
        <p className="text-[13.2px] font-medium text-red-700">Delete test account</p>
        <p className="mt-0.5 text-[11.5px] text-weldoo-muted">
          Remove your current Supabase user so you can repeat OAuth sign-up testing.
        </p>
      </div>
      <Button
        className="shrink-0"
        onClick={() => {
          setConfirmation("");
          setState({});
          setModalOpen(true);
        }}
        size="sm"
        variant="danger"
      >
        Delete
      </Button>

      <Modal
        description="This action is irreversible and should only be used for test accounts."
        footer={
          <>
            <Button
              disabled={pending}
              onClick={() => setModalOpen(false)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button disabled={!canDelete} onClick={handleDeleteAccount} variant="danger">
              {pending ? "Deleting" : "Delete permanently"}
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
        title="Delete test account?"
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-weldoo-muted">
            Are you sure you want to delete the current Supabase user? This is
            irreversible. The account will be removed from Supabase Auth and related
            profile data will be deleted by database cascade rules.
          </p>
          <label className="block">
            <span className="text-[12.5px] font-semibold text-weldoo-ink">
              Type DELETE to confirm
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
