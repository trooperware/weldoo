import Link from "next/link";
import type { ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
  description: string;
  footer?: ReactNode;
  title: string;
};

export function AuthCard({ children, description, footer, title }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--weldoo-bg)] px-4 py-10">
      <section className="w-full max-w-md">
        <Link className="mb-6 flex items-center justify-center gap-3" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-[var(--weldoo-radius-sm)] bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-sm font-bold text-white shadow-weldoo-sm">
            W
          </span>
          <span>
            <span className="block text-lg font-bold leading-5">Weldoo</span>
            <span className="block text-xs font-medium text-[var(--weldoo-muted)]">
              Professional network for welders
            </span>
          </span>
        </Link>

        <div className="rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white p-6 shadow-weldoo-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-normal text-[var(--weldoo-ink)]">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--weldoo-muted)]">
              {description}
            </p>
          </div>
          <div className="mt-6">{children}</div>
        </div>

        {footer ? (
          <div className="mt-5 text-center text-sm text-[var(--weldoo-muted)]">
            {footer}
          </div>
        ) : null}
      </section>
    </main>
  );
}
