import { z } from "zod";

import { getFieldErrors, type AuthFieldErrors } from "@/lib/validators/auth";

export const onboardingSchema = z
  .object({
    avatarUrl: z.preprocess(
      (value) => (value === null || value === "" ? undefined : value),
      z.url("Enter a valid image URL.").max(1000).optional(),
    ),
    displayName: z.string().trim().min(2, "Enter a display name.").max(120),
    headline: z.preprocess(
      (value) => (value === null || value === "" ? undefined : value),
      z.string().trim().max(180, "Use 180 characters or fewer.").optional(),
    ),
    location: z.preprocess(
      (value) => (value === null || value === "" ? undefined : value),
      z.string().trim().max(160).optional(),
    ),
    organizationName: z.preprocess(
      (value) => (value === null || value === "" ? undefined : value),
      z.string().trim().max(160).optional(),
    ),
    profileType: z.enum(["professional", "company", "training_provider"], {
      error: "Choose a profile type.",
    }),
  })
  .superRefine((data, context) => {
    if (
      (data.profileType === "company" || data.profileType === "training_provider") &&
      (!data.organizationName || data.organizationName.length < 2)
    ) {
      context.addIssue({
        code: "custom",
        message: "Enter the organization name.",
        path: ["organizationName"],
      });
    }
  });

export type OnboardingFieldErrors = AuthFieldErrors;

export function getOnboardingFieldErrors(error: z.ZodError): OnboardingFieldErrors {
  return getFieldErrors(error);
}
