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
      <SignUpForm />
    </AuthCard>
  );
}
