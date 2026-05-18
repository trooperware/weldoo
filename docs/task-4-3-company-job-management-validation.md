# Task 4.3 - Company job management validation

## Goal

Company users can create and manage their own job postings.

## Implemented scope

- Company-only route at `/company/jobs`.
- Redirects non-company users back to `/dashboard`.
- Requires an existing company profile before creating jobs.
- Company jobs list with draft, published, and closed states.
- Create job form with structured welding-sector fields.
- Edit existing jobs.
- Save as draft.
- Publish job.
- Close a published job.
- Reopen a closed job.
- Move a published or closed job back to draft.
- Server validation with Zod.
- API ownership checks using the current company profile.
- Public jobs board continues to show only `published` jobs.

## Manual validation

1. Sign in as a company user.
2. Open `/company/jobs`.
3. Confirm the page shows `Manage job postings`.
4. Create a job with title, description, location, work mode, contract type, salary, welding processes, materials, certifications, requirements, and benefits.
5. Click `Save draft` and confirm the job appears as `Draft`.
6. Edit the draft and click `Publish`.
7. Open `/jobs` and confirm the published job appears in the public list.
8. Return to `/company/jobs`, select the job, and click `Close job`.
9. Open `/jobs` and confirm the closed job no longer appears in the public list.
10. Reopen the job and confirm it appears publicly again.
11. Try `/company/jobs` as a professional user and confirm it redirects to `/dashboard`.

## Deferred

- Job applications remain Task 4.4.
- Saved jobs remain Task 4.5.
- Deleting jobs is not included in this task. If added later, it must use an app-styled confirmation modal and state that deletion is irreversible.
