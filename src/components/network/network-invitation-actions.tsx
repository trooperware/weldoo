"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type NetworkInvitationActionsProps = {
  connectionId: string;
  density?: "page" | "summary";
  mode: "received" | "sent";
};

export function NetworkInvitationActions({
  connectionId,
  density = "summary",
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
          className={[
            "inline-flex items-center justify-center rounded-full border-[1.5px] border-[#d0d0e8] bg-transparent text-[13px] font-semibold text-weldoo-muted transition hover:border-[#e53e3e] hover:text-[#e53e3e] disabled:opacity-60",
            density === "page" ? "px-4 py-2" : "px-4 py-1.5",
          ].join(" ")}
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
          className="rounded-md bg-transparent px-2 py-1 text-[13px] font-semibold text-weldoo-muted transition hover:text-weldoo-ink disabled:opacity-60"
          disabled={Boolean(pendingAction)}
          onClick={() => updateInvitation("reject")}
          type="button"
        >
          {pendingAction === "reject" ? "Ignoring" : "Ignore"}
        </button>
        <button
          className={[
            "inline-flex items-center justify-center rounded-full border-[1.5px] border-weldoo-indigo bg-transparent text-[13px] font-semibold text-weldoo-indigo transition hover:bg-weldoo-indigo hover:text-white disabled:opacity-60",
            density === "page" ? "px-5 py-2" : "px-4 py-1.5",
          ].join(" ")}
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
