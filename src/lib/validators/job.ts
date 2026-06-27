import { z } from "zod";

import type { Enums } from "@/types/database";

const contractTypes = ["full_time", "part_time", "contract", "temporary", "freelance"] as const;
const workModes = ["on_site", "hybrid", "remote"] as const;
const statuses = ["draft", "published"] as const;
const applicationModes = ["weldoo", "external", "both"] as const;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function emptyToUndefined(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function stringList(value: unknown) {
  if (typeof value !== "string") return [];
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 24);
}

function optionalInteger(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length ? Number(trimmed) : undefined;
}

export const jobFormSchema = z
  .object({
    benefits: z.preprocess(stringList, z.array(z.string().max(80)).max(24)),
    applicationDeadline: z.preprocess(
      emptyToUndefined,
      z.string().regex(datePattern, "Use a valid date.").optional(),
    ),
    applicationMode: z.enum(applicationModes).default("weldoo"),
    area: z.preprocess(
      emptyToUndefined,
      z.string().max(120, "Area is too long.").optional(),
    ),
    contractType: z.preprocess(
      emptyToUndefined,
      z.enum(contractTypes).optional(),
    ),
    description: z
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters.")
      .max(10000, "Description is too long."),
    experienceLevel: z.preprocess(
      emptyToUndefined,
      z.string().max(120, "Experience level is too long.").optional(),
    ),
    externalApplyUrl: z.preprocess(
      emptyToUndefined,
      z.string().url("Use a valid URL.").max(500, "URL is too long.").optional(),
    ),
    jobId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
    location: z.preprocess(
      emptyToUndefined,
      z.string().max(160, "Location is too long.").optional(),
    ),
    materials: z.preprocess(stringList, z.array(z.string().max(80)).max(24)),
    requiredCertifications: z.preprocess(
      stringList,
      z.array(z.string().max(100)).max(24),
    ),
    requirements: z.preprocess(
      emptyToUndefined,
      z.string().max(5000, "Requirements are too long.").optional(),
    ),
    responsibilities: z.preprocess(
      emptyToUndefined,
      z.string().max(5000, "Responsibilities are too long.").optional(),
    ),
    salaryCurrency: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .length(3, "Use a three-letter currency code.")
        .toUpperCase()
        .default("EUR"),
    ),
    salaryMax: z.preprocess(
      optionalInteger,
      z.number().int().min(0, "Salary must be positive.").optional(),
    ),
    salaryMin: z.preprocess(
      optionalInteger,
      z.number().int().min(0, "Salary must be positive.").optional(),
    ),
    salaryVisible: z.preprocess(
      (value) => value === "on" || value === "true",
      z.boolean(),
    ),
    skills: z.preprocess(stringList, z.array(z.string().max(80)).max(24)),
    status: z.enum(statuses).default("draft"),
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters.")
      .max(180, "Title is too long."),
    travelRequired: z.preprocess(
      (value) => value === "on" || value === "true",
      z.boolean(),
    ),
    tools: z.preprocess(stringList, z.array(z.string().max(80)).max(24)),
    weldingProcesses: z.preprocess(
      stringList,
      z.array(z.string().max(80)).max(24),
    ),
    workMode: z.preprocess(emptyToUndefined, z.enum(workModes).optional()),
  })
  .superRefine((data, ctx) => {
    if (
      data.salaryMin !== undefined &&
      data.salaryMax !== undefined &&
      data.salaryMin > data.salaryMax
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum salary cannot be greater than maximum salary.",
        path: ["salaryMin"],
      });
    }

    if (
      (data.applicationMode === "external" || data.applicationMode === "both") &&
      !data.externalApplyUrl
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "External apply URL is required for this application mode.",
        path: ["externalApplyUrl"],
      });
    }
  });

export type JobFormData = z.infer<typeof jobFormSchema>;

export type JobFieldErrors = Partial<Record<keyof JobFormData, string>>;

export function getJobFieldErrors(error: z.ZodError<JobFormData>): JobFieldErrors {
  const fieldErrors = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors)
      .map(([key, messages]) => [key, messages?.[0]])
      .filter((entry): entry is [keyof JobFormData, string] => Boolean(entry[1])),
  ) as JobFieldErrors;
}

export type JobStatusIntent = Enums<"publication_status">;
