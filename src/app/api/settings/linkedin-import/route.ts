import { NextResponse } from "next/server";

import { getLinkedInProfileImport } from "@/lib/auth/linkedin-profile-import";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const IMPORTABLE_FIELDS = ["avatarUrl", "displayName", "headline"] as const;

type ImportableField = (typeof IMPORTABLE_FIELDS)[number];

function isImportableField(value: FormDataEntryValue): value is ImportableField {
  return typeof value === "string" && IMPORTABLE_FIELDS.includes(value as ImportableField);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const selectedFields = new Set(formData.getAll("fields").filter(isImportableField));
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: "You must be signed in to import LinkedIn profile data.", status: "error" },
        { status: 401 },
      );
    }

    const linkedInImport = getLinkedInProfileImport(user);

    if (!linkedInImport) {
      return NextResponse.json(
        { message: "Connect LinkedIn before importing profile data.", status: "error" },
        { status: 400 },
      );
    }

    const updates: {
      avatar_url?: string;
      display_name?: string;
      headline?: string;
    } = {};

    if (selectedFields.has("avatarUrl") && linkedInImport.avatarUrl) {
      updates.avatar_url = linkedInImport.avatarUrl;
    }

    if (selectedFields.has("displayName") && linkedInImport.displayName) {
      updates.display_name = linkedInImport.displayName;
    }

    if (selectedFields.has("headline") && linkedInImport.headline) {
      updates.headline = linkedInImport.headline;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "Choose at least one available LinkedIn field to import.", status: "error" },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("profiles").update(updates as never).eq("id", user.id);

    if (error) {
      return NextResponse.json(
        { message: `Could not update profile: ${error.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "LinkedIn profile data imported.",
      redirectTo: "/settings/linkedin-import?status=success",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not import LinkedIn profile data.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
