"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type NetworkInvitationActionsProps = {
  connectionId: string;
  mode: "received" | "sent";
};

export function NetworkInvitationActions({
  connectionId,
  mode,
}: NetworkInvitationActionsProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function updateInvitation(action: "accept" | "cancel" | "reject") {
    setPendingAction(action);
    setMessage(null);

    try {
      const response = await fetch(`/api/network/connections/${connectionId}`, {
        body: JSON.stringify({ action }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = (await response.json()) as { message?: string; status?: string };

      if (!response.ok || payload.status === "error") {
        setMessage(payload.message ?? "Could not update invitation.");
        return;
      }

      router.refresh();
    } finally {
      setPendingAction(null);
    }
  }

  if (mode === "sent") {
    return (
      <div className="flex flex-col items-end gap-2">
        <button
          className="inline-flex h-9 items-center justify-center rounded-full border-[1.5px] border-[#d0d0e8] bg-white px-4 text-[13px] font-semibold text-weldoo-muted transition hover:border-red-300 hover:text-red-600 disabled:opacity-60"
          disabled={Boolean(pendingAction)}
          onClick={() => updateInvitation("cancel")}
          type="button"
        >
          {pendingAction === "cancel" ? "Withdrawing" : "Withdraw"}
        </button>
        {message ? <p className="text-right text-[11px] font-medium text-red-600">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button
          className="rounded-md px-2 py-1 text-[13px] font-semibold text-weldoo-muted transition hover:text-weldoo-ink disabled:opacity-60"
          disabled={Boolean(pendingAction)}
          onClick={() => updateInvitation("reject")}
          type="button"
        >
          {pendingAction === "reject" ? "Ignoring" : "Ignore"}
        </button>
        <button
          className="inline-flex h-8 items-center justify-center rounded-full border-[1.5px] border-weldoo-indigo bg-white px-4 text-[13px] font-semibold text-weldoo-indigo transition hover:bg-weldoo-indigo hover:text-white disabled:opacity-60"
          disabled={Boolean(pendingAction)}
          onClick={() => updateInvitation("accept")}
          type="button"
        >
          {pendingAction === "accept" ? "Accepting" : "Accept"}
        </button>
      </div>
      {message ? <p className="text-right text-[11px] font-medium text-red-600">{message}</p> : null}
    </div>
  );
}
