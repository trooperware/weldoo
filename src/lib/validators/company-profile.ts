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

export const companyProfileSchema = z.object({
  companySize: optionalText(80),
  contactEmail: optionalEmail,
  coverUrl: optionalUrl,
  description: optionalText(4000),
  location: optionalText(160),
  logoUrl: optionalUrl,
  name: z.string().trim().min(2, "Enter a company name.").max(160),
  sector: optionalText(120),
  websiteUrl: optionalUrl,
});

export type CompanyProfileFieldErrors = AuthFieldErrors;

export function getCompanyProfileFieldErrors(error: z.ZodError): CompanyProfileFieldErrors {
  return getFieldErrors(error);
}
