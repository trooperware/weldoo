import { z } from "zod";

import { getFieldErrors, type AuthFieldErrors } from "@/lib/validators/auth";

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Write a comment before posting.").max(2000),
});

export type CommentFieldErrors = AuthFieldErrors;

export function getCommentFieldErrors(error: z.ZodError): CommentFieldErrors {
  return getFieldErrors(error);
}
