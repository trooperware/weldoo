import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingFieldErrors, onboardingSchema } from "@/lib/validators/onboarding";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = onboardingSchema.safeParse({
      avatarUrl: formData.get("avatarUrl"),
      displayName: formData.get("displayName"),
      headline: formData.get("headline"),
      location: formData.get("location"),
      organizationName: formData.get("organizationName"),
      profileType: formData.get("profileType"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { errors: getOnboardingFieldErrors(parsed.error), status: "error" },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: "You must be signed in to complete onboarding.", status: "error" },
        { status: 401 },
      );
    }

    const { avatarUrl, displayName, headline, location, organizationName, profileType } = parsed.data;
    const organizationDisplayName = organizationName ?? displayName;
    const publicDisplayName =
      profileType === "professional" ? displayName : organizationDisplayName;

    const { error: profileError } = await supabase.from("profiles").upsert([
      {
        display_name: publicDisplayName,
        avatar_url: avatarUrl ?? null,
        headline: headline ?? null,
        id: user.id,
        location: location || null,
        onboarding_completed: true,
        profile_type: profileType,
        status: "active",
      },
    ] as never[]);

    if (profileError) {
      return NextResponse.json(
        { message: `Could not save base profile: ${profileError.message}`, status: "error" },
        { status: 400 },
      );
    }

    if (profileType === "professional") {
      const { error } = await supabase.from("professional_profiles").upsert([
        {
          profile_id: user.id,
        },
      ] as never[]);

      if (error) {
        return NextResponse.json(
          { message: `Could not save professional profile: ${error.message}`, status: "error" },
          { status: 400 },
        );
      }
    }

    if (profileType === "company") {
      const { data: existingCompany, error: existingError } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_profile_id", user.id)
        .maybeSingle();

      if (existingError) {
        return NextResponse.json(
          { message: `Could not check existing company: ${existingError.message}`, status: "error" },
          { status: 400 },
        );
      }

      const existingCompanyId = (existingCompany as { id: string } | null)?.id;

      if (existingCompanyId) {
        const { error } = await supabase
          .from("companies")
          .update({
            location: location || null,
            name: organizationDisplayName,
          } as never)
          .eq("id", existingCompanyId);

        if (error) {
          return NextResponse.json(
            { message: `Could not update company: ${error.message}`, status: "error" },
            { status: 400 },
          );
        }
      } else {
        const { error } = await supabase.from("companies").insert([
          {
            location: location || null,
            name: organizationDisplayName,
            owner_profile_id: user.id,
          },
        ] as never[]);

        if (error) {
          return NextResponse.json(
            { message: `Could not create company: ${error.message}`, status: "error" },
            { status: 400 },
          );
        }
      }
    }

    if (profileType === "training_provider") {
      const { data: existingProvider, error: existingError } = await supabase
        .from("training_providers")
        .select("id")
        .eq("owner_profile_id", user.id)
        .maybeSingle();

      if (existingError) {
        return NextResponse.json(
          {
            message: `Could not check existing training provider: ${existingError.message}`,
            status: "error",
          },
          { status: 400 },
        );
      }

      const existingProviderId = (existingProvider as { id: string } | null)?.id;

      if (existingProviderId) {
        const { error } = await supabase
          .from("training_providers")
          .update({
            location: location || null,
            name: organizationDisplayName,
          } as never)
          .eq("id", existingProviderId);

        if (error) {
          return NextResponse.json(
            { message: `Could not update training provider: ${error.message}`, status: "error" },
            { status: 400 },
          );
        }
      } else {
        const { error } = await supabase.from("training_providers").insert([
          {
            location: location || null,
            name: organizationDisplayName,
            owner_profile_id: user.id,
          },
        ] as never[]);

        if (error) {
          return NextResponse.json(
            { message: `Could not create training provider: ${error.message}`, status: "error" },
            { status: 400 },
          );
        }
      }
    }

    return NextResponse.json({ redirectTo: "/", status: "success" });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not complete onboarding.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
