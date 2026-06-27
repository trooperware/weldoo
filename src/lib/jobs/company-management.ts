import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/database";

export type CompanyJob = Pick<
  Tables<"jobs">,
  | "application_deadline"
  | "application_mode"
  | "area"
  | "benefits"
  | "closed_at"
  | "contract_type"
  | "created_at"
  | "description"
  | "experience_level"
  | "external_apply_url"
  | "id"
  | "location"
  | "materials"
  | "published_at"
  | "required_certifications"
  | "requirements"
  | "responsibilities"
  | "salary_currency"
  | "salary_max"
  | "salary_min"
  | "salary_visible"
  | "skills"
  | "status"
  | "title"
  | "tools"
  | "travel_required"
  | "welding_processes"
  | "work_mode"
>;

export type CompanyForJobs = Pick<Tables<"companies">, "id" | "location" | "name">;

export async function getOwnedCompanyForJobs(
  supabase: SupabaseClient<Database>,
  profileId: string,
) {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, location")
    .eq("owner_profile_id", profileId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data as CompanyForJobs | null;
}

export async function getCompanyJobs(
  supabase: SupabaseClient<Database>,
  companyId: string,
) {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, title, description, responsibilities, requirements, location, work_mode, contract_type, salary_min, salary_max, salary_currency, salary_visible, area, skills, tools, external_apply_url, application_mode, application_deadline, welding_processes, materials, required_certifications, experience_level, travel_required, benefits, status, published_at, closed_at, created_at",
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as CompanyJob[];
}
