import { NextResponse } from "next/server";

import { getOwnedCompanyForJobs } from "@/lib/jobs/company-management";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getJobFieldErrors, jobFormSchema } from "@/lib/validators/job";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = jobFormSchema.safeParse({
      benefits: formData.get("benefits"),
      contractType: formData.get("contractType"),
      description: formData.get("description"),
      experienceLevel: formData.get("experienceLevel"),
      jobId: formData.get("jobId"),
      location: formData.get("location"),
      materials: formData.get("materials"),
      requiredCertifications: formData.get("requiredCertifications"),
      requirements: formData.get("requirements"),
      responsibilities: formData.get("responsibilities"),
      salaryCurrency: formData.get("salaryCurrency") || "EUR",
      salaryMax: formData.get("salaryMax"),
      salaryMin: formData.get("salaryMin"),
      status: formData.get("status") || "draft",
      title: formData.get("title"),
      travelRequired: formData.get("travelRequired"),
      weldingProcesses: formData.get("weldingProcesses"),
      workMode: formData.get("workMode"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { errors: getJobFieldErrors(parsed.error), status: "error" },
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

    if (!profile || (profile as { profile_type?: string }).profile_type !== "company") {
      return NextResponse.json(
        { message: "Only company profiles can manage jobs.", status: "error" },
        { status: 403 },
      );
    }

    const company = await getOwnedCompanyForJobs(supabase, user.id);

    if (!company) {
      return NextResponse.json(
        { message: "Create your company profile before publishing jobs.", status: "error" },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const now = new Date().toISOString();
    const payload = {
      benefits: data.benefits,
      company_id: company.id,
      contract_type: data.contractType ?? null,
      created_by_profile_id: user.id,
      description: data.description,
      experience_level: data.experienceLevel ?? null,
      location: data.location ?? null,
      materials: data.materials,
      published_at: data.status === "published" ? now : null,
      required_certifications: data.requiredCertifications,
      requirements: data.requirements ?? null,
      responsibilities: data.responsibilities ?? null,
      salary_currency: data.salaryCurrency,
      salary_max: data.salaryMax ?? null,
      salary_min: data.salaryMin ?? null,
      status: data.status,
      title: data.title,
      travel_required: data.travelRequired,
      welding_processes: data.weldingProcesses,
      work_mode: data.workMode ?? null,
    };

    if (data.jobId) {
      const { data: existingJob, error: existingError } = await supabase
        .from("jobs")
        .select("id, published_at, status")
        .eq("id", data.jobId)
        .eq("company_id", company.id)
        .maybeSingle();

      if (existingError) {
        return NextResponse.json(
          { message: `Could not load job: ${existingError.message}`, status: "error" },
          { status: 400 },
        );
      }

      if (!existingJob) {
        return NextResponse.json(
          { message: "Job not found or not owned by your company.", status: "error" },
          { status: 404 },
        );
      }

      const existing = existingJob as { published_at: string | null; status: string };
      const { data: updatedJob, error: updateError } = await supabase
        .from("jobs")
        .update({
          ...payload,
          closed_at: null,
          created_by_profile_id: user.id,
          published_at:
            data.status === "published" ? existing.published_at ?? now : null,
        } as never)
        .eq("id", data.jobId)
        .eq("company_id", company.id)
        .select("id")
        .single();

      if (updateError) {
        return NextResponse.json(
          { message: `Could not update job: ${updateError.message}`, status: "error" },
          { status: 400 },
        );
      }

      return NextResponse.json({
        jobId: (updatedJob as { id: string }).id,
        message: data.status === "published" ? "Job published." : "Job saved as draft.",
        status: "success",
      });
    }

    const { data: insertedJob, error: insertError } = await supabase
      .from("jobs")
      .insert([payload] as never[])
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json(
        { message: `Could not create job: ${insertError.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      jobId: (insertedJob as { id: string }).id,
      message: data.status === "published" ? "Job published." : "Job saved as draft.",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not save job.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
