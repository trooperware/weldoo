import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables, TablesUpdate } from "@/types/database";

type ContactRequestAction = "archive" | "mark_read" | "unarchive";

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

  if (!payload.action || !["archive", "mark_read", "unarchive"].includes(payload.action)) {
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
  const updatePayload: TablesUpdate<"contact_requests"> =
    payload.action === "mark_read"
      ? { read_at: requestRow.read_at ?? now }
      : payload.action === "archive"
        ? { archived_at: requestRow.archived_at ?? now, read_at: requestRow.read_at ?? now }
        : { archived_at: null };

  const { error } = await supabase
    .from("contact_requests")
    .update(updatePayload as never)
    .eq("id", contactRequestId);

  if (error) {
    return NextResponse.json({ message: error.message, status: "error" }, { status: 400 });
  }

  return NextResponse.json({
    message:
      payload.action === "mark_read"
        ? "Contact request marked as read."
        : payload.action === "archive"
          ? "Contact request archived."
          : "Contact request restored.",
    status: "success",
  });
}
