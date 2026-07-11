import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

type ContactRequestAction = "accept" | "archive" | "mark_read" | "reject" | "unarchive";

type UpdateContactRequestPayload = {
  action?: ContactRequestAction;
};

type ContactRequestRouteProps = {
  params: Promise<{
    contactRequestId: string;
  }>;
};

export async function PATCH(request: Request, { params }: ContactRequestRouteProps) {
  const { contactRequestId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Sign in to continue.", status: "error" }, { status: 401 });
  }

  const payload = (await request.json()) as UpdateContactRequestPayload;

  if (
    !payload.action ||
    !["accept", "archive", "mark_read", "reject", "unarchive"].includes(payload.action)
  ) {
    return NextResponse.json(
      { message: "Invalid contact request action.", status: "error" },
      { status: 400 },
    );
  }

  const { data: contactRequest, error: loadError } = await supabase
    .from("contact_requests")
    .select("id, sender_profile_id, recipient_profile_id, read_at, archived_at")
    .eq("id", contactRequestId)
    .maybeSingle();

  if (loadError || !contactRequest) {
    return NextResponse.json(
      { message: "Contact request not found.", status: "error" },
      { status: 404 },
    );
  }

  const requestRow = contactRequest as Pick<
    Tables<"contact_requests">,
    "archived_at" | "id" | "read_at" | "recipient_profile_id" | "sender_profile_id"
  >;
  const isRecipient = requestRow.recipient_profile_id === user.id;

  if (!isRecipient) {
    return NextResponse.json(
      { message: "Only the recipient can update this contact request.", status: "error" },
      { status: 403 },
    );
  }

  const now = new Date().toISOString();
  let connectionAccepted = false;

  if (payload.action === "accept") {
    const { data: existingConnection, error: connectionLoadError } = await supabase
      .from("connections")
      .select("id, status")
      .or(
        `and(requester_profile_id.eq.${requestRow.sender_profile_id},recipient_profile_id.eq.${requestRow.recipient_profile_id}),and(requester_profile_id.eq.${requestRow.recipient_profile_id},recipient_profile_id.eq.${requestRow.sender_profile_id})`,
      )
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (connectionLoadError) {
      return NextResponse.json(
        { message: connectionLoadError.message, status: "error" },
        { status: 400 },
      );
    }

    const connection = existingConnection as Pick<
      Tables<"connections">,
      "id" | "status"
    > | null;

    if (connection) {
      if (connection.status === "pending") {
        const { error: connectionUpdateError } = await supabase
          .from("connections")
          .update({
            responded_at: now,
            status: "accepted",
          } satisfies TablesUpdate<"connections"> as never)
          .eq("id", connection.id);

        if (connectionUpdateError) {
          return NextResponse.json(
            { message: connectionUpdateError.message, status: "error" },
            { status: 400 },
          );
        }
      }
    } else {
      const insertPayload: TablesInsert<"connections"> = {
        message: null,
        recipient_profile_id: requestRow.sender_profile_id,
        requester_profile_id: user.id,
        responded_at: now,
        status: "accepted",
      };

      const { error: connectionInsertError } = await supabase
        .from("connections")
        .insert([insertPayload] as never);

      if (connectionInsertError) {
        return NextResponse.json(
          { message: connectionInsertError.message, status: "error" },
          { status: 400 },
        );
      }
    }

    connectionAccepted = true;
  }

  const updatePayload: TablesUpdate<"contact_requests"> =
    payload.action === "mark_read"
      ? { read_at: requestRow.read_at ?? now }
      : payload.action === "unarchive"
        ? { archived_at: null }
        : { archived_at: requestRow.archived_at ?? now, read_at: requestRow.read_at ?? now };

  const { error } = await supabase
    .from("contact_requests")
    .update(updatePayload as never)
    .eq("id", contactRequestId);

  if (error) {
    return NextResponse.json({ message: error.message, status: "error" }, { status: 400 });
  }

  return NextResponse.json({
    message:
      payload.action === "accept"
        ? connectionAccepted
          ? "Contact request accepted."
          : "Contact request updated."
        : payload.action === "mark_read"
        ? "Contact request marked as read."
        : payload.action === "reject"
          ? "Contact request declined."
        : payload.action === "archive"
          ? "Contact request archived."
          : "Contact request restored.",
    status: "success",
  });
}
