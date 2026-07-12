import Link from "next/link";

import { NetworkInvitationActions } from "@/components/network/network-invitation-actions";
import type { NetworkInvitationItem } from "@/lib/network/queries";

type NetworkInvitationsSummaryProps = {
  invitations: NetworkInvitationItem[];
};

type NetworkInvitationsListProps = {
  invitations: NetworkInvitationItem[];
  mode: "received" | "sent";
};

function InvitationAvatar({
  invitation,
  size = "summary",
}: {
  invitation: NetworkInvitationItem;
  size?: "page" | "summary";
}) {
  const sizeClass =
    size === "page"
      ? "h-14 w-14 text-[17px]"
      : "h-[52px] w-[52px] text-base";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#3d3db4,#42b8d4)] font-bold text-white ${sizeClass}`}
    >
      {invitation.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="h-full w-full object-cover" src={invitation.avatarUrl} />
      ) : (
        invitation.initials
      )}
    </div>
  );
}

function InvitationInfo({
  invitation,
  mode = "received",
  size = "summary",
  showMessage = false,
}: {
  invitation: NetworkInvitationItem;
  mode?: "received" | "sent";
  size?: "page" | "summary";
  showMessage?: boolean;
}) {
  const sentDate = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(invitation.createdAt));

  return (
    <div className="min-w-0 flex-1">
      <div
        className={[
          "truncate font-bold text-weldoo-ink",
          size === "page" ? "text-[13.5px] leading-[1.3]" : "text-sm",
        ].join(" ")}
      >
        {invitation.name}
      </div>
      <div
        className={[
          "mt-0.5 truncate",
          size === "page"
            ? "text-[11.5px] font-medium leading-[1.4] text-[#44446a]"
            : "text-xs text-weldoo-muted",
        ].join(" ")}
      >
        {invitation.role}
      </div>
      {mode === "sent" ? (
        <div className="mt-1 text-[11.5px] text-weldoo-muted">Sent {sentDate}</div>
      ) : null}
      {showMessage && invitation.message ? (
        <div className="mt-1.5 text-xs italic leading-5 text-[#44446a]">
          &quot;{invitation.message}&quot;
        </div>
      ) : null}
    </div>
  );
}

export function NetworkInvitationsSummary({
  invitations,
}: NetworkInvitationsSummaryProps) {
  if (!invitations.length) {
    return null;
  }

  return (
    <section className="rounded-xl border border-weldoo-border-light bg-white px-5 py-[18px] shadow-weldoo-sm">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold text-weldoo-ink">
          Invitations ({invitations.length})
        </h2>
        {invitations.length > 3 ? (
          <Link
            className="text-[13px] font-semibold text-weldoo-indigo transition hover:opacity-70"
            href="/network/invitations"
          >
            Show all
          </Link>
        ) : null}
      </div>
      <div>
        {invitations.slice(0, 3).map((invitation, index) => (
          <div
            className={`flex items-center gap-3.5 py-3 ${
              index < Math.min(invitations.length, 3) - 1
                ? "border-b border-[#f0f0f8]"
                : "pb-0"
            }`}
            key={invitation.connectionId}
          >
            <InvitationAvatar invitation={invitation} />
            <InvitationInfo invitation={invitation} />
            <div className="shrink-0">
              <NetworkInvitationActions
                connectionId={invitation.connectionId}
                density="summary"
                mode="received"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function NetworkInvitationsList({
  invitations,
  mode,
}: NetworkInvitationsListProps) {
  if (!invitations.length) {
    return (
      <div className="py-12 text-center text-sm text-weldoo-muted">
        {mode === "received" ? "No pending invitations" : "No sent invitations"}
      </div>
    );
  }

  return (
    <div>
      {invitations.map((invitation, index) => (
        <div
          className={`flex items-center gap-3.5 py-4 ${
            index < invitations.length - 1 ? "border-b border-[#f0f0f8]" : "pb-0"
          }`}
          key={invitation.connectionId}
        >
          <InvitationAvatar invitation={invitation} size="page" />
          <InvitationInfo
            invitation={invitation}
            mode={mode}
            size="page"
            showMessage={mode === "received"}
          />
          <div className="shrink-0">
            <NetworkInvitationActions
              connectionId={invitation.connectionId}
              density="page"
              mode={mode}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
