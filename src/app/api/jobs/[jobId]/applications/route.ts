import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getJobApplicationFieldErrors,
  jobApplicationSchema,
} from "@/lib/validators/job-application";

type RouteContext = {
  params: Promise<{
    jobId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { jobId } = await context.params;
    const formData = await request.formData();
    const parsed = jobApplicationSchema.safeParse({
      externalCvUrl: formData.get("externalCvUrl") || "",
      message: formData.get("message"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { errors: getJobApplicationFieldErrors(parsed.error), status: "error" },
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
        { message: "You must be signed in to apply.", status: "error" },
        { status: 401 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, profile_type")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { message: `Could not load profile: ${profileError.message}`, status: "error" },
        { status: 400 },
      );
    }

    if (!profile || (profile as { profile_type?: string }).profile_type !== "professional") {
      return NextResponse.json(
        { message: "Only professional profiles can apply to jobs.", status: "error" },
        { status: 403 },
      );
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, application_mode")
      .eq("id", jobId)
      .eq("status", "published")
      .maybeSingle();

    if (jobError) {
      return NextResponse.json(
        { message: `Could not load job: ${jobError.message}`, status: "error" },
        { status: 400 },
      );
    }

    if (!job) {
      return NextResponse.json(
        { message: "This job is not available for applications.", status: "error" },
        { status: 404 },
      );
    }

    if ((job as { application_mode?: string }).application_mode === "external") {
      return NextResponse.json(
        { message: "This job uses an external application flow.", status: "error" },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const { data: application, error } = await supabase
      .from("job_applications")
      .insert([
        {
          applicant_profile_id: user.id,
          external_cv_url: data.externalCvUrl || null,
          job_id: jobId,
          message: data.message,
        },
      ] as never[])
      .select("id, status")
      .single();

    if (error) {
      const duplicate =
        error.code === "23505" || error.message.toLowerCase().includes("duplicate");

      return NextResponse.json(
        {
          message: duplicate
            ? "You have already applied to this job."
            : `Could not submit application: ${error.message}`,
          status: "error",
        },
        { status: duplicate ? 409 : 400 },
      );
    }

    return NextResponse.json({
      applicationId: (application as { id: string }).id,
      message: "Application submitted.",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not submit application.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
