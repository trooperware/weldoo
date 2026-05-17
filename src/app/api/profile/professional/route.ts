import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getProfessionalProfileFieldErrors,
  professionalProfileSchema,
} from "@/lib/validators/professional-profile";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = professionalProfileSchema.safeParse({
      availability: formData.get("availability"),
      avatarUrl: formData.get("avatarUrl"),
      bio: formData.get("bio"),
      certifications: formData.get("certifications"),
      coverUrl: formData.get("coverUrl"),
      displayName: formData.get("displayName"),
      headline: formData.get("headline"),
      location: formData.get("location"),
      materials: formData.get("materials"),
      positions: formData.get("positions"),
      travelAvailability: formData.get("travelAvailability"),
      websiteUrl: formData.get("websiteUrl"),
      weldingProcesses: formData.get("weldingProcesses"),
      workPreferences: formData.get("workPreferences"),
      yearsExperience: formData.get("yearsExperience"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          errors: getProfessionalProfileFieldErrors(parsed.error),
          status: "error",
        },
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
        { message: "You must be signed in to edit your profile.", status: "error" },
        { status: 401 },
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

    if (!profile || (profile as { profile_type?: string }).profile_type !== "professional") {
      return NextResponse.json(
        { message: "Only professional profiles can be edited here.", status: "error" },
        { status: 403 },
      );
    }

    const data = parsed.data;
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: data.avatarUrl ?? null,
        bio: data.bio ?? null,
        cover_url: data.coverUrl ?? null,
        display_name: data.displayName,
        headline: data.headline ?? null,
        location: data.location ?? null,
        website_url: data.websiteUrl ?? null,
      } as never)
      .eq("id", user.id);

    if (profileUpdateError) {
      return NextResponse.json(
        {
          message: `Could not update base profile: ${profileUpdateError.message}`,
          status: "error",
        },
        { status: 400 },
      );
    }

    const { error: professionalUpdateError } = await supabase
      .from("professional_profiles")
      .upsert([
        {
          availability: data.availability,
          certifications: data.certifications,
          materials: data.materials,
          positions: data.positions,
          profile_id: user.id,
          travel_availability: data.travelAvailability,
          welding_processes: data.weldingProcesses,
          work_preferences: data.workPreferences,
          years_experience: data.yearsExperience ?? null,
        },
      ] as never[]);

    if (professionalUpdateError) {
      return NextResponse.json(
        {
          message: `Could not update professional profile: ${professionalUpdateError.message}`,
          status: "error",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Profile saved.",
      publicProfileUrl: `/professionals/${user.id}`,
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not save profile.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
