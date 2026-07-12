"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { NetworkDirectoryItem } from "@/lib/network/queries";

type ConnectionActionButtonProps = {
  item: Pick<
    NetworkDirectoryItem,
    "canConnect" | "connectionId" | "connectionStatus" | "targetProfileId"
  >;
  recipientAvatarUrl?: string | null;
  recipientInitials?: string;
  recipientName?: string;
  recipientRole?: string | null;
  size?: "card" | "profile";
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

function CancelIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
        x1="18"
        x2="6"
        y1="6"
        y2="18"
      />
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
        x1="6"
        x2="18"
        y1="6"
        y2="18"
      />
    </svg>
  );
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

export function ConnectionActionButton({
  item,
  recipientAvatarUrl,
  recipientInitials,
  recipientName = "this profile",
  recipientRole,
  size = "card",
}: ConnectionActionButtonProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [pending, setPending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [state, setState] = useState<RequestState>({
    connectionId: item.connectionId,
    status: item.connectionStatus,
  });
  const displayInitials =
    recipientInitials ??
    recipientName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.slice(0, 1).toUpperCase())
      .join("") ??
    "W";
  const buttonTextStyle = size === "card" ? { fontSize: "12.5px", lineHeight: 1 } : undefined;
  const baseButtonClass =
    size === "profile"
      ? "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-[18px] text-[12.1px] font-semibold leading-none tracking-[-0.01em] transition"
      : "mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full text-[12.5px] font-semibold leading-none tracking-[-0.01em] transition";
  const secondaryButtonClass =
    size === "profile"
      ? `${baseButtonClass} border-[1.5px] border-[var(--weldoo-indigo)] bg-white text-[var(--weldoo-indigo)] hover:bg-[var(--weldoo-indigo)]/[0.04] hover:shadow-[0_0_0_3px_rgba(61,61,180,0.08)] disabled:opacity-60`
      : `${baseButtonClass} border-[1.5px] border-[#e0e0ed] bg-transparent text-[#44446a] hover:border-weldoo-indigo hover:bg-weldoo-indigo/[0.04] hover:text-weldoo-indigo hover:shadow-[0_0_0_3px_rgba(61,61,180,0.08)] disabled:opacity-60`;
  const acceptedButtonClass =
    `${baseButtonClass} border-[1.5px] border-weldoo-indigo bg-weldoo-indigo/[0.06] text-weldoo-indigo`;
  const pendingButtonClass =
    `${baseButtonClass} group border-[1.5px] border-[var(--weldoo-border-light)] bg-[rgba(122,122,154,0.10)] text-[var(--weldoo-muted)] hover:border-[rgba(220,50,50,0.25)] hover:bg-[rgba(220,50,50,0.08)] hover:text-[#c0392b]`;
  const primaryButtonClass =
    size === "profile"
      ? `${baseButtonClass} border border-transparent bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-white shadow-[0_2px_8px_rgba(61,61,180,0.25)] hover:brightness-105 hover:shadow-[0_4px_14px_rgba(61,61,180,0.32)] disabled:opacity-60`
      : "inline-flex h-9 items-center justify-center rounded-full bg-weldoo-indigo text-[12px] font-semibold leading-none tracking-[-0.01em] text-white shadow-weldoo-sm transition hover:brightness-105 disabled:opacity-60";

  useEffect(() => {
    if (!modalOpen) return;

    const timer = window.setTimeout(() => textareaRef.current?.focus(), 100);

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setModalOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [modalOpen]);

  if (!item.canConnect) {
    return null;
  }

  async function sendRequest() {
    const trimmedMessage = requestMessage.trim();

    if (trimmedMessage.length > 300) {
      setState((current) => ({
        ...current,
        message: "Connection note is too long.",
      }));
      return;
    }

    setPending(true);
    setState((current) => ({ ...current, message: undefined }));

    try {
      const response = await fetch("/api/network/connections", {
        body: JSON.stringify({
          message: trimmedMessage || undefined,
          recipientProfileId: item.targetProfileId,
        }),
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
      setModalOpen(false);
      setRequestMessage("");
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
        className={acceptedButtonClass}
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
          className={pendingButtonClass}
          disabled={pending}
          onClick={() => updateRequest("cancel")}
          style={buttonTextStyle}
          type="button"
        >
          {pending ? (
            "Cancelling"
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 group-hover:hidden">
                <ClockIcon />
                Pending
              </span>
              <span className="hidden items-center gap-1.5 group-hover:inline-flex">
                <CancelIcon />
                Cancel
              </span>
            </>
          )}
        </button>
        {state.message ? (
          <p className="mt-2 text-[11px] font-medium text-red-600">{state.message}</p>
        ) : null}
      </>
    );
  }

  if (state.status === "pending_received") {
    const receivedActionWrapperClass =
      size === "profile"
        ? "flex flex-nowrap items-center justify-end gap-2"
        : "mt-3 flex w-full flex-nowrap items-center justify-center gap-2";
    const ignoreButtonClass =
      "inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md bg-transparent px-2 text-[13px] font-semibold text-weldoo-muted transition hover:text-weldoo-ink disabled:opacity-60";
    const acceptInvitationButtonClass =
      size === "profile"
        ? `${baseButtonClass} shrink-0 whitespace-nowrap border-[1.5px] border-weldoo-indigo bg-transparent px-5 py-2 text-weldoo-indigo hover:bg-weldoo-indigo hover:text-white disabled:opacity-60`
        : "inline-flex h-9 min-w-[104px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border-[1.5px] border-weldoo-indigo bg-transparent px-4 text-[13px] font-semibold text-weldoo-indigo transition hover:bg-weldoo-indigo hover:text-white disabled:opacity-60";

    return (
      <>
        <div className={receivedActionWrapperClass}>
          <button
            className={ignoreButtonClass}
            disabled={pending}
            onClick={() => updateRequest("reject")}
            style={buttonTextStyle}
            type="button"
          >
            {pending ? "Ignoring" : "Ignore"}
          </button>
          <button
            className={acceptInvitationButtonClass}
            disabled={pending}
            onClick={() => updateRequest("accept")}
            style={buttonTextStyle}
            type="button"
          >
            {pending ? "Accepting" : "Accept"}
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
        className={size === "profile" ? primaryButtonClass : secondaryButtonClass}
        disabled={pending}
        onClick={() => setModalOpen(true)}
        style={buttonTextStyle}
        type="button"
      >
        <PlusIcon />
        Connect
      </button>
      {state.message ? (
        <p className="mt-2 text-[11px] font-medium text-red-600">{state.message}</p>
      ) : null}
      {modalOpen
        ? createPortal(
            <div
              aria-modal="true"
              className="fixed inset-0 z-[1100] flex items-center justify-center bg-[rgba(12,12,24,0.45)] p-4"
              onClick={(event) => {
                if (event.currentTarget === event.target) {
                  setModalOpen(false);
                }
              }}
              role="dialog"
            >
              <div className="w-full max-w-[420px] rounded-[16px] bg-white p-7 shadow-weldoo-xl">
                <div className="mb-[18px] flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-[15.4px] font-bold text-white">
                    {recipientAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" className="h-full w-full object-cover" src={recipientAvatarUrl} />
                    ) : (
                      displayInitials
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[16.5px] font-bold leading-tight text-weldoo-ink">
                      {recipientName}
                    </div>
                    <div className="mt-0.5 truncate text-[12.1px] text-weldoo-muted">
                      {recipientRole ?? "Weldoo member"}
                    </div>
                  </div>
                </div>

                <label
                  className="mb-2 block text-[13.2px] font-semibold text-weldoo-ink"
                  htmlFor={`connection-message-${item.targetProfileId}`}
                >
                  Add a note to your request
                </label>
                <textarea
                  aria-invalid={Boolean(state.message)}
                  className={[
                    "min-h-[100px] w-full resize-none rounded-[10px] border-[1.5px] border-weldoo-border-light bg-weldoo-bg px-3.5 py-3 text-[13.2px] leading-[1.55] text-weldoo-ink outline-none transition placeholder:text-weldoo-muted/55 focus:border-weldoo-indigo focus:bg-white focus:shadow-[0_0_0_3px_rgba(61,61,180,0.09)]",
                    state.message ? "border-red-300 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.10)]" : "",
                  ].join(" ")}
                  id={`connection-message-${item.targetProfileId}`}
                  maxLength={300}
                  onChange={(event) => {
                    setRequestMessage(event.target.value);
                    if (state.message) {
                      setState((current) => ({ ...current, message: undefined }));
                    }
                  }}
                  placeholder={`Hi ${getFirstName(recipientName)}, I'd love to connect and share insights on the welding industry...`}
                  ref={textareaRef}
                  value={requestMessage}
                />
                <div className="mb-[18px] mt-1.5 flex items-start justify-between gap-3">
                  <p className="text-[11px] leading-4 text-weldoo-muted">
                    Optional · Max 300 characters
                  </p>
                  <p className="shrink-0 text-[11px] leading-4 text-weldoo-muted">
                    {requestMessage.length}/300
                  </p>
                </div>
                {state.message ? (
                  <p className="-mt-3 mb-4 text-[11.5px] font-medium text-red-600">
                    {state.message}
                  </p>
                ) : null}
                <div className="flex justify-end gap-2.5">
                  <button
                    className="h-[38px] rounded-full border-[1.5px] border-weldoo-border-light bg-transparent px-[18px] text-[13.2px] font-semibold text-weldoo-ink transition hover:border-weldoo-muted hover:bg-weldoo-bg disabled:opacity-60"
                    disabled={pending}
                    onClick={() => setModalOpen(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="h-[38px] rounded-full border-0 bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] px-[22px] text-[13.2px] font-semibold text-white shadow-[0_2px_8px_rgba(61,61,180,0.20)] transition hover:brightness-105 hover:shadow-[0_4px_12px_rgba(61,61,180,0.30)] disabled:opacity-60"
                    disabled={pending}
                    onClick={sendRequest}
                    type="button"
                  >
                    {pending ? "Sending" : "Send request"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
