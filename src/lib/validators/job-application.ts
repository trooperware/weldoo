import { z } from "zod";

export const jobApplicationSchema = z.object({
  externalCvUrl: z
    .string()
    .trim()
    .url("Enter a valid CV URL.")
    .max(500, "CV URL is too long.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters.")
    .max(3000, "Message is too long."),
});

export type JobApplicationData = z.infer<typeof jobApplicationSchema>;

export type JobApplicationFieldErrors = Partial<Record<keyof JobApplicationData, string>>;

export function getJobApplicationFieldErrors(
  error: z.ZodError<JobApplicationData>,
): JobApplicationFieldErrors {
  const fieldErrors = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors)
      .map(([key, messages]) => [key, messages?.[0]])
      .filter((entry): entry is [keyof JobApplicationData, string] => Boolean(entry[1])),
  ) as JobApplicationFieldErrors;
}
