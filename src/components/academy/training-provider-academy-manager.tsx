"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { Button, FormError, Input, Modal, Select, Textarea } from "@/components/ui";
import type {
  TrainingProviderCourseEvent,
  TrainingProviderForAcademy,
} from "@/lib/academy/provider-management";
import type { CourseEventFieldErrors } from "@/lib/validators/course-event";

type SaveState = {
  courseEventId?: string;
  errors?: CourseEventFieldErrors;
  message?: string;
  status?: "error" | "success";
};

type TrainingProviderAcademyManagerProps = {
  items: TrainingProviderCourseEvent[];
  provider: TrainingProviderForAcademy;
};

const emptyCourseEvent = {
  agenda: null,
  archived_at: null,
  capacity: null,
  created_at: "",
  description: "",
  duration_text: null,
  ends_at: null,
  external_registration_url: null,
  id: "",
  level: null,
  location: null,
  online_url: null,
  price_text: null,
  published_at: null,
  recording_url: null,
  starts_at: null,
  status: "draft",
  title: "",
  topics: [],
  type: "in_person_course",
  welding_processes: [],
} satisfies Partial<TrainingProviderCourseEvent> & { id: string };

function listToText(values?: string[] | null) {
  return values?.join(", ") ?? "";
}

function statusLabel(status: TrainingProviderCourseEvent["status"]) {
  if (status === "published") return "Published";
  if (status === "archived") return "Archived";
  if (status === "closed") return "Closed";
  return "Draft";
}

function typeLabel(type: TrainingProviderCourseEvent["type"]) {
  if (type === "online_course") return "Online training";
  if (type === "webinar") return "Webinar";
  if (type === "in_person_course") return "In person";
  if (type === "workshop") return "Workshop";
  return "Sector event";
}

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function formatDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function statusClasses(status: TrainingProviderCourseEvent["status"]) {
  if (status === "published") return "bg-emerald-50 text-emerald-700";
  if (status === "archived") return "bg-slate-100 text-slate-600";
  return "bg-weldoo-indigo/10 text-weldoo-indigo";
}

export function TrainingProviderAcademyManager({
  items,
  provider,
}: TrainingProviderAcademyManagerProps) {
  const router = useRouter();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SaveState>({});
  const [archiveTarget, setArchiveTarget] = useState<TrainingProviderCourseEvent | null>(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? emptyCourseEvent,
    [items, selectedItemId],
  );
  const isEditing = Boolean(selectedItemId);

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

      const response = await fetch("/api/training-provider/academy", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json()) as SaveState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      setState({
        courseEventId: payload.courseEventId,
        message: payload.message ?? "Academy item saved.",
        status: "success",
      });
      setSelectedItemId(payload.courseEventId ?? null);
      router.refresh();
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Could not save Academy item.",
        status: "error",
      });
    } finally {
      setPending(false);
    }
  }

  async function updateStatus(
    courseEventId: string,
    action: "archive" | "draft" | "publish",
  ) {
    setPending(true);
    setState({});

    try {
      const response = await fetch(
        `/api/training-provider/academy/${courseEventId}/status`,
        {
          body: JSON.stringify({ action }),
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        },
      );
      const payload = (await response.json()) as SaveState;

      if (!response.ok || payload.status === "error") {
        setState(payload);
        return;
      }

      setState({
        message: payload.message ?? "Academy item status updated.",
        status: "success",
      });
      setArchiveTarget(null);
      router.refresh();
    } catch (error) {
      setState({
        message:
          error instanceof Error ? error.message : "Could not update Academy item status.",
        status: "error",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-[16px] border border-weldoo-border-light bg-white shadow-weldoo-sm">
          <div className="border-b border-weldoo-border-light px-5 py-4">
            <h2 className="text-[15px] font-bold text-weldoo-ink">Academy items</h2>
            <p className="mt-1 text-[12.5px] text-weldoo-muted">
              {provider.name} · {items.length} items
            </p>
          </div>
          <div className="divide-y divide-weldoo-border-light">
            <button
              className={[
                "flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-weldoo-bg",
                !selectedItemId ? "bg-weldoo-indigo/[0.06]" : "",
              ].join(" ")}
              onClick={() => {
                setSelectedItemId(null);
                setState({});
              }}
              type="button"
            >
              <span>
                <span className="block text-[13.5px] font-bold text-weldoo-ink">
                  New Academy item
                </span>
                <span className="mt-0.5 block text-[12px] text-weldoo-muted">
                  Create a course, webinar or event
                </span>
              </span>
              <span className="text-lg font-semibold text-weldoo-indigo">+</span>
            </button>
            {items.map((item) => (
              <button
                className={[
                  "flex w-full items-start justify-between gap-3 px-5 py-4 text-left transition hover:bg-weldoo-bg",
                  selectedItemId === item.id ? "bg-weldoo-indigo/[0.06]" : "",
                ].join(" ")}
                key={item.id}
                onClick={() => {
                  setSelectedItemId(item.id);
                  setState({});
                }}
                type="button"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-bold text-weldoo-ink">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-weldoo-muted">
                    {typeLabel(item.type)} · {statusLabel(item.status)}
                    {item.published_at ? ` · Published ${formatDate(item.published_at)}` : ""}
                  </span>
                </span>
                <span
                  className={[
                    "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                    statusClasses(item.status),
                  ].join(" ")}
                >
                  {statusLabel(item.status)}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-[16px] border border-weldoo-border-light bg-white p-5 shadow-weldoo-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 border-b border-weldoo-border-light pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-weldoo-indigo">
                {isEditing ? "Edit Academy item" : "New Academy item"}
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-weldoo-ink">
                {isEditing ? selectedItem.title : "Create course or event"}
              </h2>
              <p className="mt-1 text-sm text-weldoo-muted">
                Save as draft while preparing, or publish when the item is ready.
              </p>
            </div>
            {selectedItemId && selectedItem.status === "published" ? (
              <Link
                className="inline-flex h-9 items-center justify-center rounded-full border border-weldoo-border-light px-4 text-[12px] font-semibold text-weldoo-slate transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
                href={`/academy/${selectedItemId}`}
              >
                View public page
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
            key={selectedItem.id || "new-academy-item"}
            onSubmit={handleSubmit}
          >
            <input name="courseEventId" type="hidden" value={selectedItem.id} />

            <section className="grid gap-4 sm:grid-cols-2">
              <Select
                defaultValue={selectedItem.type ?? "in_person_course"}
                error={state.errors?.type}
                id="type"
                label="Type"
                name="type"
              >
                <option value="online_course">Online training</option>
                <option value="webinar">Webinar</option>
                <option value="in_person_course">In person</option>
                <option value="workshop">Workshop</option>
                <option value="sector_event">Sector event</option>
              </Select>
              <Select
                defaultValue={selectedItem.level ?? ""}
                error={state.errors?.level}
                id="level"
                label="Level"
                name="level"
              >
                <option value="">No level</option>
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </section>

            <Input
              defaultValue={selectedItem.title ?? ""}
              error={state.errors?.title}
              id="title"
              label="Title"
              name="title"
              placeholder="Advanced TIG Welding - Stainless & Aluminium"
            />

            <Textarea
              defaultValue={selectedItem.description ?? ""}
              error={state.errors?.description}
              id="description"
              label="Description"
              name="description"
              placeholder="Describe the course objective, audience, format, and outcome."
              rows={5}
            />

            <Textarea
              defaultValue={selectedItem.agenda ?? ""}
              error={state.errors?.agenda}
              id="agenda"
              label="Agenda or content"
              name="agenda"
              placeholder="Day 1 - TIG process theory&#10;Day 2 - Aluminium techniques&#10;Day 3 - Qualification test"
              rows={4}
            />

            <section className="grid gap-4 sm:grid-cols-2">
              <Input
                defaultValue={formatDateTimeLocal(selectedItem.starts_at)}
                error={state.errors?.startsAt}
                id="startsAt"
                label="Starts at"
                name="startsAt"
                type="datetime-local"
              />
              <Input
                defaultValue={formatDateTimeLocal(selectedItem.ends_at)}
                error={state.errors?.endsAt}
                id="endsAt"
                label="Ends at"
                name="endsAt"
                type="datetime-local"
              />
              <Input
                defaultValue={selectedItem.duration_text ?? ""}
                error={state.errors?.durationText}
                id="durationText"
                label="Duration"
                name="durationText"
                placeholder="3 days"
              />
              <Input
                defaultValue={selectedItem.capacity ?? ""}
                error={state.errors?.capacity}
                id="capacity"
                label="Capacity"
                min={1}
                name="capacity"
                placeholder="16"
                type="number"
              />
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <Input
                defaultValue={selectedItem.location ?? provider.location ?? ""}
                error={state.errors?.location}
                id="location"
                label="Location"
                name="location"
                placeholder="Barcelona, Spain"
              />
              <Input
                defaultValue={selectedItem.price_text ?? ""}
                error={state.errors?.priceText}
                id="priceText"
                label="Price text"
                name="priceText"
                placeholder="EUR 320 or Free"
              />
              <Input
                defaultValue={selectedItem.online_url ?? ""}
                error={state.errors?.onlineUrl}
                id="onlineUrl"
                label="Online URL"
                name="onlineUrl"
                placeholder="https://..."
                type="url"
              />
              <Input
                defaultValue={selectedItem.external_registration_url ?? ""}
                error={state.errors?.externalRegistrationUrl}
                id="externalRegistrationUrl"
                label="External registration URL"
                name="externalRegistrationUrl"
                placeholder="https://..."
                type="url"
              />
              <Input
                defaultValue={selectedItem.recording_url ?? ""}
                error={state.errors?.recordingUrl}
                id="recordingUrl"
                label="Recording URL"
                name="recordingUrl"
                placeholder="https://..."
                type="url"
              />
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <Textarea
                defaultValue={listToText(selectedItem.welding_processes)}
                error={state.errors?.weldingProcesses}
                id="weldingProcesses"
                label="Welding processes"
                name="weldingProcesses"
                placeholder="TIG, MIG/MAG, SMAW"
                rows={3}
              />
              <Textarea
                defaultValue={listToText(selectedItem.topics)}
                error={state.errors?.topics}
                id="topics"
                label="Topics"
                name="topics"
                placeholder="EN ISO 9606-1, WPS, PQR"
                rows={3}
              />
            </section>

            <div className="flex flex-wrap items-center gap-2 border-t border-weldoo-border-light pt-5">
              <Button disabled={pending} name="status" size="sm" type="submit" value="draft" variant="ghost">
                Save draft
              </Button>
              <Button disabled={pending} name="status" size="sm" type="submit" value="published">
                Publish
              </Button>
              {selectedItemId && selectedItem.status !== "published" ? (
                <Button
                  disabled={pending}
                  onClick={() => updateStatus(selectedItemId, "publish")}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  Publish existing
                </Button>
              ) : null}
              {selectedItemId && selectedItem.status !== "draft" ? (
                <Button
                  disabled={pending}
                  onClick={() => updateStatus(selectedItemId, "draft")}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Move to draft
                </Button>
              ) : null}
              {selectedItemId && selectedItem.status !== "archived" ? (
                <Button
                  disabled={pending}
                  onClick={() => setArchiveTarget(selectedItem as TrainingProviderCourseEvent)}
                  size="sm"
                  type="button"
                  variant="danger"
                >
                  Archive
                </Button>
              ) : null}
            </div>
          </form>
        </section>
      </div>

      <Modal
        description="Archiving removes the item from public Academy listings. It can be restored later by publishing it again."
        footer={
          <>
            <Button disabled={pending} onClick={() => setArchiveTarget(null)} variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={pending || !archiveTarget}
              onClick={() => {
                if (archiveTarget) void updateStatus(archiveTarget.id, "archive");
              }}
              variant="danger"
            >
              Archive item
            </Button>
          </>
        }
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
        open={Boolean(archiveTarget)}
        title="Archive Academy item?"
      >
        <p className="text-sm leading-6 text-weldoo-muted">
          Are you sure you want to archive{" "}
          <span className="font-semibold text-weldoo-ink">{archiveTarget?.title}</span>?
          Users will no longer find it in Academy while it is archived.
        </p>
      </Modal>
    </>
  );
}
