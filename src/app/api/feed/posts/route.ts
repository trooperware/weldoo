import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPostFieldErrors, postSchema } from "@/lib/validators/post";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = postSchema.safeParse({
      body: formData.get("body"),
      imageUrl: formData.get("imageUrl"),
      tags: formData.get("tags"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          errors: getPostFieldErrors(parsed.error),
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
        { message: "You must be signed in to publish posts.", status: "error" },
        { status: 401 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, onboarding_completed, status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { message: `Could not load profile: ${profileError.message}`, status: "error" },
        { status: 400 },
      );
    }

    const currentProfile = profile as {
      onboarding_completed: boolean;
      status: string;
    } | null;

    if (!currentProfile?.onboarding_completed || currentProfile.status !== "active") {
      return NextResponse.json(
        { message: "Complete onboarding before publishing posts.", status: "error" },
        { status: 403 },
      );
    }

    const data = parsed.data;
    const { error: insertError } = await supabase.from("posts").insert([
      {
        author_profile_id: user.id,
        body: data.body,
        image_url: data.imageUrl ?? null,
        status: "published",
        tags: data.tags,
      },
    ] as never[]);

    if (insertError) {
      return NextResponse.json(
        { message: `Could not publish post: ${insertError.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Post published.",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not publish post.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
