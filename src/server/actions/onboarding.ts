"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingFieldErrors, onboardingSchema } from "@/lib/validators/onboarding";
import type { AuthFieldErrors } from "@/lib/validators/auth";

export type OnboardingActionState = {
  errors?: AuthFieldErrors;
  message?: string;
  status?: "error" | "success";
};

export async function completeOnboardingAction(
  _state: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  try {
    const parsed = onboardingSchema.safeParse({
      displayName: formData.get("displayName"),
      location: formData.get("location"),
      organizationName: formData.get("organizationName"),
      profileType: formData.get("profileType"),
    });

    if (!parsed.success) {
      return { errors: getOnboardingFieldErrors(parsed.error), status: "error" };
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/auth/sign-in?redirectTo=/onboarding");
    }

    const { displayName, location, organizationName, profileType } = parsed.data;
    const organizationDisplayName = organizationName ?? displayName;
    const publicDisplayName =
      profileType === "professional" ? displayName : organizationDisplayName;

    const { error: profileError } = await supabase.from("profiles").upsert([
      {
        display_name: publicDisplayName,
        id: user.id,
        location: location || null,
        onboarding_completed: false,
        profile_type: profileType,
        status: "active",
      },
    ] as never[]);

    if (profileError) {
      return {
        message: `Could not save base profile: ${profileError.message}`,
        status: "error",
      };
    }

    if (profileType === "professional") {
      const { error } = await supabase.from("professional_profiles").upsert([
        {
          profile_id: user.id,
        },
      ] as never[]);

      if (error) {
        return { message: `Could not save professional profile: ${error.message}`, status: "error" };
      }
    }

    if (profileType === "company") {
      const { data: existingCompany, error: existingError } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_profile_id", user.id)
        .maybeSingle();

      if (existingError) {
        return { message: `Could not check existing company: ${existingError.message}`, status: "error" };
      }

      const existingCompanyId = (existingCompany as { id: string } | null)?.id;

      if (existingCompanyId) {
        const { error } = await supabase
          .from("companies")
          .update({
            location: location || null,
            name: organizationDisplayName,
          } as never)
          .eq("id", existingCompanyId);

        if (error) {
          return { message: `Could not update company: ${error.message}`, status: "error" };
        }
      } else {
        const { error } = await supabase.from("companies").insert([
          {
            location: location || null,
            name: organizationDisplayName,
            owner_profile_id: user.id,
          },
        ] as never[]);

        if (error) {
          return { message: `Could not create company: ${error.message}`, status: "error" };
        }
      }
    }

    if (profileType === "training_provider") {
      const { data: existingProvider, error: existingError } = await supabase
        .from("training_providers")
        .select("id")
        .eq("owner_profile_id", user.id)
        .maybeSingle();

      if (existingError) {
        return {
          message: `Could not check existing training provider: ${existingError.message}`,
          status: "error",
        };
      }

      const existingProviderId = (existingProvider as { id: string } | null)?.id;

      if (existingProviderId) {
        const { error } = await supabase
          .from("training_providers")
          .update({
            location: location || null,
            name: organizationDisplayName,
          } as never)
          .eq("id", existingProviderId);

        if (error) {
          return { message: `Could not update training provider: ${error.message}`, status: "error" };
        }
      } else {
        const { error } = await supabase.from("training_providers").insert([
          {
            location: location || null,
            name: organizationDisplayName,
            owner_profile_id: user.id,
          },
        ] as never[]);

        if (error) {
          return { message: `Could not create training provider: ${error.message}`, status: "error" };
        }
      }
    }

    const { error: completionError } = await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
        profile_type: profileType,
      } as never)
      .eq("id", user.id);

    if (completionError) {
      return {
        message: `Could not complete onboarding: ${completionError.message}`,
        status: "error",
      };
    }

    redirect("/dashboard");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      message: error instanceof Error ? error.message : "Could not complete onboarding.",
      status: "error",
    };
  }
}

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}
