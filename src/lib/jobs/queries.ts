import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Enums, Tables } from "@/types/database";

export type JobFilters = {
  company?: string;
  contractType?: Enums<"contract_type">;
  experienceLevel?: string;
  location?: string;
  process?: string;
  query?: string;
  travelRequired?: "false" | "true";
  workMode?: Enums<"work_mode">;
};

type CompanySummary = Pick<
  Tables<"companies">,
  "id" | "location" | "logo_url" | "name" | "sector"
>;

export type JobListItem = Pick<
  Tables<"jobs">,
  | "benefits"
  | "company_id"
  | "contract_type"
  | "created_at"
  | "description"
  | "experience_level"
  | "id"
  | "location"
  | "published_at"
  | "required_certifications"
  | "salary_currency"
  | "salary_max"
  | "salary_min"
  | "title"
  | "travel_required"
  | "welding_processes"
  | "work_mode"
> & {
  company: CompanySummary | null;
};

export type JobsListingResult = {
  items: JobListItem[];
  totalCount: number;
};

function normalizeFilter(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, 120) : undefined;
}

function normalizeLike(value: string) {
  return `%${value.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
}

function isContractType(value?: string): value is Enums<"contract_type"> {
  return (
    value === "full_time" ||
    value === "part_time" ||
    value === "contract" ||
    value === "temporary" ||
    value === "freelance"
  );
}

function isWorkMode(value?: string): value is Enums<"work_mode"> {
  return value === "on_site" || value === "hybrid" || value === "remote";
}

export function parseJobFilters(params: {
  company?: string;
  contractType?: string;
  experience?: string;
  location?: string;
  process?: string;
  q?: string;
  travel?: string;
  workMode?: string;
}): JobFilters {
  const contractType = normalizeFilter(params.contractType);
  const workMode = normalizeFilter(params.workMode);
  const travel = normalizeFilter(params.travel);

  return {
    company: normalizeFilter(params.company),
    contractType: isContractType(contractType) ? contractType : undefined,
    experienceLevel: normalizeFilter(params.experience),
    location: normalizeFilter(params.location),
    process: normalizeFilter(params.process),
    query: normalizeFilter(params.q),
    travelRequired: travel === "true" || travel === "false" ? travel : undefined,
    workMode: isWorkMode(workMode) ? workMode : undefined,
  };
}

export function getJobsHref(filters: JobFilters) {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.location) params.set("location", filters.location);
  if (filters.process) params.set("process", filters.process);
  if (filters.contractType) params.set("contractType", filters.contractType);
  if (filters.workMode) params.set("workMode", filters.workMode);
  if (filters.travelRequired) params.set("travel", filters.travelRequired);
  if (filters.experienceLevel) params.set("experience", filters.experienceLevel);
  if (filters.company) params.set("company", filters.company);

  const query = params.toString();
  return query ? `/jobs?${query}` : "/jobs";
}

export function hasActiveJobFilters(filters: JobFilters) {
  return Boolean(
    filters.query ||
      filters.location ||
      filters.process ||
      filters.contractType ||
      filters.workMode ||
      filters.travelRequired ||
      filters.experienceLevel ||
      filters.company,
  );
}

export async function getJobsListing(
  supabase: SupabaseClient<Database>,
  filters: JobFilters,
): Promise<JobsListingResult> {
  let jobsQuery = supabase
    .from("jobs")
    .select(
      "id, company_id, title, description, location, work_mode, contract_type, salary_min, salary_max, salary_currency, welding_processes, required_certifications, experience_level, travel_required, benefits, published_at, created_at, companies(id, name, sector, location, logo_url)",
      { count: "exact" },
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters.query) {
    const like = normalizeLike(filters.query);
    jobsQuery = jobsQuery.or(
      `title.ilike.${like},description.ilike.${like},location.ilike.${like},experience_level.ilike.${like}`,
    );
  }

  if (filters.location) {
    jobsQuery = jobsQuery.ilike("location", normalizeLike(filters.location));
  }

  if (filters.process) {
    jobsQuery = jobsQuery.contains("welding_processes", [filters.process]);
  }

  if (filters.contractType) {
    jobsQuery = jobsQuery.eq("contract_type", filters.contractType);
  }

  if (filters.workMode) {
    jobsQuery = jobsQuery.eq("work_mode", filters.workMode);
  }

  if (filters.travelRequired) {
    jobsQuery = jobsQuery.eq("travel_required", filters.travelRequired === "true");
  }

  if (filters.experienceLevel) {
    jobsQuery = jobsQuery.ilike("experience_level", normalizeLike(filters.experienceLevel));
  }

  const { data, error } = await jobsQuery;

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Array<
    Omit<JobListItem, "company"> & {
      companies: CompanySummary | null;
    }
  >;
  const companyFilter = filters.company?.toLowerCase();
  const items = rows
    .map<JobListItem>((row) => ({
      ...row,
      company: row.companies,
    }))
    .filter((job) =>
      companyFilter ? job.company?.name.toLowerCase().includes(companyFilter) : true,
    );

  return {
    items,
    totalCount: items.length,
  };
}
