const DEFAULT_AUTH_REDIRECT = "/dashboard";

export function getSafeRedirectPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string" || value.length === 0) {
    return DEFAULT_AUTH_REDIRECT;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  if (value.startsWith("/auth")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return value;
}

export function getAuthCallbackUrl(path: string) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_URL ??
    "http://127.0.0.1:3002";

  const normalizedUrl = appUrl.startsWith("http") ? appUrl : `https://${appUrl}`;
  return new URL(path, normalizedUrl).toString();
}
