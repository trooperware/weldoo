"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { NetworkDirectoryItem } from "@/lib/network/queries";

type ConnectionActionButtonProps = {
  item: Pick<
    NetworkDirectoryItem,
    "canConnect" | "connectionId" | "connectionStatus" | "targetProfileId"
  >;
};

type RequestState = {
  connectionId: string | null;
  message?: string;
  status: NetworkDirectoryItem["connectionStatus"];
};

function PlusIcon() {
  return (
    <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 24 24">
      <line x1="12" x2="12" y1="5" y2="19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <line x1="5" x2="19" y1="12" y2="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export function ConnectionActionButton({ item }: ConnectionActionButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<RequestState>({
    connectionId: item.connectionId,
    status: item.connectionStatus,
  });
  const buttonTextStyle = { fontSize: "12px", lineHeight: 1 };

  if (!item.canConnect) {
    return null;
  }

  async function sendRequest() {
    setPending(true);
    setState((current) => ({ ...current, message: undefined }));

    try {
      const response = await fetch("/api/network/connections", {
        body: JSON.stringify({ recipientProfileId: item.targetProfileId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as {
        connectionId?: string;
        message?: string;
        status?: string;
      };

      if (!response.ok || payload.status === "error") {
        setState((current) => ({
          ...current,
          message: payload.message ?? "Could not send request.",
        }));
        return;
      }

      setState({
        connectionId: payload.connectionId ?? null,
        status: "pending_sent",
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function updateRequest(action: "accept" | "cancel" | "reject") {
    if (!state.connectionId) return;

    setPending(true);
    setState((current) => ({ ...current, message: undefined }));

    try {
      const response = await fetch(`/api/network/connections/${state.connectionId}`, {
        body: JSON.stringify({ action }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = (await response.json()) as { message?: string; status?: string };

      if (!response.ok || payload.status === "error") {
        setState((current) => ({
          ...current,
          message: payload.message ?? "Could not update request.",
        }));
        return;
      }

      setState({
        connectionId: action === "accept" ? state.connectionId : null,
        status: action === "accept" ? "accepted" : "none",
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (state.status === "accepted") {
    return (
      <button
        className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border-[1.5px] border-weldoo-indigo bg-weldoo-indigo/[0.06] text-[12px] font-semibold leading-none tracking-[-0.01em] text-weldoo-indigo"
        disabled
        style={buttonTextStyle}
        type="button"
      >
        <CheckIcon />
        Connected
      </button>
    );
  }

  if (state.status === "pending_sent") {
    return (
      <>
        <button
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#e0e0ed] bg-white text-[12px] font-semibold leading-none tracking-[-0.01em] text-weldoo-slate transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/[0.04] hover:text-weldoo-indigo hover:shadow-[0_0_0_3px_rgba(61,61,180,0.08)] disabled:opacity-60"
          disabled={pending}
          onClick={() => updateRequest("cancel")}
          style={buttonTextStyle}
          type="button"
        >
          <ClockIcon />
          {pending ? "Cancelling" : "Pending"}
        </button>
        {state.message ? (
          <p className="mt-2 text-[11px] font-medium text-red-600">{state.message}</p>
        ) : null}
      </>
    );
  }

  if (state.status === "pending_received") {
    return (
      <>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            className="inline-flex h-9 items-center justify-center rounded-full bg-weldoo-indigo text-[12px] font-semibold leading-none tracking-[-0.01em] text-white shadow-weldoo-sm transition hover:brightness-105 disabled:opacity-60"
            disabled={pending}
            onClick={() => updateRequest("accept")}
            style={buttonTextStyle}
            type="button"
          >
            Accept
          </button>
          <button
            className="inline-flex h-9 items-center justify-center rounded-full border-[1.5px] border-[#e0e0ed] bg-white text-[12px] font-semibold leading-none tracking-[-0.01em] text-weldoo-slate transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/[0.04] hover:text-weldoo-indigo disabled:opacity-60"
            disabled={pending}
            onClick={() => updateRequest("reject")}
            style={buttonTextStyle}
            type="button"
          >
            Reject
          </button>
        </div>
        {state.message ? (
          <p className="mt-2 text-[11px] font-medium text-red-600">{state.message}</p>
        ) : null}
      </>
    );
  }

  return (
    <>
      <button
        className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#e0e0ed] bg-white text-[12px] font-semibold leading-none tracking-[-0.01em] text-weldoo-slate transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/[0.04] hover:text-weldoo-indigo hover:shadow-[0_0_0_3px_rgba(61,61,180,0.08)] disabled:opacity-60"
        disabled={pending}
        onClick={sendRequest}
        style={buttonTextStyle}
        type="button"
      >
        <PlusIcon />
        {pending ? "Sending" : "Connect"}
      </button>
      {state.message ? (
        <p className="mt-2 text-[11px] font-medium text-red-600">{state.message}</p>
      ) : null}
    </>
  );
}
