import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function SignUpPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthCard
      description="Create your Weldoo account. Onboarding will collect your role and profile details in the next sprint task."
      footer={
        <>
          Already have an account?{" "}
          <Link className="font-semibold text-[var(--weldoo-indigo)]" href="/auth/sign-in">
            Sign in
          </Link>
        </>
      }
      title="Create account"
    >
      <SignUpForm />
    </AuthCard>
  );
}
