import type { User } from "@supabase/supabase-js";

export type LinkedInProfileImport = {
  avatarUrl?: string;
  displayName?: string;
  email?: string;
  firstName?: string;
  headline?: string;
  lastName?: string;
};

function readString(metadata: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function hasLinkedInProvider(user: User) {
  const provider = user.app_metadata.provider;
  const providers = user.app_metadata.providers ?? [];

  return provider === "linkedin_oidc" || provider === "linkedin" || providers.includes("linkedin_oidc") || providers.includes("linkedin");
}

export function getLinkedInProfileImport(user: User): LinkedInProfileImport | null {
  if (!hasLinkedInProvider(user)) {
    return null;
  }

  const metadata = user.user_metadata as Record<string, unknown>;
  const firstName = readString(metadata, ["given_name", "first_name", "firstName"]);
  const lastName = readString(metadata, ["family_name", "last_name", "lastName"]);
  const metadataDisplayName = readString(metadata, ["full_name", "name", "display_name"]);
  const joinedName = [firstName, lastName].filter(Boolean).join(" ");
  const displayName = metadataDisplayName ?? (joinedName || undefined);
  const avatarUrl = readString(metadata, ["avatar_url", "picture", "picture_url"]);
  const headline = readString(metadata, ["headline", "localized_headline", "occupation"]);
  const email = readString(metadata, ["email"]) ?? user.email;

  return {
    avatarUrl,
    displayName,
    email,
    firstName,
    headline,
    lastName,
  };
}
