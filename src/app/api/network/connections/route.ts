import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TablesInsert, Tables } from "@/types/database";

type CreateConnectionPayload = {
  message?: string;
  recipientProfileId?: string;
};

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Sign in to connect.", status: "error" }, { status: 401 });
  }

  const payload = (await request.json()) as CreateConnectionPayload;
  const recipientProfileId = payload.recipientProfileId?.trim();
  const message = payload.message?.trim() || null;

  if (!recipientProfileId) {
    return NextResponse.json(
      { message: "Missing recipient profile.", status: "error" },
      { status: 400 },
    );
  }

  if (recipientProfileId === user.id) {
    return NextResponse.json(
      { message: "You cannot connect with your own profile.", status: "error" },
      { status: 400 },
    );
  }

  if (message && message.length > 1000) {
    return NextResponse.json(
      { message: "Connection note is too long.", status: "error" },
      { status: 400 },
    );
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("id, status, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();
  const profile = currentProfile as Pick<
    Tables<"profiles">,
    "id" | "onboarding_completed" | "status"
  > | null;

  if (!profile?.onboarding_completed || profile.status !== "active") {
    return NextResponse.json(
      { message: "Complete your profile before sending connection requests.", status: "error" },
      { status: 403 },
    );
  }

  const insertPayload: TablesInsert<"connections"> = {
    message,
    recipient_profile_id: recipientProfileId,
    requester_profile_id: user.id,
    status: "pending",
  };

  const { data, error } = await supabase
    .from("connections")
    .insert([insertPayload] as never)
    .select("id")
    .single();

  if (error) {
    const duplicate = error.code === "23505";
    return NextResponse.json(
      {
        message: duplicate
          ? "There is already an active connection request with this profile."
          : error.message,
        status: "error",
      },
      { status: duplicate ? 409 : 400 },
    );
  }
  const connection = data as Pick<Tables<"connections">, "id">;

  return NextResponse.json({
    connectionId: connection.id,
    message: "Connection request sent.",
    status: "success",
  });
}
