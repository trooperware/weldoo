const DEFAULT_AUTH_REDIRECT = "/";
const APP_ENTRY_REDIRECT_PATHS = new Set(["/", "/dashboard", "/onboarding"]);

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

export function getPostAuthRedirectPath({
  onboardingCompleted,
  redirectTo,
}: {
  onboardingCompleted: boolean;
  redirectTo: FormDataEntryValue | string | null | undefined;
}) {
  const safeRedirectPath = getSafeRedirectPath(redirectTo);

  if (onboardingCompleted && APP_ENTRY_REDIRECT_PATHS.has(safeRedirectPath)) {
    return "/";
  }

  if (!onboardingCompleted && ["/", "/dashboard"].includes(safeRedirectPath)) {
    return "/onboarding";
  }

  return safeRedirectPath;
}

export function getAuthCallbackUrl(path: string) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_URL ??
    "http://127.0.0.1:3002";

  const normalizedUrl = appUrl.startsWith("http") ? appUrl : `https://${appUrl}`;
  return new URL(path, normalizedUrl).toString();
}
