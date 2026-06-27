import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Enums, Tables } from "@/types/database";

export type JobFilters = {
  areas?: string[];
  company?: string;
  contractTypes?: Array<Enums<"contract_type">>;
  experienceLevel?: string;
  locations?: string[];
  query?: string;
  travelRequired?: "false" | "true";
  workModes?: Array<Enums<"work_mode">>;
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
  | "materials"
  | "published_at"
  | "required_certifications"
  | "requirements"
  | "responsibilities"
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

function normalizeFilterValues(value?: string | string[]) {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return values
    .flatMap((item) => item.split(","))
    .map((item) => normalizeFilter(item))
    .filter(Boolean) as string[];
}

function includesText(value: string | null | undefined, filter?: string) {
  if (!filter) return true;
  return Boolean(value?.toLowerCase().includes(filter.toLowerCase()));
}

function arrayIncludesText(values: string[], filter?: string) {
  if (!filter) return true;
  return values.some((value) => value.toLowerCase().includes(filter.toLowerCase()));
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
  area?: string | string[];
  company?: string;
  contractType?: string | string[];
  experience?: string;
  location?: string | string[];
  process?: string | string[];
  q?: string;
  travel?: string;
  workMode?: string | string[];
}): JobFilters {
  const contractTypes = normalizeFilterValues(params.contractType).filter(isContractType);
  const areas = [...normalizeFilterValues(params.area), ...normalizeFilterValues(params.process)];
  const workModes = normalizeFilterValues(params.workMode).filter(isWorkMode);
  const travel = normalizeFilter(params.travel);

  return {
    areas: areas.length ? [...new Set(areas)] : undefined,
    company: normalizeFilter(params.company),
    contractTypes: contractTypes.length ? [...new Set(contractTypes)] : undefined,
    experienceLevel: normalizeFilter(params.experience),
    locations: normalizeFilterValues(params.location).length
      ? [...new Set(normalizeFilterValues(params.location))]
      : undefined,
    query: normalizeFilter(params.q),
    travelRequired: travel === "true" || travel === "false" ? travel : undefined,
    workModes: workModes.length ? [...new Set(workModes)] : undefined,
  };
}

export function getJobsHref(filters: JobFilters) {
  const params = new URLSearchParams();

  filters.areas?.forEach((area) => params.append("area", area));
  if (filters.query) params.set("q", filters.query);
  filters.locations?.forEach((location) => params.append("location", location));
  filters.contractTypes?.forEach((contractType) => params.append("contractType", contractType));
  filters.workModes?.forEach((workMode) => params.append("workMode", workMode));
  if (filters.travelRequired) params.set("travel", filters.travelRequired);
  if (filters.experienceLevel) params.set("experience", filters.experienceLevel);
  if (filters.company) params.set("company", filters.company);

  const query = params.toString();
  return query ? `/jobs?${query}` : "/jobs";
}

export function hasActiveJobFilters(filters: JobFilters) {
  return Boolean(
    filters.areas?.length ||
      filters.query ||
      filters.locations?.length ||
      filters.contractTypes?.length ||
      filters.workModes?.length ||
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
      "id, company_id, title, description, responsibilities, requirements, location, work_mode, contract_type, salary_min, salary_max, salary_currency, welding_processes, materials, required_certifications, experience_level, travel_required, benefits, published_at, created_at, companies(id, name, sector, location, logo_url)",
      { count: "exact" },
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters.contractTypes?.length) {
    jobsQuery = jobsQuery.in("contract_type", filters.contractTypes);
  }

  if (filters.workModes?.length) {
    jobsQuery = jobsQuery.in("work_mode", filters.workModes);
  }

  if (filters.travelRequired) {
    jobsQuery = jobsQuery.eq("travel_required", filters.travelRequired === "true");
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
  const items = rows
    .map<JobListItem>((row) => ({
      ...row,
      company: row.companies,
    }))
    .filter((job) => {
      const query = filters.query;
      const queryMatches =
        !query ||
        includesText(job.title, query) ||
        includesText(job.description, query) ||
        includesText(job.location, query) ||
        includesText(job.experience_level, query) ||
        includesText(job.company?.name, query) ||
        arrayIncludesText(job.welding_processes, query) ||
        arrayIncludesText(job.materials, query) ||
        arrayIncludesText(job.required_certifications, query);

      return (
        queryMatches &&
        includesText(job.company?.name, filters.company) &&
        includesText(job.experience_level, filters.experienceLevel) &&
        (!filters.locations?.length ||
          filters.locations.some(
            (location) =>
              includesText(job.location, location) ||
              includesText(job.company?.location, location),
          )) &&
        (!filters.areas?.length ||
          filters.areas.some(
            (area) =>
              includesText(job.title, area) ||
              includesText(job.description, area) ||
              includesText(job.experience_level, area) ||
              includesText(job.company?.sector, area) ||
              arrayIncludesText(job.welding_processes, area) ||
              arrayIncludesText(job.materials, area) ||
              arrayIncludesText(job.required_certifications, area),
          ))
      );
    });

  return {
    items,
    totalCount: items.length,
  };
}

export async function getPublishedJobById(
  supabase: SupabaseClient<Database>,
  jobId: string,
) {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, company_id, title, description, responsibilities, requirements, location, work_mode, contract_type, salary_min, salary_max, salary_currency, welding_processes, materials, required_certifications, experience_level, travel_required, benefits, published_at, created_at, companies(id, name, sector, location, logo_url)",
    )
    .eq("id", jobId)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  const row = data as Omit<JobListItem, "company"> & {
    companies: CompanySummary | null;
  };

  return {
    ...row,
    company: row.companies,
  } satisfies JobListItem;
}
