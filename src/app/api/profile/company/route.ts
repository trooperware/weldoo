import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  companyProfileSchema,
  getCompanyProfileFieldErrors,
} from "@/lib/validators/company-profile";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = companyProfileSchema.safeParse({
      companySize: formData.get("companySize"),
      contactEmail: formData.get("contactEmail"),
      coverUrl: formData.get("coverUrl"),
      description: formData.get("description"),
      location: formData.get("location"),
      logoUrl: formData.get("logoUrl"),
      name: formData.get("name"),
      sector: formData.get("sector"),
      websiteUrl: formData.get("websiteUrl"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          errors: getCompanyProfileFieldErrors(parsed.error),
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
        { message: "You must be signed in to edit your company profile.", status: "error" },
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

    if (!profile || (profile as { profile_type?: string }).profile_type !== "company") {
      return NextResponse.json(
        { message: "Only company profiles can be edited here.", status: "error" },
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
        headline: data.sector ?? null,
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

    const companyPayload = {
      company_size: data.companySize ?? null,
      contact_email: data.contactEmail ?? null,
      cover_url: data.coverUrl ?? null,
      description: data.description ?? null,
      location: data.location ?? null,
      logo_url: data.logoUrl ?? null,
      name: data.name,
      owner_profile_id: user.id,
      sector: data.sector ?? null,
      website_url: data.websiteUrl ?? null,
    };

    const { data: existingCompany, error: companyReadError } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_profile_id", user.id)
      .maybeSingle();

    if (companyReadError) {
      return NextResponse.json(
        { message: `Could not load company profile: ${companyReadError.message}`, status: "error" },
        { status: 400 },
      );
    }

    let companyId = (existingCompany as { id: string } | null)?.id;

    if (companyId) {
      const { error: companyUpdateError } = await supabase
        .from("companies")
        .update(companyPayload as never)
        .eq("id", companyId);

      if (companyUpdateError) {
        return NextResponse.json(
          {
            message: `Could not update company profile: ${companyUpdateError.message}`,
            status: "error",
          },
          { status: 400 },
        );
      }
    } else {
      const { data: insertedCompany, error: companyInsertError } = await supabase
        .from("companies")
        .insert([companyPayload] as never[])
        .select("id")
        .single();

      if (companyInsertError) {
        return NextResponse.json(
          {
            message: `Could not create company profile: ${companyInsertError.message}`,
            status: "error",
          },
          { status: 400 },
        );
      }

      companyId = (insertedCompany as { id: string }).id;
    }

    return NextResponse.json({
      companyId,
      message: "Company profile saved.",
      publicProfileUrl: `/companies/${companyId}`,
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not save company profile.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
