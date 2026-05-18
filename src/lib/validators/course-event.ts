import { z } from "zod";

import type { Enums } from "@/types/database";

const courseTypes = [
  "online_course",
  "webinar",
  "in_person_course",
  "workshop",
  "sector_event",
] as const;
const courseLevels = ["basic", "intermediate", "advanced"] as const;
const statuses = ["draft", "published"] as const;

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

function optionalDate(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? trimmed : date.toISOString();
}

function optionalUrl(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export const courseEventFormSchema = z
  .object({
    agenda: z.preprocess(
      emptyToUndefined,
      z.string().max(10000, "Agenda is too long.").optional(),
    ),
    capacity: z.preprocess(
      optionalInteger,
      z.number().int().min(1, "Capacity must be at least 1.").optional(),
    ),
    courseEventId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
    description: z
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters.")
      .max(10000, "Description is too long."),
    durationText: z.preprocess(
      emptyToUndefined,
      z.string().max(80, "Duration is too long.").optional(),
    ),
    endsAt: z.preprocess(optionalDate, z.string().datetime().optional()),
    externalRegistrationUrl: z.preprocess(
      optionalUrl,
      z.string().url("Use a valid registration URL.").max(500).optional(),
    ),
    level: z.preprocess(emptyToUndefined, z.enum(courseLevels).optional()),
    location: z.preprocess(
      emptyToUndefined,
      z.string().max(180, "Location is too long.").optional(),
    ),
    onlineUrl: z.preprocess(
      optionalUrl,
      z.string().url("Use a valid online URL.").max(500).optional(),
    ),
    priceText: z.preprocess(
      emptyToUndefined,
      z.string().max(80, "Price text is too long.").optional(),
    ),
    recordingUrl: z.preprocess(
      optionalUrl,
      z.string().url("Use a valid recording URL.").max(500).optional(),
    ),
    startsAt: z.preprocess(optionalDate, z.string().datetime().optional()),
    status: z.enum(statuses).default("draft"),
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters.")
      .max(180, "Title is too long."),
    topics: z.preprocess(stringList, z.array(z.string().max(100)).max(24)),
    type: z.enum(courseTypes),
    weldingProcesses: z.preprocess(
      stringList,
      z.array(z.string().max(100)).max(24),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.startsAt && data.endsAt && new Date(data.startsAt) > new Date(data.endsAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date cannot be before start date.",
        path: ["endsAt"],
      });
    }
  });

export type CourseEventFormData = z.infer<typeof courseEventFormSchema>;

export type CourseEventFieldErrors = Partial<Record<keyof CourseEventFormData, string>>;

export function getCourseEventFieldErrors(
  error: z.ZodError<CourseEventFormData>,
): CourseEventFieldErrors {
  const fieldErrors = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors)
      .map(([key, messages]) => [key, messages?.[0]])
      .filter((entry): entry is [keyof CourseEventFormData, string] =>
        Boolean(entry[1]),
      ),
  ) as CourseEventFieldErrors;
}

export type CourseEventStatusIntent = Enums<"publication_status">;
