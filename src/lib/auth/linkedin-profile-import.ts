import type { User, UserIdentity } from "@supabase/supabase-js";

export type LinkedInProfileImport = {
  avatarUrl?: string;
  bio?: string;
  displayName?: string;
  email?: string;
  firstName?: string;
  headline?: string;
  lastName?: string;
  location?: string;
  websiteUrl?: string;
  yearsExperience?: number;
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

function readNumber(metadata: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.max(0, Math.floor(value));
    }

    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value.trim());

      if (Number.isFinite(parsed)) {
        return Math.max(0, Math.floor(parsed));
      }
    }
  }

  return undefined;
}

function readHttpUrl(metadata: Record<string, unknown>, keys: string[]) {
  const value = readString(metadata, keys);

  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
}

function isLinkedInProvider(provider: string | undefined) {
  return provider === "linkedin_oidc" || provider === "linkedin";
}

function getLinkedInIdentity(user: User): UserIdentity | undefined {
  return user.identities?.find((identity) => isLinkedInProvider(identity.provider));
}

export function hasLinkedInIdentity(user: User) {
  const provider = user.app_metadata.provider;
  const providers = user.app_metadata.providers ?? [];

  return (
    isLinkedInProvider(provider) ||
    providers.includes("linkedin_oidc") ||
    providers.includes("linkedin") ||
    Boolean(getLinkedInIdentity(user))
  );
}

export function getLinkedInProfileImport(user: User): LinkedInProfileImport | null {
  if (!hasLinkedInIdentity(user)) {
    return null;
  }

  const identityData = getLinkedInIdentity(user)?.identity_data ?? {};
  const metadata = {
    ...(user.user_metadata as Record<string, unknown>),
    ...(identityData as Record<string, unknown>),
  };
  const firstName = readString(metadata, ["given_name", "first_name", "firstName"]);
  const lastName = readString(metadata, ["family_name", "last_name", "lastName"]);
  const metadataDisplayName = readString(metadata, ["full_name", "name", "display_name"]);
  const joinedName = [firstName, lastName].filter(Boolean).join(" ");
  const displayName = metadataDisplayName ?? (joinedName || undefined);
  const avatarUrl = readHttpUrl(metadata, ["avatar_url", "picture", "picture_url"]);
  const headline = readString(metadata, [
    "headline",
    "localized_headline",
    "localizedHeadline",
    "occupation",
  ]);
  const email = readString(metadata, ["email"]) ?? user.email;
  const bio = readString(metadata, ["bio", "summary", "about", "description"]);
  const location = readString(metadata, ["location", "localized_location", "localizedLocation"]);
  const websiteUrl = readHttpUrl(metadata, [
    "website_url",
    "websiteUrl",
    "website",
    "public_profile_url",
    "publicProfileUrl",
  ]);
  const yearsExperience = readNumber(metadata, [
    "years_experience",
    "yearsExperience",
    "experience_years",
    "experienceYears",
  ]);

  return {
    avatarUrl,
    bio,
    displayName,
    email,
    firstName,
    headline,
    lastName,
    location,
    websiteUrl,
    yearsExperience,
  };
}
