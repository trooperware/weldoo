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
      activeTab="sign-in"
      description={
        <>
          No account yet?{" "}
          <Link className="font-bold text-weldoo-indigo" href="/auth/sign-up">
            Create one free
          </Link>
        </>
      }
      footer={
        <>
          <span className="underline">Privacy</span> |{" "}
          <span className="underline">Terms</span>
        </>
      }
      title="Welcome back"
    >
      <SignInForm redirectTo={redirectTo} />
    </AuthCard>
  );
}
