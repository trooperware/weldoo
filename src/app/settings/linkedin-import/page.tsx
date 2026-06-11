import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { LinkedInImportReview } from "@/components/settings/linkedin-import-review";
import { FormError } from "@/components/ui";
import {
  getLinkedInProfileImport,
  hasLinkedInIdentity,
} from "@/lib/auth/linkedin-profile-import";
import { getAppShellAuth, requireCompletedOnboarding } from "@/lib/auth/session";

type LinkedInImportPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    status?: string;
  }>;
};

function getErrorMessage(error?: string, message?: string) {
  if (!error) return null;

  if (message) return message;

  if (error === "oauth_callback") {
    return "LinkedIn connection could not be completed.";
  }

  if (error === "link_start") {
    return "LinkedIn connection could not be started.";
  }

  return "LinkedIn import could not be completed.";
}

export default async function LinkedInImportPage({
  searchParams,
}: LinkedInImportPageProps) {
  const [{ error, message, status }, { profile, user }, appShellAuth] = await Promise.all([
    searchParams,
    requireCompletedOnboarding(),
    getAppShellAuth(),
  ]);
  const isConnected = hasLinkedInIdentity(user);
  const importedProfile = getLinkedInProfileImport(user);
  const errorMessage = getErrorMessage(error, message);

  return (
    <AppShell auth={appShellAuth}>
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-[960px]">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-weldoo-indigo">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-weldoo-ink">
              LinkedIn profile import
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-weldoo-muted">
              Connect LinkedIn and review the profile data returned by the official
              OpenID Connect flow before applying anything to your Weldoo profile.
            </p>
          </div>

          <div className="rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm">
            <div className="border-b border-weldoo-border-light px-5 py-4">
              <h2 className="text-[15.4px] font-bold text-weldoo-ink">
                LinkedIn connection
              </h2>
              <p className="mt-1 text-[12.1px] text-weldoo-muted">
                Current status: {isConnected ? "Connected" : "Not connected"}
              </p>
            </div>

            <div className="space-y-5 px-5 py-5">
              <FormError>{errorMessage}</FormError>

              {status === "success" ? (
                <div className="rounded-weldoo-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  LinkedIn profile data imported.
                </div>
              ) : null}

              {!isConnected ? (
                <div className="rounded-weldoo-md border border-weldoo-border-light bg-weldoo-bg p-4">
                  <p className="text-[13.2px] font-bold text-weldoo-ink">
                    Connect LinkedIn to import profile data
                  </p>
                  <p className="mt-2 max-w-2xl text-[12.1px] leading-5 text-weldoo-muted">
                    Weldoo will request the standard LinkedIn OIDC scopes: openid,
                    profile, and email. We will show the returned data for review before
                    updating your profile.
                  </p>
                  <Link
                    className="mt-4 inline-flex h-9 items-center justify-center rounded-weldoo-sm bg-weldoo-indigo px-4 text-[12.5px] font-semibold text-white shadow-weldoo-md transition hover:brightness-105"
                    href="/auth/linkedin/connect"
                  >
                    Connect LinkedIn
                  </Link>
                </div>
              ) : null}

              {isConnected && importedProfile ? (
                <LinkedInImportReview
                  currentProfile={{
                    avatarUrl: profile.avatar_url,
                    displayName: profile.display_name,
                    headline: profile.headline,
                  }}
                  importedProfile={importedProfile}
                />
              ) : null}

              {isConnected && !importedProfile ? (
                <div className="rounded-weldoo-md border border-weldoo-border-light bg-weldoo-bg p-4">
                  <p className="text-[13.2px] font-bold text-weldoo-ink">
                    LinkedIn is connected, but no profile data was returned
                  </p>
                  <p className="mt-2 text-[12.1px] leading-5 text-weldoo-muted">
                    You can keep editing your Weldoo profile manually. LinkedIn may not
                    return every field for every account.
                  </p>
                </div>
              ) : null}

              <div className="border-t border-weldoo-border-light pt-4">
                <Link
                  className="text-[12.5px] font-semibold text-weldoo-indigo hover:underline"
                  href="/settings"
                >
                  Back to settings
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
