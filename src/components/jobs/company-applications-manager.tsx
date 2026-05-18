"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, FormError } from "@/components/ui";
import type { JobApplicationSummary } from "@/lib/jobs/applications";

type CompanyApplicationsManagerProps = {
  applications: JobApplicationSummary[];
};

type SaveState = {
  message?: string;
  status?: "error" | "success";
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  if (status === "contacted") return "Contacted";
  if (status === "rejected") return "Rejected";
  if (status === "viewed") return "Viewed";
  return "Submitted";
}

export function CompanyApplicationsManager({
  applications,
}: CompanyApplicationsManagerProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [state, setState] = useState<SaveState>({});

  async function updateStatus(applicationId: string, status: "contacted" | "rejected" | "viewed") {
    setPendingId(applicationId);
    setState({});

    try {
      const response = await fetch(`/api/company/applications/${applicationId}`, {
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = (await response.json()) as SaveState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      setState({
        message: payload.message ?? "Application updated.",
        status: "success",
      });
      router.refresh();
    } catch (error) {
      setState({
        message:
          error instanceof Error ? error.message : "Could not update application.",
        status: "error",
      });
    } finally {
      setPendingId(null);
    }
  }

  if (!applications.length) {
    return (
      <div className="rounded-[16px] border border-weldoo-border-light bg-white p-8 text-center shadow-weldoo-sm">
        <h2 className="text-xl font-extrabold text-weldoo-ink">No applications yet</h2>
        <p className="mt-2 text-sm text-weldoo-muted">
          Applications to your published jobs will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormError>{state.status === "error" ? state.message : null}</FormError>
      {state.status === "success" && state.message ? (
        <div className="rounded-weldoo-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {state.message}
        </div>
      ) : null}

      {applications.map((application) => (
        <article
          className="rounded-[16px] border border-weldoo-border-light bg-white p-5 shadow-weldoo-sm"
          key={application.id}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-extrabold text-weldoo-ink">
                  {application.applicant?.display_name ?? "Weldoo professional"}
                </h2>
                <span className="rounded-full bg-weldoo-indigo/10 px-2.5 py-1 text-[11px] font-bold text-weldoo-indigo">
                  {statusLabel(application.status)}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-weldoo-muted">
                {application.applicant?.headline ?? "Professional profile"} ·{" "}
                {application.applicant?.location ?? "Location not set"}
              </p>
              <p className="mt-1 text-[13px] font-semibold text-weldoo-ink">
                {application.job?.title ?? "Job"}
              </p>
              <p className="mt-1 text-[12px] text-weldoo-muted">
                Applied {formatDate(application.created_at)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={pendingId === application.id}
                onClick={() => updateStatus(application.id, "viewed")}
                size="sm"
                type="button"
                variant="ghost"
              >
                Mark viewed
              </Button>
              <Button
                disabled={pendingId === application.id}
                onClick={() => updateStatus(application.id, "contacted")}
                size="sm"
                type="button"
                variant="secondary"
              >
                Contacted
              </Button>
              <Button
                disabled={pendingId === application.id}
                onClick={() => updateStatus(application.id, "rejected")}
                size="sm"
                type="button"
                variant="danger"
              >
                Reject
              </Button>
            </div>
          </div>

          {application.message ? (
            <p className="mt-4 whitespace-pre-line rounded-weldoo-sm bg-weldoo-bg px-4 py-3 text-sm leading-6 text-weldoo-ink">
              {application.message}
            </p>
          ) : null}

          {application.external_cv_url ? (
            <a
              className="mt-3 inline-flex text-[12.5px] font-semibold text-weldoo-indigo hover:underline"
              href={application.external_cv_url}
              rel="noreferrer"
              target="_blank"
            >
              Open external CV
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}
