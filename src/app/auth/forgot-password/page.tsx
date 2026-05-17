import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      description="Enter your account email and Weldoo will send you a secure password reset link."
      showTabs={false}
      footer={
        <Link className="font-semibold text-weldoo-indigo" href="/auth/sign-in">
          Back to sign in
        </Link>
      }
      title="Reset your password"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
