import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getPostAuthRedirectPath } from "@/lib/auth/redirects";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    passwordReset?: string;
    redirectTo?: string;
  }>;
};

function getOAuthErrorMessage(error?: string, message?: string) {
  if (!error) return undefined;
  const detail = message ? ` ${message}` : "";

  if (error === "oauth_provider") return "Unsupported OAuth provider.";
  if (error === "oauth_callback") return `OAuth sign in could not be completed.${detail}`;

  return `OAuth sign in could not be started. Please try again.${detail}`;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [{ error, message, passwordReset, redirectTo }, user, profile] = await Promise.all([
    searchParams,
    getCurrentUser(),
    getCurrentProfile(),
  ]);

  if (user) {
    redirect(
      getPostAuthRedirectPath({
        onboardingCompleted: Boolean(profile?.onboarding_completed),
        redirectTo,
      }),
    );
  }

  return (
    <AuthCard
      activeTab="sign-in"
      description={
        <>
          No account yet?{" "}
          <Link className="font-medium text-weldoo-indigo" href="/auth/sign-up">
            Create one free
          </Link>
        </>
      }
      footer={
        <>
          Protected by reCAPTCHA · <span className="underline">Privacy</span> ·{" "}
          <span className="underline">Terms</span>
        </>
      }
      title="Welcome back"
    >
      <SignInForm
        oauthError={getOAuthErrorMessage(error, message)}
        redirectTo={redirectTo}
        successMessage={
          passwordReset === "1"
            ? "Password updated. Sign in again with your new password."
            : undefined
        }
      />
    </AuthCard>
  );
}
