import { NextResponse } from "next/server";

import { getOwnedCompanyForJobs } from "@/lib/jobs/company-management";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    jobId: string;
  }>;
};

const allowedActions = ["close", "publish", "reopen", "draft"] as const;
type StatusAction = (typeof allowedActions)[number];

function isStatusAction(value: unknown): value is StatusAction {
  return typeof value === "string" && allowedActions.includes(value as StatusAction);
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const body = (await request.json()) as { action?: unknown };
    const { jobId } = await context.params;

    if (!isStatusAction(body.action)) {
      return NextResponse.json(
        { message: "Unsupported job status action.", status: "error" },
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
        { message: "You must be signed in as a company to manage jobs.", status: "error" },
        { status: 401 },
      );
    }

    const company = await getOwnedCompanyForJobs(supabase, user.id);

    if (!company) {
      return NextResponse.json(
        { message: "Only company owners can manage jobs.", status: "error" },
        { status: 403 },
      );
    }

    const now = new Date().toISOString();
    const update =
      body.action === "close"
        ? { closed_at: now, status: "closed" }
        : body.action === "draft"
          ? { closed_at: null, published_at: null, status: "draft" }
          : { closed_at: null, published_at: now, status: "published" };

    const { data, error } = await supabase
      .from("jobs")
      .update(update as never)
      .eq("id", jobId)
      .eq("company_id", company.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { message: `Could not update job status: ${error.message}`, status: "error" },
        { status: 400 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { message: "Job not found or not owned by your company.", status: "error" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message:
        body.action === "close"
          ? "Job closed."
          : body.action === "draft"
            ? "Job moved to draft."
            : "Job published.",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not update job status.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
