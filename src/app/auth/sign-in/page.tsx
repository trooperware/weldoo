import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getCurrentUser } from "@/lib/auth/session";

type SignInPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [{ redirectTo }, user] = await Promise.all([searchParams, getCurrentUser()]);

  if (user) {
    redirect(redirectTo ?? "/dashboard");
  }

  return (
    <AuthCard
      description="Access your Weldoo workspace to manage your profile, network, jobs, and learning activity."
      footer={
        <>
          New to Weldoo?{" "}
          <Link className="font-semibold text-[var(--weldoo-indigo)]" href="/auth/sign-up">
            Create an account
          </Link>
        </>
      }
      title="Sign in"
    >
      <SignInForm redirectTo={redirectTo} />
    </AuthCard>
  );
}
