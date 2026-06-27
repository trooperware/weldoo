import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Enums, Tables } from "@/types/database";

export type JobApplicationSummary = Pick<
  Tables<"job_applications">,
  "created_at" | "external_cv_url" | "id" | "message" | "status" | "viewed_at"
> & {
  applicant: Pick<Tables<"profiles">, "display_name" | "headline" | "id" | "location"> | null;
  job: Pick<Tables<"jobs">, "id" | "title"> | null;
};

export async function getApplicationForCurrentUser(
  supabase: SupabaseClient<Database>,
  jobId: string,
  profileId?: string | null,
) {
  if (!profileId) return null;

  const { data, error } = await supabase
    .from("job_applications")
    .select("id, status, created_at")
    .eq("job_id", jobId)
    .eq("applicant_profile_id", profileId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data as Pick<Tables<"job_applications">, "created_at" | "id" | "status"> | null;
}

export async function getCompanyJobApplications(
  supabase: SupabaseClient<Database>,
  companyId: string,
) {
  const { data, error } = await supabase
    .from("job_applications")
    .select(
      "id, message, external_cv_url, status, viewed_at, created_at, profiles(id, display_name, headline, location), jobs!inner(id, title, company_id)",
    )
    .eq("jobs.company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as Array<{
    created_at: string;
    external_cv_url: string | null;
    id: string;
    jobs: Pick<Tables<"jobs">, "company_id" | "id" | "title"> | null;
    message: string | null;
    profiles: Pick<Tables<"profiles">, "display_name" | "headline" | "id" | "location"> | null;
    status: Enums<"application_status">;
    viewed_at: string | null;
  }>).map<JobApplicationSummary>((row) => ({
    applicant: row.profiles,
    created_at: row.created_at,
    external_cv_url: row.external_cv_url,
    id: row.id,
    job: row.jobs,
    message: row.message,
    status: row.status,
    viewed_at: row.viewed_at,
  }));
}

export async function getSavedJobForCurrentUser(
  supabase: SupabaseClient<Database>,
  jobId: string,
  profileId?: string | null,
) {
  if (!profileId) return null;

  const { data, error } = await supabase
    .from("saved_items")
    .select("id")
    .eq("profile_id", profileId)
    .eq("item_type", "job")
    .eq("job_id", jobId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data as Pick<Tables<"saved_items">, "id"> | null;
}

export type SavedJobItem = Pick<Tables<"saved_items">, "created_at" | "id"> & {
  job: Pick<
    Tables<"jobs">,
    | "contract_type"
    | "created_at"
    | "id"
    | "location"
    | "materials"
    | "published_at"
    | "required_certifications"
    | "skills"
    | "title"
    | "tools"
    | "welding_processes"
    | "work_mode"
  > & {
    company: Pick<Tables<"companies">, "id" | "location" | "name" | "logo_url"> | null;
  };
};

export async function getSavedJobsForCurrentUser(
  supabase: SupabaseClient<Database>,
  profileId: string,
) {
  const { data, error } = await supabase
    .from("saved_items")
    .select(
      "id, created_at, jobs!inner(id, title, location, work_mode, contract_type, skills, tools, welding_processes, materials, required_certifications, published_at, created_at, companies(id, name, location, logo_url))",
    )
    .eq("profile_id", profileId)
    .eq("item_type", "job")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as Array<{
    created_at: string;
    id: string;
    jobs: Pick<
      Tables<"jobs">,
      | "contract_type"
      | "created_at"
      | "id"
      | "location"
      | "materials"
      | "published_at"
      | "required_certifications"
      | "skills"
      | "title"
      | "tools"
      | "welding_processes"
      | "work_mode"
    > & {
      companies: Pick<Tables<"companies">, "id" | "location" | "logo_url" | "name"> | null;
    };
  }>).map<SavedJobItem>((row) => ({
    created_at: row.created_at,
    id: row.id,
    job: {
      company: row.jobs.companies,
      contract_type: row.jobs.contract_type,
      created_at: row.jobs.created_at,
      id: row.jobs.id,
      location: row.jobs.location,
      materials: row.jobs.materials,
      published_at: row.jobs.published_at,
      required_certifications: row.jobs.required_certifications,
      skills: row.jobs.skills,
      title: row.jobs.title,
      tools: row.jobs.tools,
      welding_processes: row.jobs.welding_processes,
      work_mode: row.jobs.work_mode,
    },
  }));
}
