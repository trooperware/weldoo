import Link from "next/link";
import type { ReactNode } from "react";

type AuthCardProps = {
  activeTab?: "sign-in" | "sign-up";
  children: ReactNode;
  description: ReactNode;
  footer?: ReactNode;
  showTabs?: boolean;
  title: string;
};

export function AuthCard({
  activeTab,
  children,
  description,
  footer,
  showTabs = true,
  title,
}: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f7ff] px-4 py-10">
      <section className="w-full max-w-[36.5rem]">
        <div className="overflow-hidden rounded-[1.25rem] border border-weldoo-border bg-white shadow-[0_24px_70px_rgba(61,61,180,0.16)]">
          <div className="h-1 bg-[linear-gradient(90deg,#3d3db4_0%,#5558e8_48%,#70e1b6_100%)]" />

          <div className="px-8 pb-8 pt-9 sm:px-10">
            <Link className="mb-8 inline-flex items-center" href="/">
              <span className="text-4xl font-extrabold tracking-normal text-weldoo-indigo">
                weldoo
              </span>
            </Link>

            {showTabs ? (
              <nav
                aria-label="Authentication"
                className="mb-9 flex border-b border-weldoo-border-light"
              >
                <Link
                  className={`-mb-px px-0 pb-3 pr-8 text-base font-bold transition ${
                    activeTab === "sign-in"
                      ? "border-b-4 border-weldoo-indigo text-weldoo-ink"
                      : "text-weldoo-muted hover:text-weldoo-ink"
                  }`}
                  href="/auth/sign-in"
                >
                  Sign in
                </Link>
                <Link
                  className={`-mb-px px-0 pb-3 text-base font-bold transition ${
                    activeTab === "sign-up"
                      ? "border-b-4 border-weldoo-indigo text-weldoo-ink"
                      : "text-weldoo-muted hover:text-weldoo-ink"
                  }`}
                  href="/auth/sign-up"
                >
                  Create account
                </Link>
              </nav>
            ) : null}

            <div>
              <h1 className="text-3xl font-extrabold tracking-normal text-weldoo-ink">
                {title}
              </h1>
              <p className="mt-2 text-base leading-7 text-weldoo-muted">{description}</p>
            </div>

            <div className="mt-7">{children}</div>

            {footer ? (
              <div className="mt-6 text-center text-sm text-weldoo-muted">{footer}</div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

export function AuthSocialButtons() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        className="flex h-12 items-center justify-center gap-3 rounded-weldoo-sm border border-weldoo-border-light bg-white text-sm font-bold text-weldoo-ink shadow-weldoo-sm opacity-70"
        disabled
        type="button"
      >
        <span className="font-black text-[#4285f4]">G</span>
        Google
      </button>
      <button
        className="flex h-12 items-center justify-center gap-3 rounded-weldoo-sm border border-weldoo-border-light bg-white text-sm font-bold text-weldoo-ink shadow-weldoo-sm opacity-70"
        disabled
        type="button"
      >
        <span className="rounded-[0.2rem] bg-[#0a66c2] px-1.5 py-0.5 text-xs font-black text-white">
          in
        </span>
        LinkedIn
      </button>
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-4 text-xs font-bold uppercase tracking-[0.18em] text-weldoo-muted">
      <span className="h-px flex-1 bg-weldoo-border-light" />
      or
      <span className="h-px flex-1 bg-weldoo-border-light" />
    </div>
  );
}
