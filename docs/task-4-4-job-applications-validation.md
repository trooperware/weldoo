# Task 4.4 - Job applications validation

## Goal

Professionals can apply to published jobs, and companies can review and update application status.

## Implemented scope

- `Apply now` opens an app-styled modal for professional users.
- Application form includes message and optional external CV URL.
- Server validation with Zod.
- Only professional profiles can apply.
- Duplicate applications are blocked by the database unique constraint and surfaced as an error.
- Existing applications show an `Applied` state instead of a second apply button.
- Company applications page at `/company/applications`.
- Company owners can see applications for their own jobs.
- Company owners can update application status to `viewed`, `contacted`, or `rejected`.
- Non-company users cannot access company application review.

## Manual validation

1. Sign in as a professional user.
2. Open `/jobs`.
3. Click `Apply now` on a published job.
4. Submit with a short message and confirm field-level validation appears.
5. Submit with a valid message.
6. Confirm the success message appears.
7. Refresh `/jobs` and confirm the button now shows `Applied`.
8. Try applying to the same job again and confirm duplicate application is prevented.
9. Sign in as the company that owns the job.
10. Open `/company/applications`.
11. Confirm the new application appears with applicant, job, message, optional CV URL, and status.
12. Mark it as `Viewed`, `Contacted`, and `Rejected`, confirming each status update persists after refresh.
13. Sign in as a non-company user and confirm `/company/applications` redirects away.

## Deferred

- CV file upload remains optional and is not implemented yet; this task supports external CV URL.
- Real-time chat with applicants remains outside Phase 1 advanced chat scope.
- Notifications infrastructure remains deferred.
