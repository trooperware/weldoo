"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ContactRequestActionsProps = {
  archived: boolean;
  contactRequestId: string;
  read: boolean;
};

export function ContactRequestActions({
  archived,
  contactRequestId,
  read,
}: ContactRequestActionsProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function updateContactRequest(
    action: "accept" | "archive" | "mark_read" | "reject" | "unarchive",
  ) {
    setPendingAction(action);
    setMessage(null);

    try {
      const response = await fetch(`/api/contact-requests/${contactRequestId}`, {
        body: JSON.stringify({ action }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = (await response.json()) as { message?: string; status?: string };

      if (!response.ok || payload.status === "error") {
        setMessage(payload.message ?? "Could not update contact request.");
        return;
      }

      router.refresh();
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="mt-5 space-y-3">
      {!archived ? (
        <div className="grid gap-2 sm:inline-grid sm:grid-cols-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-full bg-weldoo-indigo px-5 text-[13px] font-bold text-white shadow-weldoo-sm transition hover:brightness-105 disabled:opacity-60"
            disabled={Boolean(pendingAction)}
            onClick={() => updateContactRequest("accept")}
            type="button"
          >
            {pendingAction === "accept" ? "Accepting" : "Accept request"}
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-full border border-weldoo-border-light bg-white px-5 text-[13px] font-bold text-weldoo-slate transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
            disabled={Boolean(pendingAction)}
            onClick={() => updateContactRequest("reject")}
            type="button"
          >
            {pendingAction === "reject" ? "Declining" : "Decline"}
          </button>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {!read ? (
          <button
            className="inline-flex h-8 items-center justify-center rounded-full border border-weldoo-border-light bg-white px-3 text-[12px] font-semibold text-weldoo-slate transition hover:border-weldoo-indigo hover:text-weldoo-indigo disabled:opacity-60"
            disabled={Boolean(pendingAction)}
            onClick={() => updateContactRequest("mark_read")}
            type="button"
          >
            {pendingAction === "mark_read" ? "Updating" : "Mark as read"}
          </button>
        ) : null}
        <button
          className="inline-flex h-8 items-center justify-center rounded-full border border-weldoo-border-light bg-white px-3 text-[12px] font-semibold text-weldoo-slate transition hover:border-weldoo-indigo hover:text-weldoo-indigo disabled:opacity-60"
          disabled={Boolean(pendingAction)}
          onClick={() => updateContactRequest(archived ? "unarchive" : "archive")}
          type="button"
        >
          {pendingAction && pendingAction !== "accept" && pendingAction !== "reject"
            ? "Updating"
            : archived
              ? "Restore"
              : "Archive"}
        </button>
        {message ? <p className="text-xs font-medium text-red-600">{message}</p> : null}
      </div>
    </div>
  );
}
