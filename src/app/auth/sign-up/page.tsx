import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getPostAuthRedirectPath } from "@/lib/auth/redirects";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";

type SignUpPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

function getOAuthErrorMessage(error?: string, message?: string) {
  if (!error) return undefined;
  const detail = message ? ` ${message}` : "";

  if (error === "oauth_provider") return "Unsupported OAuth provider.";
  if (error === "oauth_callback") return `OAuth sign up could not be completed.${detail}`;

  return `OAuth sign up could not be started. Please try again.${detail}`;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const [{ error, message }, user, profile] = await Promise.all([
    searchParams,
    getCurrentUser(),
    getCurrentProfile(),
  ]);

  if (user) {
    redirect(
      getPostAuthRedirectPath({
        onboardingCompleted: Boolean(profile?.onboarding_completed),
        redirectTo: "/",
      }),
    );
  }

  return (
    <AuthCard
      activeTab="sign-up"
      description={
        <>
          Already have an account?{" "}
          <Link className="font-medium text-weldoo-indigo" href="/auth/sign-in">
            Sign in
          </Link>
        </>
      }
      footer={
        <>
          By signing up you agree to our <span className="underline">Terms</span> and{" "}
          <span className="underline">Privacy Policy</span>.
        </>
      }
      title="Join Weldoo"
    >
      <SignUpForm oauthError={getOAuthErrorMessage(error, message)} />
    </AuthCard>
  );
}
