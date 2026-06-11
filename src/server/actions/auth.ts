"use server";

import { redirect } from "next/navigation";

import { getAuthCallbackUrl, getSafeRedirectPath } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  getFieldErrors,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  type AuthFieldErrors,
} from "@/lib/validators/auth";

export type AuthActionState = {
  errors?: AuthFieldErrors;
  message?: string;
  status?: "error" | "success";
};

const DEFAULT_ERROR = "Something went wrong. Please try again.";
const feedRedirectPaths = new Set(["/", "/dashboard", "/onboarding"]);

function getErrorState(message = DEFAULT_ERROR): AuthActionState {
  return { message, status: "error" };
}

async function getPostSignInRedirectPath(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  redirectTo: FormDataEntryValue | string | null | undefined,
) {
  const safeRedirectPath = getSafeRedirectPath(redirectTo);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return safeRedirectPath;
  }

  const { data } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();
  const profile = data as { onboarding_completed: boolean | null } | null;

  if (profile?.onboarding_completed && feedRedirectPaths.has(safeRedirectPath)) {
    return "/";
  }

  if (!profile?.onboarding_completed && ["/", "/dashboard"].includes(safeRedirectPath)) {
    return "/onboarding";
  }

  return safeRedirectPath;
}

export async function signInAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo"),
  });

  if (!parsed.success) {
    return { errors: getFieldErrors(parsed.error), status: "error" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return getErrorState(error.message);
  }

  redirect(await getPostSignInRedirectPath(supabase, parsed.data.redirectTo));
}

export async function signUpAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    purposes: formData.get("purposes"),
  });

  if (!parsed.success) {
    return { errors: getFieldErrors(parsed.error), status: "error" };
  }

  const supabase = await createSupabaseServerClient();
  const fullName = [parsed.data.firstName, parsed.data.lastName]
    .filter(Boolean)
    .join(" ");
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        full_name: fullName || undefined,
        purposes: parsed.data.purposes,
      },
      emailRedirectTo: getAuthCallbackUrl("/auth/callback?next=/onboarding"),
    },
  });

  if (error) {
    return getErrorState(error.message);
  }

  return {
    message: "Account created. Check your email to confirm your address.",
    status: "success",
  };
}

export async function forgotPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { errors: getFieldErrors(parsed.error), status: "error" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: getAuthCallbackUrl("/auth/callback?next=/auth/reset-password"),
  });

  if (error) {
    return getErrorState(error.message);
  }

  return {
    message: "Password reset link sent. Check your email.",
    status: "success",
  };
}

export async function resetPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: getFieldErrors(parsed.error), status: "error" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return getErrorState(error.message);
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/sign-in");
}
