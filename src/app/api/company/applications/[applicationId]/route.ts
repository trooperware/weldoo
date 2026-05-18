import { NextResponse } from "next/server";

import { getOwnedCompanyForJobs } from "@/lib/jobs/company-management";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

type RouteContext = {
  params: Promise<{
    applicationId: string;
  }>;
};

const statuses = ["viewed", "contacted", "rejected"] as const;

function isStatus(value: unknown): value is (typeof statuses)[number] {
  return typeof value === "string" && statuses.includes(value as (typeof statuses)[number]);
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { applicationId } = await context.params;
    const body = (await request.json()) as { status?: unknown };

    if (!isStatus(body.status)) {
      return NextResponse.json(
        { message: "Unsupported application status.", status: "error" },
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
        { message: "You must be signed in as a company.", status: "error" },
        { status: 401 },
      );
    }

    const company = await getOwnedCompanyForJobs(supabase, user.id);

    if (!company) {
      return NextResponse.json(
        { message: "Only company owners can update applications.", status: "error" },
        { status: 403 },
      );
    }

    const { data: application, error: readError } = await supabase
      .from("job_applications")
      .select("id, jobs!inner(company_id)")
      .eq("id", applicationId)
      .eq("jobs.company_id", company.id)
      .maybeSingle();

    if (readError) {
      return NextResponse.json(
        { message: `Could not load application: ${readError.message}`, status: "error" },
        { status: 400 },
      );
    }

    if (!application) {
      return NextResponse.json(
        { message: "Application not found for your company.", status: "error" },
        { status: 404 },
      );
    }

    const nextStatus: Enums<"application_status"> = body.status;
    const { error } = await supabase
      .from("job_applications")
      .update({
        status: nextStatus,
        viewed_at: nextStatus === "viewed" ? new Date().toISOString() : undefined,
      } as never)
      .eq("id", applicationId);

    if (error) {
      return NextResponse.json(
        { message: `Could not update application: ${error.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Application status updated.",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not update application.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
