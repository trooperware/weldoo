import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <AuthCard
      description="Choose a new password for your Weldoo account."
      showTabs={false}
      title="Set new password"
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
