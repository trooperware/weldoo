"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Modal, Textarea } from "@/components/ui";

type ProfileMessageButtonProps = {
  canMessage: boolean;
  recipientName: string;
  recipientProfileId: string;
};

export function ProfileMessageButton({
  canMessage,
  recipientName,
  recipientProfileId,
}: ProfileMessageButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!canMessage) {
    return null;
  }

  async function sendMessage() {
    const trimmedMessage = message.trim();

    if (trimmedMessage.length < 1) {
      setErrorMessage("Write a message before sending.");
      return;
    }

    if (trimmedMessage.length > 4000) {
      setErrorMessage("Message must be 4000 characters or fewer.");
      return;
    }

    setPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/messages/conversations", {
        body: JSON.stringify({
          message: trimmedMessage,
          recipientProfileId,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as {
        conversationId?: string;
        message?: string;
        status?: string;
      };

      if (!response.ok || !payload.conversationId) {
        setErrorMessage(payload.message ?? "Unable to send the message.");
        return;
      }

      setOpen(false);
      setMessage("");
      router.push(`/messages?conversation=${payload.conversationId}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        className="inline-flex h-9 items-center justify-center gap-2 rounded-full border-[1.5px] border-weldoo-indigo bg-transparent px-4 text-[12.1px] font-semibold tracking-[-0.01em] text-weldoo-indigo transition hover:bg-weldoo-indigo/[0.05]"
        onClick={() => setOpen(true)}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
        Message
      </button>
      <Modal
        description="Send a private message to this connection."
        footer={
          <>
            <Button disabled={pending} onClick={() => setOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button disabled={pending} onClick={sendMessage}>
              {pending ? "Sending" : "Send message"}
            </Button>
          </>
        }
        onOpenChange={setOpen}
        open={open}
        title={`Message ${recipientName}`}
      >
        <div className="space-y-3">
          <Textarea
            error={errorMessage ?? undefined}
            id={`profile-message-${recipientProfileId}`}
            label="Message"
            maxLength={4000}
            onChange={(event) => {
              setMessage(event.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Write a private message."
            value={message}
          />
          <p className="text-right text-xs font-medium text-weldoo-muted">
            {message.length}/4000
          </p>
        </div>
      </Modal>
    </>
  );
}
