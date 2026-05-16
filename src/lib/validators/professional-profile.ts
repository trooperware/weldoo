import { z } from "zod";

import { getFieldErrors, type AuthFieldErrors } from "@/lib/validators/auth";

const optionalText = (max = 500) =>
  z.preprocess(
    (value) => (value === null || value === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );

const optionalUrl = z.preprocess(
  (value) => (value === null || value === "" ? undefined : value),
  z.url("Enter a valid URL.").optional(),
);

const optionalInteger = z.preprocess((value) => {
  if (value === null || value === "") return undefined;
  if (typeof value === "string") return Number(value);
  return value;
}, z.number().int().min(0).max(80).optional());

const commaList = z.preprocess((value) => {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}, z.array(z.string().min(1)).max(24));

export const professionalProfileSchema = z.object({
  avatarUrl: optionalUrl,
  bio: optionalText(3000),
  certifications: commaList,
  coverUrl: optionalUrl,
  displayName: z.string().trim().min(2, "Enter a display name.").max(120),
  headline: optionalText(180),
  location: optionalText(160),
  materials: commaList,
  positions: commaList,
  travelAvailability: z.preprocess((value) => value === "on", z.boolean()),
  websiteUrl: optionalUrl,
  weldingProcesses: commaList,
  workPreferences: commaList,
  yearsExperience: optionalInteger,
  availability: z.enum(["available", "open_to_opportunities", "not_available"]),
});

export type ProfessionalProfileFieldErrors = AuthFieldErrors;

export function getProfessionalProfileFieldErrors(
  error: z.ZodError,
): ProfessionalProfileFieldErrors {
  return getFieldErrors(error);
}
