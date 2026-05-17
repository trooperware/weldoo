import { z } from "zod";

import { getFieldErrors, type AuthFieldErrors } from "@/lib/validators/auth";

const optionalText = (max = 2000) =>
  z.preprocess(
    (value) => (value === null || value === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );

export const reportSchema = z
  .object({
    commentId: optionalText(80),
    note: optionalText(2000),
    postId: optionalText(80),
    reason: z.string().trim().min(2, "Select a reason.").max(120),
    targetType: z.enum(["post", "comment"]),
  })
  .refine(
    (data) =>
      (data.targetType === "post" && Boolean(data.postId) && !data.commentId) ||
      (data.targetType === "comment" && Boolean(data.commentId) && !data.postId),
    {
      message: "Choose one report target.",
      path: ["targetType"],
    },
  );

export type ReportFieldErrors = AuthFieldErrors;

export function getReportFieldErrors(error: z.ZodError): ReportFieldErrors {
  return getFieldErrors(error);
}
