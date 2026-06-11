import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";

type SignInPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [{ redirectTo }, user, profile] = await Promise.all([
    searchParams,
    getCurrentUser(),
    getCurrentProfile(),
  ]);

  if (user) {
    const redirectPath = getSafeRedirectPath(redirectTo);

    if (
      profile?.onboarding_completed &&
      ["/", "/dashboard", "/onboarding"].includes(redirectPath)
    ) {
      redirect("/");
    }

    if (!profile?.onboarding_completed && ["/", "/dashboard"].includes(redirectPath)) {
      redirect("/onboarding");
    }

    redirect(redirectPath);
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
      <SignInForm redirectTo={redirectTo} />
    </AuthCard>
  );
}
