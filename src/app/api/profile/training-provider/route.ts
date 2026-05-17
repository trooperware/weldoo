import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getTrainingProviderProfileFieldErrors,
  trainingProviderProfileSchema,
} from "@/lib/validators/training-provider-profile";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = trainingProviderProfileSchema.safeParse({
      contactEmail: formData.get("contactEmail"),
      coverUrl: formData.get("coverUrl"),
      description: formData.get("description"),
      location: formData.get("location"),
      logoUrl: formData.get("logoUrl"),
      name: formData.get("name"),
      trainingTypes: formData.get("trainingTypes"),
      websiteUrl: formData.get("websiteUrl"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          errors: getTrainingProviderProfileFieldErrors(parsed.error),
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
        {
          message: "You must be signed in to edit your training provider profile.",
          status: "error",
        },
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

    if (!profile || (profile as { profile_type?: string }).profile_type !== "training_provider") {
      return NextResponse.json(
        { message: "Only training provider profiles can be edited here.", status: "error" },
        { status: 403 },
      );
    }

    const data = parsed.data;
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: data.logoUrl ?? null,
        bio: data.description ?? null,
        cover_url: data.coverUrl ?? null,
        display_name: data.name,
        headline: data.trainingTypes.join(", ") || null,
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

    const providerPayload = {
      contact_email: data.contactEmail ?? null,
      cover_url: data.coverUrl ?? null,
      description: data.description ?? null,
      location: data.location ?? null,
      logo_url: data.logoUrl ?? null,
      name: data.name,
      owner_profile_id: user.id,
      training_types: data.trainingTypes,
      website_url: data.websiteUrl ?? null,
    };

    const { data: existingProvider, error: providerReadError } = await supabase
      .from("training_providers")
      .select("id")
      .eq("owner_profile_id", user.id)
      .maybeSingle();

    if (providerReadError) {
      return NextResponse.json(
        {
          message: `Could not load training provider profile: ${providerReadError.message}`,
          status: "error",
        },
        { status: 400 },
      );
    }

    let trainingProviderId = (existingProvider as { id: string } | null)?.id;

    if (trainingProviderId) {
      const { error: providerUpdateError } = await supabase
        .from("training_providers")
        .update(providerPayload as never)
        .eq("id", trainingProviderId);

      if (providerUpdateError) {
        return NextResponse.json(
          {
            message: `Could not update training provider profile: ${providerUpdateError.message}`,
            status: "error",
          },
          { status: 400 },
        );
      }
    } else {
      const { data: insertedProvider, error: providerInsertError } = await supabase
        .from("training_providers")
        .insert([providerPayload] as never[])
        .select("id")
        .single();

      if (providerInsertError) {
        return NextResponse.json(
          {
            message: `Could not create training provider profile: ${providerInsertError.message}`,
            status: "error",
          },
          { status: 400 },
        );
      }

      trainingProviderId = (insertedProvider as { id: string }).id;
    }

    return NextResponse.json({
      message: "Training provider profile saved.",
      publicProfileUrl: `/training-providers/${trainingProviderId}`,
      status: "success",
      trainingProviderId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not save training provider profile.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
