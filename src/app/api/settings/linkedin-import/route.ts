import { NextResponse } from "next/server";

import { getLinkedInProfileImport } from "@/lib/auth/linkedin-profile-import";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const IMPORTABLE_FIELDS = [
  "avatarUrl",
  "bio",
  "displayName",
  "headline",
  "location",
  "websiteUrl",
  "yearsExperience",
] as const;

type ImportableField = (typeof IMPORTABLE_FIELDS)[number];

function isImportableField(value: FormDataEntryValue): value is ImportableField {
  return typeof value === "string" && IMPORTABLE_FIELDS.includes(value as ImportableField);
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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
      bio?: string;
      display_name?: string;
      headline?: string;
      location?: string;
      website_url?: string;
    } = {};
    const professionalUpdates: {
      profile_id: string;
      years_experience?: number;
    } = {
      profile_id: user.id,
    };

    if (
      selectedFields.has("avatarUrl") &&
      linkedInImport.avatarUrl &&
      isHttpUrl(linkedInImport.avatarUrl)
    ) {
      updates.avatar_url = linkedInImport.avatarUrl;
    }

    if (selectedFields.has("bio") && linkedInImport.bio) {
      updates.bio = truncate(linkedInImport.bio, 3000);
    }

    if (
      selectedFields.has("displayName") &&
      linkedInImport.displayName &&
      linkedInImport.displayName.length >= 2
    ) {
      updates.display_name = truncate(linkedInImport.displayName, 120);
    }

    if (selectedFields.has("headline") && linkedInImport.headline) {
      updates.headline = truncate(linkedInImport.headline, 180);
    }

    if (selectedFields.has("location") && linkedInImport.location) {
      updates.location = truncate(linkedInImport.location, 160);
    }

    if (
      selectedFields.has("websiteUrl") &&
      linkedInImport.websiteUrl &&
      isHttpUrl(linkedInImport.websiteUrl)
    ) {
      updates.website_url = linkedInImport.websiteUrl;
    }

    if (
      selectedFields.has("yearsExperience") &&
      typeof linkedInImport.yearsExperience === "number"
    ) {
      professionalUpdates.years_experience = linkedInImport.yearsExperience;
    }

    const hasBaseUpdates = Object.keys(updates).length > 0;
    const hasProfessionalUpdates = "years_experience" in professionalUpdates;

    if (!hasBaseUpdates && !hasProfessionalUpdates) {
      return NextResponse.json(
        { message: "Choose at least one available LinkedIn field to import.", status: "error" },
        { status: 400 },
      );
    }

    const { data: profile, error: profileReadError } = await supabase
      .from("profiles")
      .select("id, profile_type")
      .eq("id", user.id)
      .maybeSingle();

    if (profileReadError) {
      return NextResponse.json(
        { message: `Could not load profile: ${profileReadError.message}`, status: "error" },
        { status: 400 },
      );
    }

    if (!profile) {
      return NextResponse.json(
        { message: "Complete onboarding before importing LinkedIn profile data.", status: "error" },
        { status: 403 },
      );
    }

    if (
      hasProfessionalUpdates &&
      (profile as { profile_type?: string }).profile_type !== "professional"
    ) {
      return NextResponse.json(
        {
          message: "Years of experience can only be imported into a professional profile.",
          status: "error",
        },
        { status: 403 },
      );
    }

    if (hasBaseUpdates) {
      const { error } = await supabase.from("profiles").update(updates as never).eq("id", user.id);

      if (error) {
        return NextResponse.json(
          { message: `Could not update profile: ${error.message}`, status: "error" },
          { status: 400 },
        );
      }
    }

    if (hasProfessionalUpdates) {
      const { error } = await supabase
        .from("professional_profiles")
        .upsert([professionalUpdates] as never[]);

      if (error) {
        return NextResponse.json(
          { message: `Could not update professional profile: ${error.message}`, status: "error" },
          { status: 400 },
        );
      }
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
