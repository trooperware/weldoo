"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, Modal, Textarea } from "@/components/ui";

export type ContactRequestStatus = "none" | "sent" | "received";

type ContactRequestButtonProps = {
  canContact: boolean;
  contactRequestId?: string | null;
  contactRequestStatus?: ContactRequestStatus;
  recipientName: string;
  recipientProfileId: string;
  size?: "card" | "profile";
};

type RequestState = {
  contactRequestId: string | null;
  message?: string;
  requestStatus: ContactRequestStatus;
  status: "idle" | "error";
};

export function ContactRequestButton({
  canContact,
  contactRequestId,
  contactRequestStatus = "none",
  recipientName,
  recipientProfileId,
  size = "profile",
}: ContactRequestButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<RequestState>({
    contactRequestId: contactRequestId ?? null,
    requestStatus: contactRequestStatus,
    status: "idle",
  });

  if (!canContact) {
    return null;
  }

  async function sendContactRequest() {
    const trimmedMessage = message.trim();

    if (trimmedMessage.length < 1) {
      setState((current) => ({
        ...current,
        message: "Write a short message before sending.",
        status: "error",
      }));
      return;
    }

    if (trimmedMessage.length > 1000) {
      setState((current) => ({
        ...current,
        message: "Contact message must be 1000 characters or fewer.",
        status: "error",
      }));
      return;
    }

    setPending(true);
    setState((current) => ({ ...current, message: undefined, status: "idle" }));

    try {
      const response = await fetch("/api/contact-requests", {
        body: JSON.stringify({
          message: trimmedMessage,
          recipientProfileId,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as {
        contactRequestId?: string;
        contactRequestStatus?: ContactRequestStatus;
        message?: string;
        status?: string;
      };

      if (!response.ok || payload.status === "error") {
        setState({
          contactRequestId: payload.contactRequestId ?? state.contactRequestId,
          message: payload.message ?? "Could not send contact request.",
          requestStatus: payload.contactRequestStatus ?? state.requestStatus,
          status: "error",
        });
        return;
      }

      setMessage("");
      setState({
        contactRequestId: payload.contactRequestId ?? null,
        requestStatus: "sent",
        status: "idle",
      });
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  const buttonClass =
    size === "card"
      ? "mt-3 inline-flex h-8 w-full items-center justify-center rounded-full border border-weldoo-border-light bg-white text-[12px] font-semibold leading-none tracking-[-0.01em] text-weldoo-muted transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/[0.04] hover:text-weldoo-indigo"
      : "inline-flex h-11 items-center justify-center rounded-[var(--weldoo-radius-sm)] bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] px-5 text-sm font-semibold text-white shadow-weldoo-md transition hover:brightness-105";
  const buttonStyle =
    size === "card" ? { fontSize: "12px", lineHeight: 1 } : undefined;
  const messagesHref = state.contactRequestId
    ? `/contact-requests?request=${state.contactRequestId}`
    : "/contact-requests";

  if (state.requestStatus !== "none") {
    const label =
      state.requestStatus === "sent" ? "Request sent" : "View request";

    return (
      <>
        <Link className={buttonClass} href={messagesHref} style={buttonStyle}>
          {label}
        </Link>
        {state.status === "error" && state.message ? (
          <p className="mt-2 text-[11px] font-medium text-red-600">{state.message}</p>
        ) : null}
      </>
    );
  }

  return (
    <>
      <button
        className={buttonClass}
        onClick={() => setOpen(true)}
        style={buttonStyle}
        type="button"
      >
        Contact
      </button>
      <Modal
        description="Send a short message. This is not real-time chat; the recipient will see it in contact requests."
        footer={
          <>
            <Button disabled={pending} onClick={() => setOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button disabled={pending} onClick={sendContactRequest}>
              {pending ? "Sending" : "Send request"}
            </Button>
          </>
        }
        onOpenChange={setOpen}
        open={open}
        title={`Contact ${recipientName}`}
      >
        <div className="space-y-3">
          <Textarea
            error={state.status === "error" ? state.message : undefined}
            id={`contact-message-${recipientProfileId}`}
            label="Message"
            maxLength={1000}
            onChange={(event) => {
              setMessage(event.target.value);
              if (state.status === "error") {
                setState((current) => ({
                  ...current,
                  message: undefined,
                  status: "idle",
                }));
              }
            }}
            placeholder="Introduce yourself and explain why you want to connect."
            value={message}
          />
          <p className="text-right text-xs font-medium text-weldoo-muted">
            {message.length}/1000
          </p>
        </div>
      </Modal>
    </>
  );
}
