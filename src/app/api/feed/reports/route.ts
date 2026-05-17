import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getReportFieldErrors, reportSchema } from "@/lib/validators/report";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = reportSchema.safeParse({
      commentId: formData.get("commentId"),
      note: formData.get("note"),
      postId: formData.get("postId"),
      reason: formData.get("reason"),
      targetType: formData.get("targetType"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          errors: getReportFieldErrors(parsed.error),
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
        { message: "You must be signed in to report content.", status: "error" },
        { status: 401 },
      );
    }

    const data = parsed.data;
    const reportPayload =
      data.targetType === "post"
        ? {
            comment_id: null,
            note: data.note ?? null,
            post_id: data.postId,
            reason: data.reason,
            reporter_profile_id: user.id,
            status: "open",
            target_type: "post",
          }
        : {
            comment_id: data.commentId,
            note: data.note ?? null,
            post_id: null,
            reason: data.reason,
            reporter_profile_id: user.id,
            status: "open",
            target_type: "comment",
          };

    const { error: insertError } = await supabase.from("reports").insert([
      reportPayload,
    ] as never[]);

    if (insertError && insertError.code === "23505") {
      return NextResponse.json(
        {
          message: "You have already reported this content. The report is pending review.",
          status: "error",
        },
        { status: 409 },
      );
    }

    if (insertError) {
      return NextResponse.json(
        { message: `Could not submit report: ${insertError.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Report submitted for review.",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not submit report.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
