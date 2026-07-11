import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ResetActivityPayload = {
  confirmation?: string;
};

type TableName = keyof Database["public"]["Tables"];

async function selectIds(
  supabase: SupabaseClient<Database>,
  table: TableName,
  column: string,
  value: string,
) {
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq(column, value);

  if (error) throw error;

  return (data as Array<{ id: string }>).map((row) => row.id);
}

async function selectIdsIn(
  supabase: SupabaseClient<Database>,
  table: TableName,
  column: string,
  values: string[],
) {
  if (values.length === 0) return [];

  const { data, error } = await supabase
    .from(table)
    .select("id")
    .in(column, values);

  if (error) throw error;

  return (data as Array<{ id: string }>).map((row) => row.id);
}

async function deleteByColumn(
  supabase: SupabaseClient<Database>,
  table: TableName,
  column: string,
  value: string,
) {
  const { error } = await supabase.from(table).delete().eq(column, value);

  if (error) throw error;
}

async function deleteByOr(
  supabase: SupabaseClient<Database>,
  table: TableName,
  expression: string,
) {
  const { error } = await supabase.from(table).delete().or(expression);

  if (error) throw error;
}

async function deleteByIds(
  supabase: SupabaseClient<Database>,
  table: TableName,
  ids: string[],
) {
  if (ids.length === 0) return;

  const { error } = await supabase.from(table).delete().in("id", ids);

  if (error) throw error;
}

async function deleteByColumnIn(
  supabase: SupabaseClient<Database>,
  table: TableName,
  column: string,
  values: string[],
) {
  if (values.length === 0) return;

  const { error } = await supabase.from(table).delete().in(column, values);

  if (error) throw error;
}

function uniqueIds(ids: string[]) {
  return [...new Set(ids)];
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as ResetActivityPayload;

    if (payload.confirmation !== "RESET") {
      return NextResponse.json(
        { message: "Type RESET to confirm activity reset.", status: "error" },
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
        { message: "You must be signed in to reset test activity.", status: "error" },
        { status: 401 },
      );
    }

    const profileId = user.id;
    const adminSupabase = createSupabaseAdminClient();

    const [companyIds, trainingProviderIds, authoredPostIds, participantRows] =
      await Promise.all([
        selectIds(adminSupabase, "companies", "owner_profile_id", profileId),
        selectIds(adminSupabase, "training_providers", "owner_profile_id", profileId),
        selectIds(adminSupabase, "posts", "author_profile_id", profileId),
        adminSupabase
          .from("message_conversation_participants")
          .select("conversation_id")
          .eq("profile_id", profileId),
      ]);

    if (participantRows.error) throw participantRows.error;

    const conversationIds = uniqueIds(
      (participantRows.data as Array<{ conversation_id: string }>).map(
        (row) => row.conversation_id,
      ),
    );
    const ownedJobIds = uniqueIds([
      ...(await selectIds(adminSupabase, "jobs", "created_by_profile_id", profileId)),
      ...(await selectIdsIn(adminSupabase, "jobs", "company_id", companyIds)),
    ]);
    const ownedCourseEventIds = uniqueIds([
      ...(await selectIds(
        adminSupabase,
        "course_events",
        "created_by_profile_id",
        profileId,
      )),
      ...(await selectIdsIn(
        adminSupabase,
        "course_events",
        "training_provider_id",
        trainingProviderIds,
      )),
    ]);

    await deleteByOr(
      adminSupabase,
      "notifications",
      `recipient_profile_id.eq.${profileId},actor_profile_id.eq.${profileId}`,
    );
    await deleteByOr(
      adminSupabase,
      "reports",
      `reporter_profile_id.eq.${profileId},profile_id.eq.${profileId}`,
    );
    await deleteByIds(adminSupabase, "message_conversations", conversationIds);
    await deleteByOr(
      adminSupabase,
      "contact_requests",
      `sender_profile_id.eq.${profileId},recipient_profile_id.eq.${profileId}`,
    );
    await deleteByOr(
      adminSupabase,
      "connections",
      `requester_profile_id.eq.${profileId},recipient_profile_id.eq.${profileId}`,
    );
    await deleteByColumn(adminSupabase, "likes", "profile_id", profileId);
    await deleteByColumn(adminSupabase, "comments", "author_profile_id", profileId);
    await deleteByColumn(adminSupabase, "saved_items", "profile_id", profileId);
    await deleteByColumn(adminSupabase, "job_applications", "applicant_profile_id", profileId);
    await deleteByColumnIn(adminSupabase, "job_applications", "job_id", ownedJobIds);
    await deleteByColumn(adminSupabase, "course_event_interests", "profile_id", profileId);
    await deleteByColumnIn(
      adminSupabase,
      "course_event_interests",
      "course_event_id",
      ownedCourseEventIds,
    );
    await deleteByIds(adminSupabase, "jobs", ownedJobIds);
    await deleteByIds(adminSupabase, "course_events", ownedCourseEventIds);
    await deleteByIds(adminSupabase, "posts", authoredPostIds);

    return NextResponse.json({
      message: "Test activity reset.",
      redirectTo: "/settings?status=activity-reset",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not reset test activity.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
