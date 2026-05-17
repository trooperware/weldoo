import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/types/database";

type CreateContactRequestPayload = {
  message?: string;
  recipientProfileId?: string;
};

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Sign in to send a contact request.", status: "error" }, { status: 401 });
  }

  const payload = (await request.json()) as CreateContactRequestPayload;
  const recipientProfileId = payload.recipientProfileId?.trim();
  const message = payload.message?.trim() ?? "";

  if (!recipientProfileId) {
    return NextResponse.json(
      { message: "Missing recipient profile.", status: "error" },
      { status: 400 },
    );
  }

  if (recipientProfileId === user.id) {
    return NextResponse.json(
      { message: "You cannot contact your own profile.", status: "error" },
      { status: 400 },
    );
  }

  if (message.length < 1 || message.length > 1000) {
    return NextResponse.json(
      { message: "Contact message must be between 1 and 1000 characters.", status: "error" },
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
      { message: "Complete your profile before sending contact requests.", status: "error" },
      { status: 403 },
    );
  }

  const insertPayload: TablesInsert<"contact_requests"> = {
    message,
    recipient_profile_id: recipientProfileId,
    sender_profile_id: user.id,
  };

  const { data, error } = await supabase
    .from("contact_requests")
    .insert([insertPayload] as never)
    .select("id")
    .single();

  if (error) {
    const duplicate = error.code === "23505";
    return NextResponse.json(
      {
        message: duplicate
          ? "There is already an open contact request with this profile."
          : error.message,
        status: "error",
      },
      { status: duplicate ? 409 : 400 },
    );
  }

  const contactRequest = data as Pick<Tables<"contact_requests">, "id">;

  return NextResponse.json({
    contactRequestId: contactRequest.id,
    message: "Contact request sent.",
    status: "success",
  });
}
