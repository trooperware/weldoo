# Task 4.2 - Job detail page validation

## Goal

Users can inspect a published job from the jobs listing or from a direct job detail URL.

## Implemented scope

- Right-side detail panel on `/jobs` for desktop.
- Responsive detail section below the list on smaller screens.
- Direct detail route at `/jobs/[jobId]`.
- Company summary, job description, responsibilities, requirements, welding processes, materials, certifications, location, contract type, work mode, salary, benefits, and posted date.
- Published jobs only.
- Missing, inactive, or unpublished jobs return the Next.js not found state.
- Apply and Save actions are visible but disabled until Tasks 4.4 and 4.5.

## Manual validation

1. Open `/jobs`.
2. Confirm the first job is selected by default and its detail appears.
3. Click another job in the list and confirm the URL includes `job=<id>`.
4. Confirm the selected job card is highlighted.
5. Confirm the detail panel updates with the selected title, company, location, salary, tags, description, requirements, and benefits.
6. Open the detail icon from the selected job panel and confirm `/jobs/[jobId]` loads.
7. Resize to mobile width and confirm the selected job detail remains readable below the list.
8. Open an invalid job URL such as `/jobs/not-a-real-job` and confirm the not found state appears.

## Deferred

- Apply flow remains Task 4.4.
- Saved jobs remain Task 4.5.
- Company job creation/editing remains Task 4.3.
