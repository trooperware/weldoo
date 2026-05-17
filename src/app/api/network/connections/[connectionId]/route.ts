import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables, TablesUpdate } from "@/types/database";

type ConnectionAction = "accept" | "cancel" | "reject";

type UpdateConnectionPayload = {
  action?: ConnectionAction;
};

type ConnectionRouteProps = {
  params: Promise<{
    connectionId: string;
  }>;
};

export async function PATCH(request: Request, { params }: ConnectionRouteProps) {
  const { connectionId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Sign in to continue.", status: "error" }, { status: 401 });
  }

  const payload = (await request.json()) as UpdateConnectionPayload;

  if (!payload.action || !["accept", "cancel", "reject"].includes(payload.action)) {
    return NextResponse.json(
      { message: "Invalid connection action.", status: "error" },
      { status: 400 },
    );
  }

  const { data: connection, error: loadError } = await supabase
    .from("connections")
    .select("id, requester_profile_id, recipient_profile_id, status")
    .eq("id", connectionId)
    .maybeSingle();

  if (loadError || !connection) {
    return NextResponse.json(
      { message: "Connection request not found.", status: "error" },
      { status: 404 },
    );
  }

  const connectionRow = connection as Pick<
    Tables<"connections">,
    "id" | "recipient_profile_id" | "requester_profile_id" | "status"
  >;

  if (payload.action === "accept" && connectionRow.recipient_profile_id !== user.id) {
    return NextResponse.json(
      { message: "Only the recipient can accept this request.", status: "error" },
      { status: 403 },
    );
  }

  if (payload.action === "reject" && connectionRow.recipient_profile_id !== user.id) {
    return NextResponse.json(
      { message: "Only the recipient can reject this request.", status: "error" },
      { status: 403 },
    );
  }

  if (payload.action === "cancel" && connectionRow.requester_profile_id !== user.id) {
    return NextResponse.json(
      { message: "Only the requester can cancel this request.", status: "error" },
      { status: 403 },
    );
  }

  if (connectionRow.status !== "pending") {
    return NextResponse.json(
      { message: "Only pending requests can be changed here.", status: "error" },
      { status: 400 },
    );
  }

  const nextStatus =
    payload.action === "accept"
      ? "accepted"
      : payload.action === "reject"
        ? "rejected"
        : "cancelled";
  const updatePayload: TablesUpdate<"connections"> = {
    responded_at: payload.action === "cancel" ? null : new Date().toISOString(),
    status: nextStatus,
  };

  const { error } = await supabase
    .from("connections")
    .update(updatePayload as never)
    .eq("id", connectionId);

  if (error) {
    return NextResponse.json({ message: error.message, status: "error" }, { status: 400 });
  }

  return NextResponse.json({
    message:
      payload.action === "accept"
        ? "Connection accepted."
        : payload.action === "reject"
          ? "Connection rejected."
          : "Connection request cancelled.",
    status: "success",
  });
}
