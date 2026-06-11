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
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f7ff] p-6 max-[480px]:p-0">
      <section className="w-full max-w-[448px]">
        <div className="overflow-hidden rounded-[18px] border border-weldoo-border-light bg-white shadow-weldoo-xl max-[480px]:min-h-screen max-[480px]:rounded-none max-[480px]:border-0 max-[480px]:bg-transparent max-[480px]:shadow-none">
          <div className="h-[3px] bg-[linear-gradient(90deg,#3d3db4_0%,#7b7fe8_34%,#42b8d4_68%,#5ce8b4_100%)]" />

          <div className="px-7 pb-8 pt-9 sm:px-10 max-[480px]:px-6 max-[480px]:pb-6 max-[480px]:pt-7">
            <Link className="mb-[26px] inline-flex items-center" href="/">
              <WeldooLogo />
            </Link>

            {showTabs ? (
              <nav
                aria-label="Authentication"
                className="mb-7 flex border-b-[1.5px] border-weldoo-border-light"
              >
                <Link
                  className={`relative mr-7 pb-2.5 text-[15.4px] font-semibold tracking-[-0.01em] transition ${
                    activeTab === "sign-in"
                      ? "after:absolute after:inset-x-0 after:bottom-[-1.5px] after:h-[2.5px] after:rounded-full after:bg-weldoo-indigo text-weldoo-ink"
                      : "text-weldoo-muted hover:text-weldoo-ink"
                  }`}
                  href="/auth/sign-in"
                >
                  Sign in
                </Link>
                <Link
                  className={`relative pb-2.5 text-[15.4px] font-semibold tracking-[-0.01em] transition ${
                    activeTab === "sign-up"
                      ? "after:absolute after:inset-x-0 after:bottom-[-1.5px] after:h-[2.5px] after:rounded-full after:bg-weldoo-indigo text-weldoo-ink"
                      : "text-weldoo-muted hover:text-weldoo-ink"
                  }`}
                  href="/auth/sign-up"
                >
                  Create account
                </Link>
              </nav>
            ) : null}

            <div>
              <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.3px] text-weldoo-ink">
                {title}
              </h1>
              <p className="mt-[5px] text-[14.9px] leading-[1.5] text-weldoo-muted">
                {description}
              </p>
            </div>

            <div className="mt-6">{children}</div>

            {footer ? (
              <div className="mt-3.5 text-center text-[12.7px] leading-[1.6] text-weldoo-muted">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

export function WeldooLogo() {
  return (
    <svg
      aria-label="weldoo"
      className="h-6 w-auto"
      fill="none"
      role="img"
      viewBox="0 0 251 59"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M179.64 55.19C175.65 55.19 172.13 54.35 169.09 52.67C166.1 50.94 163.76 48.57 162.08 45.58C160.4 42.54 159.56 39.02 159.56 35.03C159.56 31.04 160.4 27.55 162.08 24.56C163.76 21.52 166.1 19.15 169.09 17.47C172.13 15.74 175.65 14.88 179.64 14.88C183.63 14.88 187.12 15.74 190.11 17.47C193.16 19.15 195.52 21.52 197.2 24.56C198.88 27.55 199.72 31.04 199.72 35.03C199.72 39.02 198.88 42.54 197.2 45.58C195.52 48.57 193.16 50.94 190.11 52.67C187.12 54.35 183.63 55.19 179.64 55.19ZM179.64 45.19C182.48 45.19 184.78 44.24 186.57 42.35C188.35 40.46 189.25 38.02 189.25 35.03C189.25 31.99 188.35 29.52 186.57 27.63C184.78 25.74 182.48 24.8 179.64 24.8C176.81 24.8 174.5 25.74 172.71 27.63C170.98 29.47 170.11 31.91 170.11 34.95C170.11 38 170.98 40.46 172.71 42.35C174.5 44.24 176.81 45.19 179.64 45.19Z" fill="#3d3db4" />
      <path d="M134.68 55.19C131.16 55.19 128.06 54.32 125.39 52.59C122.71 50.86 120.64 48.47 119.17 45.43C117.7 42.38 116.96 38.89 116.96 34.95C116.96 30.96 117.7 27.47 119.17 24.48C120.69 21.44 122.79 19.07 125.47 17.39C128.14 15.72 131.21 14.88 134.68 14.88C138.09 14.88 141.06 15.66 143.57 17.24C146.09 18.81 148.06 21.1 149.48 24.09C150.9 27.08 151.61 30.7 151.61 34.95C151.61 39.05 150.9 42.62 149.48 45.66C148.06 48.65 146.07 50.99 143.5 52.67C140.98 54.35 138.04 55.19 134.68 55.19ZM136.49 45.66C139.17 45.66 141.34 44.69 143.02 42.75C144.7 40.75 145.54 38.18 145.54 35.03C145.54 31.83 144.7 29.26 143.02 27.32C141.34 25.32 139.17 24.32 136.49 24.32C133.86 24.32 131.69 25.32 129.95 27.32C128.27 29.26 127.43 31.8 127.43 34.95C127.43 38.1 128.27 40.67 129.95 42.67C131.69 44.66 133.86 45.66 136.49 45.66ZM147.67 54.24L145.07 45.11H145.78V25.82H145.07V0.62H155.39V54.24H147.67Z" fill="#3d3db4" />
      <path d="M109.93 54.64C108.2 54.64 106.6 54.27 105.13 53.54C103.71 52.8 102.56 51.67 101.66 50.15C100.82 48.57 100.4 46.55 100.4 44.09V0.62H110.64V40.46C110.64 42.3 111.01 43.51 111.74 44.09C112.48 44.61 113.37 44.87 114.42 44.87V54.09C113.84 54.3 113.13 54.43 112.29 54.48C111.51 54.59 110.72 54.64 109.93 54.64Z" fill="#3d3db4" />
      <path d="M77.03 55.03C73.2 55.03 69.84 54.22 66.96 52.59C64.07 50.91 61.84 48.57 60.26 45.58C58.69 42.59 57.9 39.07 57.9 35.03C57.9 31.04 58.69 27.55 60.26 24.56C61.84 21.52 64.07 19.15 66.96 17.47C69.84 15.74 73.2 14.88 77.03 14.88C80.92 14.88 84.28 15.74 87.11 17.47C90 19.21 92.23 21.59 93.81 24.64C95.38 27.63 96.17 31.07 96.17 34.95C96.17 35.53 96.14 36.11 96.09 36.69C96.09 37.21 96.04 37.66 95.93 38.02H66.33V30.31H88.14L86.56 34.01C86.56 30.75 85.77 28.1 84.2 26.06C82.68 24.01 80.29 22.99 77.03 22.99C74.2 22.99 71.92 23.88 70.18 25.66C68.45 27.39 67.59 29.73 67.59 32.67V36.84C67.59 39.94 68.45 42.38 70.18 44.17C71.97 45.9 74.38 46.76 77.43 46.76C80.11 46.76 82.21 46.21 83.73 45.11C85.25 44.01 86.56 42.64 87.66 41.02L94.83 45.11C93.1 48.31 90.73 50.78 87.74 52.51C84.8 54.19 81.23 55.03 77.03 55.03Z" fill="#3d3db4" />
      <path d="M12.54 54.24L0.81 15.74H10.97L19.16 45.11H16.09L25.54 15.74H33.88L43.33 45.11H40.34L48.53 15.74H58.37L46.56 54.24H37.43L28.29 26.69H31.13L21.91 54.24H12.54Z" fill="#3d3db4" />
      <path clipRule="evenodd" d="M227.67 56.44C239.29 56.44 248.71 47.02 248.71 35.4C248.71 23.78 239.29 14.36 227.67 14.36C216.04 14.36 206.62 23.78 206.62 35.4C206.62 47.02 216.04 56.44 227.67 56.44ZM227.67 58.55C240.45 58.55 250.81 48.19 250.81 35.4C250.81 22.62 240.45 12.25 227.67 12.25C214.88 12.25 204.52 22.62 204.52 35.4C204.52 48.19 214.88 58.55 227.67 58.55Z" fill="#3d3db4" fillRule="evenodd" />
      <path d="M238.19 35.66C238.19 41.33 233.59 45.92 227.93 45.92C222.26 45.92 217.67 41.33 217.67 35.66C217.67 30 222.26 25.41 227.93 25.41C233.59 25.41 238.19 30 238.19 35.66Z" fill="#3d3db4" />
    </svg>
  );
}

type AuthSocialButtonsProps = {
  redirectTo?: string;
  source?: "sign-in" | "sign-up";
};

export function AuthSocialButtons({
  redirectTo = "/",
  source = "sign-in",
}: AuthSocialButtonsProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      <form action="/auth/oauth" method="get">
        <input name="provider" type="hidden" value="google" />
        <input name="redirectTo" type="hidden" value={redirectTo} />
        <input name="source" type="hidden" value={source} />
        <button
          className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-weldoo-border-light bg-white text-[14.3px] font-medium tracking-[-0.01em] text-weldoo-ink shadow-weldoo-sm transition hover:border-[#c8c8e4] hover:bg-weldoo-bg hover:shadow-weldoo-md"
          type="submit"
        >
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>
      </form>
      <form action="/auth/oauth" method="get">
        <input name="provider" type="hidden" value="linkedin_oidc" />
        <input name="redirectTo" type="hidden" value={redirectTo} />
        <input name="source" type="hidden" value={source} />
        <button
          className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-weldoo-border-light bg-white text-[14.3px] font-medium tracking-[-0.01em] text-weldoo-ink shadow-weldoo-sm transition hover:border-[#c8c8e4] hover:bg-weldoo-bg hover:shadow-weldoo-md"
          type="submit"
        >
          <span className="flex h-[15px] w-[15px] items-center justify-center rounded-[2px] bg-[#0077b5] text-[11px] font-bold leading-none text-white">
            in
          </span>
          LinkedIn
        </button>
      </form>
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="mb-[18px] mt-[18px] flex items-center gap-2.5 text-[12.7px] font-medium uppercase tracking-[0.05em] text-weldoo-muted">
      <span className="h-px flex-1 bg-weldoo-border-light" />
      or
      <span className="h-px flex-1 bg-weldoo-border-light" />
    </div>
  );
}
