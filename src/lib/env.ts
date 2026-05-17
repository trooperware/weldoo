type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
};

type ServerSupabaseEnv = PublicSupabaseEnv & {
  serviceRoleKey?: string;
};

const PUBLIC_SUPABASE_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

function readPublicSupabaseUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return value && value.trim().length > 0 ? value : undefined;
}

function readPublicSupabaseAnonKey(): string | undefined {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return value && value.trim().length > 0 ? value : undefined;
}

function getMissingEnv(keys: readonly string[]): string[] {
  return keys.filter((key) => {
    if (key === "NEXT_PUBLIC_SUPABASE_URL") {
      return !readPublicSupabaseUrl();
    }

    if (key === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
      return !readPublicSupabaseAnonKey();
    }

    return !readEnv(key);
  });
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  const missing = getMissingEnv(PUBLIC_SUPABASE_ENV_KEYS);

  if (missing.length > 0) {
    throw new Error(`Missing Supabase environment variables: ${missing.join(", ")}`);
  }

  return {
    url: readPublicSupabaseUrl() as string,
    anonKey: readPublicSupabaseAnonKey() as string,
  };
}

export function getServerSupabaseEnv(): ServerSupabaseEnv {
  return {
    ...getPublicSupabaseEnv(),
    serviceRoleKey: readEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function hasPublicSupabaseEnv(): boolean {
  return getMissingEnv(PUBLIC_SUPABASE_ENV_KEYS).length === 0;
}

export function getSupabaseEnvStatus() {
  return {
    hasUrl: Boolean(readPublicSupabaseUrl()),
    hasAnonKey: Boolean(readPublicSupabaseAnonKey()),
    hasServiceRoleKey: Boolean(readEnv("SUPABASE_SERVICE_ROLE_KEY")),
  };
}
