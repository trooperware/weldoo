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

function getErrorState(message = DEFAULT_ERROR): AuthActionState {
  return { message, status: "error" };
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

  redirect(getSafeRedirectPath(parsed.data.redirectTo));
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
