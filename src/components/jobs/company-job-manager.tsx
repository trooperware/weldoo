"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { Button, FormError, Input, Modal, Select, Textarea } from "@/components/ui";
import type { CompanyForJobs, CompanyJob } from "@/lib/jobs/company-management";
import type { JobFieldErrors } from "@/lib/validators/job";

type SaveState = {
  errors?: JobFieldErrors;
  jobId?: string;
  message?: string;
  status?: "error" | "success";
};

type CompanyJobManagerProps = {
  company: CompanyForJobs;
  jobs: CompanyJob[];
};

type JobStatusAction = "close" | "draft" | "publish" | "reopen";

type ConfirmationState = {
  action: Exclude<JobStatusAction, "publish" | "reopen">;
  description: string;
  jobId: string;
  title: string;
} | null;

const emptyJob = {
  benefits: [],
  contract_type: null,
  description: "",
  experience_level: null,
  id: "",
  location: null,
  materials: [],
  required_certifications: [],
  requirements: null,
  responsibilities: null,
  salary_currency: "EUR",
  salary_max: null,
  salary_min: null,
  status: "draft",
  title: "",
  travel_required: false,
  welding_processes: [],
  work_mode: null,
} satisfies Partial<CompanyJob> & { id: string };

function listToText(values?: string[] | null) {
  return values?.join(", ") ?? "";
}

function statusLabel(status: CompanyJob["status"]) {
  if (status === "published") return "Published";
  if (status === "closed") return "Closed";
  if (status === "archived") return "Archived";
  return "Draft";
}

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function CompanyJobManager({ company, jobs }: CompanyJobManagerProps) {
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState>(null);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SaveState>({});

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? emptyJob,
    [jobs, selectedJobId],
  );
  const isEditing = Boolean(selectedJobId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState({});

    try {
      const formData = new FormData(event.currentTarget);
      const submitter = (event.nativeEvent as SubmitEvent).submitter;

      if (submitter instanceof HTMLButtonElement && submitter.name) {
        formData.set(submitter.name, submitter.value);
      }
      const response = await fetch("/api/company/jobs", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json()) as SaveState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      setState({
        jobId: payload.jobId,
        message: payload.message ?? "Job saved.",
        status: "success",
      });
      setSelectedJobId(payload.jobId ?? null);
      router.refresh();
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not save job.",
        status: "error",
      });
    } finally {
      setPending(false);
    }
  }

  async function updateStatus(jobId: string, action: JobStatusAction) {
    setPending(true);
    setState({});

    try {
      const response = await fetch(`/api/company/jobs/${jobId}/status`, {
        body: JSON.stringify({ action }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = (await response.json()) as SaveState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      setState({
        message: payload.message ?? "Job status updated.",
        status: "success",
      });
      setConfirmation(null);
      router.refresh();
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not update job status.",
        status: "error",
      });
    } finally {
      setPending(false);
    }
  }

  function requestStatusConfirmation(
    jobId: string,
    action: Exclude<JobStatusAction, "publish" | "reopen">,
  ) {
    const job = jobs.find((item) => item.id === jobId);
    const jobTitle = job?.title ?? "this job";

    setConfirmation({
      action,
      description:
        action === "close"
          ? "This will remove the job from active hiring and candidates will no longer be able to apply. This action changes the public state of the job."
          : "This will unpublish the job and remove it from the public jobs board. Existing applications remain stored, but the job will no longer be visible publicly.",
      jobId,
      title: action === "close" ? `Close ${jobTitle}?` : `Move ${jobTitle} to draft?`,
    });
  }

  return (
    <>
      <Modal
        description={confirmation?.description}
        footer={
          <>
            <Button
              disabled={pending}
              onClick={() => setConfirmation(null)}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              disabled={pending}
              onClick={() =>
                confirmation
                  ? updateStatus(confirmation.jobId, confirmation.action)
                  : undefined
              }
              type="button"
              variant="danger"
            >
              {pending
                ? "Updating"
                : confirmation?.action === "close"
                  ? "Close job"
                  : "Move to draft"}
            </Button>
          </>
        }
        onOpenChange={(open) => {
          if (!open && !pending) setConfirmation(null);
        }}
        open={Boolean(confirmation)}
        title={confirmation?.title ?? "Confirm job status change"}
      >
        <div className="rounded-weldoo-sm border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium leading-5 text-red-700">
          This action affects the public job posting. Review it carefully before continuing.
        </div>
      </Modal>

      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-[16px] border border-weldoo-border-light bg-white shadow-weldoo-sm">
        <div className="border-b border-weldoo-border-light px-5 py-4">
          <h2 className="text-[15px] font-bold text-weldoo-ink">Company jobs</h2>
          <p className="mt-1 text-[12.5px] text-weldoo-muted">
            {company.name} · {jobs.length} jobs
          </p>
        </div>
        <div className="divide-y divide-weldoo-border-light">
          <button
            className={[
              "flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-weldoo-bg",
              !selectedJobId ? "bg-weldoo-indigo/[0.06]" : "",
            ].join(" ")}
            onClick={() => {
              setSelectedJobId(null);
              setState({});
            }}
            type="button"
          >
            <span>
              <span className="block text-[13.5px] font-bold text-weldoo-ink">
                New job
              </span>
              <span className="mt-0.5 block text-[12px] text-weldoo-muted">
                Create a draft or publish directly
              </span>
            </span>
            <span className="text-lg font-semibold text-weldoo-indigo">+</span>
          </button>
          {jobs.map((job) => (
            <button
              className={[
                "flex w-full items-start justify-between gap-3 px-5 py-4 text-left transition hover:bg-weldoo-bg",
                selectedJobId === job.id ? "bg-weldoo-indigo/[0.06]" : "",
              ].join(" ")}
              key={job.id}
              onClick={() => {
                setSelectedJobId(job.id);
                setState({});
              }}
              type="button"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-bold text-weldoo-ink">
                  {job.title}
                </span>
                <span className="mt-0.5 block text-[12px] text-weldoo-muted">
                  {statusLabel(job.status)}
                  {job.published_at ? ` · Published ${formatDate(job.published_at)}` : ""}
                </span>
              </span>
              <span
                className={[
                  "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                  job.status === "published"
                    ? "bg-emerald-50 text-emerald-700"
                    : job.status === "closed"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-weldoo-indigo/10 text-weldoo-indigo",
                ].join(" ")}
              >
                {statusLabel(job.status)}
              </span>
            </button>
          ))}
        </div>
        </aside>

        <section className="rounded-[16px] border border-weldoo-border-light bg-white p-5 shadow-weldoo-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 border-b border-weldoo-border-light pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-weldoo-indigo">
              {isEditing ? "Edit job" : "New job"}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-weldoo-ink">
              {isEditing ? selectedJob.title : "Create job posting"}
            </h2>
            <p className="mt-1 text-sm text-weldoo-muted">
              Save as draft while preparing, or publish when the offer is ready.
            </p>
          </div>
          {selectedJobId && selectedJob.status === "published" ? (
            <Link
              className="inline-flex h-9 items-center justify-center rounded-full border border-weldoo-border-light px-4 text-[12px] font-semibold text-weldoo-slate transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
              href={`/jobs?job=${selectedJobId}`}
            >
              View public job
            </Link>
          ) : null}
        </div>

        <FormError>{state.status === "error" ? state.message : null}</FormError>
        {state.status === "success" && state.message ? (
          <div
            className="mb-4 rounded-weldoo-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
            role="status"
          >
            {state.message}
          </div>
        ) : null}

        <form
          className="space-y-5"
          key={selectedJob.id || "new-job"}
          noValidate
          onSubmit={handleSubmit}
        >
          <input name="jobId" type="hidden" value={selectedJob.id} />

          <Input
            defaultValue={selectedJob.title ?? ""}
            error={state.errors?.title}
            id="title"
            label="Job title"
            name="title"
            placeholder="TIG Welder - Stainless Steel Assemblies"
          />

          <section className="grid gap-4 sm:grid-cols-2">
            <Input
              defaultValue={selectedJob.location ?? company.location ?? ""}
              error={state.errors?.location}
              id="location"
              label="Location"
              name="location"
              placeholder="Barcelona, Spain"
            />
            <Input
              defaultValue={selectedJob.experience_level ?? ""}
              error={state.errors?.experienceLevel}
              id="experienceLevel"
              label="Experience level"
              name="experienceLevel"
              placeholder="3+ years"
            />
            <Select
              defaultValue={selectedJob.work_mode ?? ""}
              error={state.errors?.workMode}
              id="workMode"
              label="Work mode"
              name="workMode"
            >
              <option value="">Select work mode</option>
              <option value="on_site">On-site</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </Select>
            <Select
              defaultValue={selectedJob.contract_type ?? ""}
              error={state.errors?.contractType}
              id="contractType"
              label="Contract type"
              name="contractType"
            >
              <option value="">Select contract type</option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
              <option value="freelance">Freelance</option>
            </Select>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <Input
              defaultValue={selectedJob.salary_min ?? ""}
              error={state.errors?.salaryMin}
              id="salaryMin"
              label="Salary min"
              min={0}
              name="salaryMin"
              placeholder="32000"
              type="number"
            />
            <Input
              defaultValue={selectedJob.salary_max ?? ""}
              error={state.errors?.salaryMax}
              id="salaryMax"
              label="Salary max"
              min={0}
              name="salaryMax"
              placeholder="42000"
              type="number"
            />
            <Input
              defaultValue={selectedJob.salary_currency ?? "EUR"}
              error={state.errors?.salaryCurrency}
              id="salaryCurrency"
              label="Currency"
              maxLength={3}
              name="salaryCurrency"
              placeholder="EUR"
            />
          </section>

          <Textarea
            defaultValue={selectedJob.description ?? ""}
            error={state.errors?.description}
            id="description"
            label="Description"
            name="description"
            placeholder="Describe the role, workshop context, project type, and what the welder will do."
            rows={5}
          />
          <section className="grid gap-4 sm:grid-cols-2">
            <Textarea
              defaultValue={selectedJob.responsibilities ?? ""}
              error={state.errors?.responsibilities}
              id="responsibilities"
              label="Responsibilities"
              name="responsibilities"
              placeholder="Prepare joints, perform TIG welding, document completed work..."
              rows={4}
            />
            <Textarea
              defaultValue={selectedJob.requirements ?? ""}
              error={state.errors?.requirements}
              id="requirements"
              label="Requirements"
              name="requirements"
              placeholder="EN ISO certification, drawing reading, stainless steel experience..."
              rows={4}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <Textarea
              defaultValue={listToText(selectedJob.welding_processes)}
              error={state.errors?.weldingProcesses}
              id="weldingProcesses"
              label="Welding processes"
              name="weldingProcesses"
              placeholder="TIG, MIG/MAG, SMAW"
              rows={3}
            />
            <Textarea
              defaultValue={listToText(selectedJob.materials)}
              error={state.errors?.materials}
              id="materials"
              label="Materials"
              name="materials"
              placeholder="Stainless steel, carbon steel, aluminium"
              rows={3}
            />
            <Textarea
              defaultValue={listToText(selectedJob.required_certifications)}
              error={state.errors?.requiredCertifications}
              id="requiredCertifications"
              label="Required certifications"
              name="requiredCertifications"
              placeholder="EN ISO 9606-1, CSWIP"
              rows={3}
            />
            <Textarea
              defaultValue={listToText(selectedJob.benefits)}
              error={state.errors?.benefits}
              id="benefits"
              label="Benefits"
              name="benefits"
              placeholder="Private insurance, overtime paid, training budget"
              rows={3}
            />
          </section>

          <label className="flex items-center gap-2 text-[13px] font-semibold text-weldoo-ink">
            <input
              className="h-4 w-4 rounded border-weldoo-border-light accent-weldoo-indigo"
              defaultChecked={selectedJob.travel_required ?? false}
              name="travelRequired"
              type="checkbox"
            />
            Travel required
          </label>

          <div className="flex flex-wrap items-center gap-2 border-t border-weldoo-border-light pt-5">
            <Button disabled={pending} name="status" size="sm" type="submit" value="draft" variant="ghost">
              Save draft
            </Button>
            <Button disabled={pending} name="status" size="sm" type="submit" value="published">
              Publish
            </Button>
            {selectedJobId && selectedJob.status === "published" ? (
              <Button
                disabled={pending}
                onClick={() => requestStatusConfirmation(selectedJobId, "close")}
                size="sm"
                type="button"
                variant="secondary"
              >
                Close job
              </Button>
            ) : null}
            {selectedJobId && selectedJob.status === "closed" ? (
              <Button
                disabled={pending}
                onClick={() => updateStatus(selectedJobId, "reopen")}
                size="sm"
                type="button"
                variant="secondary"
              >
                Reopen
              </Button>
            ) : null}
            {selectedJobId && selectedJob.status !== "draft" ? (
              <Button
                disabled={pending}
                onClick={() => requestStatusConfirmation(selectedJobId, "draft")}
                size="sm"
                type="button"
                variant="ghost"
              >
                Move to draft
              </Button>
            ) : null}
          </div>
        </form>
        </section>
      </div>
    </>
  );
}
