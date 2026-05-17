"use client";

import { useState } from "react";

import { Button, Modal, Textarea } from "@/components/ui";

type ContactRequestButtonProps = {
  canContact: boolean;
  recipientName: string;
  recipientProfileId: string;
  size?: "card" | "profile";
};

type RequestState = {
  message?: string;
  status: "idle" | "error" | "success";
};

export function ContactRequestButton({
  canContact,
  recipientName,
  recipientProfileId,
  size = "profile",
}: ContactRequestButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<RequestState>({ status: "idle" });

  if (!canContact) {
    return null;
  }

  async function sendContactRequest() {
    const trimmedMessage = message.trim();

    if (trimmedMessage.length < 1) {
      setState({ message: "Write a short message before sending.", status: "error" });
      return;
    }

    if (trimmedMessage.length > 1000) {
      setState({ message: "Contact message must be 1000 characters or fewer.", status: "error" });
      return;
    }

    setPending(true);
    setState({ status: "idle" });

    try {
      const response = await fetch("/api/contact-requests", {
        body: JSON.stringify({
          message: trimmedMessage,
          recipientProfileId,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as { message?: string; status?: string };

      if (!response.ok || payload.status === "error") {
        setState({
          message: payload.message ?? "Could not send contact request.",
          status: "error",
        });
        return;
      }

      setMessage("");
      setState({
        message: payload.message ?? "Contact request sent.",
        status: "success",
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
      {state.status === "success" && state.message ? (
        <p className="mt-2 text-[11px] font-medium text-emerald-700">{state.message}</p>
      ) : null}
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
              if (state.status === "error") setState({ status: "idle" });
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
