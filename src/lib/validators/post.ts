import { z } from "zod";

import { POST_BODY_MAX_LENGTH } from "@/lib/constants/posts";
import { getFieldErrors, type AuthFieldErrors } from "@/lib/validators/auth";

const optionalUrl = z.preprocess(
  (value) => (value === null || value === "" ? undefined : value),
  z.url("Enter a valid image URL.").optional(),
);

const commaList = z.preprocess((value) => {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}, z.array(z.string().min(1).max(48)).max(12));

export const postSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write something before publishing.")
    .max(POST_BODY_MAX_LENGTH, `Keep posts under ${POST_BODY_MAX_LENGTH} characters.`),
  imageUrl: optionalUrl,
  tags: commaList,
});

export type PostFieldErrors = AuthFieldErrors;

export function getPostFieldErrors(error: z.ZodError): PostFieldErrors {
  return getFieldErrors(error);
}
