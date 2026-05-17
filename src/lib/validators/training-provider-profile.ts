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

const optionalEmail = z.preprocess(
  (value) => (value === null || value === "" ? undefined : value),
  z.email("Enter a valid email address.").optional(),
);

const commaList = z.preprocess((value) => {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}, z.array(z.string().min(1)).max(24));

export const trainingProviderProfileSchema = z.object({
  contactEmail: optionalEmail,
  coverUrl: optionalUrl,
  description: optionalText(4000),
  location: optionalText(160),
  logoUrl: optionalUrl,
  name: z.string().trim().min(2, "Enter an organisation name.").max(160),
  trainingTypes: commaList,
  websiteUrl: optionalUrl,
});

export type TrainingProviderProfileFieldErrors = AuthFieldErrors;

export function getTrainingProviderProfileFieldErrors(
  error: z.ZodError,
): TrainingProviderProfileFieldErrors {
  return getFieldErrors(error);
}
