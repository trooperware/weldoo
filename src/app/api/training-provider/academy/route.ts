import { NextResponse } from "next/server";

import { getOwnedTrainingProviderForAcademy } from "@/lib/academy/provider-management";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  courseEventFormSchema,
  getCourseEventFieldErrors,
} from "@/lib/validators/course-event";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = courseEventFormSchema.safeParse({
      agenda: formData.get("agenda"),
      capacity: formData.get("capacity"),
      courseEventId: formData.get("courseEventId"),
      description: formData.get("description"),
      durationText: formData.get("durationText"),
      endsAt: formData.get("endsAt"),
      externalRegistrationUrl: formData.get("externalRegistrationUrl"),
      level: formData.get("level"),
      location: formData.get("location"),
      onlineUrl: formData.get("onlineUrl"),
      priceText: formData.get("priceText"),
      recordingUrl: formData.get("recordingUrl"),
      startsAt: formData.get("startsAt"),
      status: formData.get("status") || "draft",
      title: formData.get("title"),
      topics: formData.get("topics"),
      type: formData.get("type"),
      weldingProcesses: formData.get("weldingProcesses"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { errors: getCourseEventFieldErrors(parsed.error), status: "error" },
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
          message: "You must be signed in as a training provider to manage Academy.",
          status: "error",
        },
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

    if (!profile || (profile as { profile_type?: string }).profile_type !== "training_provider") {
      return NextResponse.json(
        { message: "Only training provider profiles can manage Academy.", status: "error" },
        { status: 403 },
      );
    }

    const provider = await getOwnedTrainingProviderForAcademy(supabase, user.id);

    if (!provider) {
      return NextResponse.json(
        {
          message: "Create your training provider profile before publishing Academy items.",
          status: "error",
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const now = new Date().toISOString();
    const payload = {
      agenda: data.agenda ?? null,
      capacity: data.capacity ?? null,
      description: data.description,
      duration_text: data.durationText ?? null,
      ends_at: data.endsAt ?? null,
      external_registration_url: data.externalRegistrationUrl ?? null,
      level: data.level ?? null,
      location: data.location ?? null,
      online_url: data.onlineUrl ?? null,
      price_text: data.priceText ?? null,
      recording_url: data.recordingUrl ?? null,
      starts_at: data.startsAt ?? null,
      status: data.status,
      title: data.title,
      topics: data.topics,
      training_provider_id: provider.id,
      type: data.type,
      welding_processes: data.weldingProcesses,
    };

    if (data.courseEventId) {
      const { data: existingCourseEvent, error: existingError } = await supabase
        .from("course_events")
        .select("id, published_at, status")
        .eq("id", data.courseEventId)
        .eq("training_provider_id", provider.id)
        .maybeSingle();

      if (existingError) {
        return NextResponse.json(
          {
            message: `Could not load Academy item: ${existingError.message}`,
            status: "error",
          },
          { status: 400 },
        );
      }

      if (!existingCourseEvent) {
        return NextResponse.json(
          { message: "Academy item not found or not owned by your provider.", status: "error" },
          { status: 404 },
        );
      }

      const existing = existingCourseEvent as { published_at: string | null };
      const { data: updatedCourseEvent, error: updateError } = await supabase
        .from("course_events")
        .update({
          ...payload,
          archived_at: null,
          created_by_profile_id: user.id,
          published_at:
            data.status === "published" ? existing.published_at ?? now : null,
        } as never)
        .eq("id", data.courseEventId)
        .eq("training_provider_id", provider.id)
        .select("id")
        .single();

      if (updateError) {
        return NextResponse.json(
          { message: `Could not update Academy item: ${updateError.message}`, status: "error" },
          { status: 400 },
        );
      }

      return NextResponse.json({
        courseEventId: (updatedCourseEvent as { id: string }).id,
        message:
          data.status === "published" ? "Academy item published." : "Academy item saved as draft.",
        status: "success",
      });
    }

    const { data: insertedCourseEvent, error: insertError } = await supabase
      .from("course_events")
      .insert([
        {
          ...payload,
          created_by_profile_id: user.id,
          published_at: data.status === "published" ? now : null,
        },
      ] as never[])
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json(
        { message: `Could not create Academy item: ${insertError.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      courseEventId: (insertedCourseEvent as { id: string }).id,
      message:
        data.status === "published" ? "Academy item published." : "Academy item saved as draft.",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not save Academy item.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
