import { z } from "zod";

import { POST_BODY_MAX_LENGTH } from "@/lib/constants/posts";
import { getFieldErrors, type AuthFieldErrors } from "@/lib/validators/auth";

const optionalUrl = z.preprocess(
  (value) => (value === null || value === "" ? undefined : value),
  z.url("Enter a valid image URL.").optional(),
);

const optionalUrlList = z.preprocess((value) => {
  if (value === null || value === "") return [];
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}, z.array(z.url("Enter a valid image URL.")).max(12));

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
  imageUrls: optionalUrlList,
  tags: commaList,
});

export type PostFieldErrors = AuthFieldErrors;

export function getPostFieldErrors(error: z.ZodError): PostFieldErrors {
  return getFieldErrors(error);
}
