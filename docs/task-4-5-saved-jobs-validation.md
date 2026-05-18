# Task 4.5 - Saved jobs validation

## Goal

Signed-in users can save and unsave published jobs, then review saved opportunities later.

## Implemented scope

- Save/unsave API at `/api/jobs/[jobId]/save`.
- Uses existing `saved_items` infrastructure with `item_type = job`.
- Prevents duplicates through the existing unique index.
- Save button on `/jobs` detail panel.
- Save button on `/jobs/[jobId]`.
- Saved state reflected as `Saved`.
- Saved jobs page at `/saved/jobs`.
- Empty state when no jobs are saved.
- Dashboard and settings links to saved jobs.

## Manual validation

1. Sign in with any completed profile.
2. Open `/jobs`.
3. Click `Save` on a published job.
4. Confirm the button changes to `Saved`.
5. Open `/saved/jobs`.
6. Confirm the saved job appears.
7. Open the saved job from `/saved/jobs` and confirm it returns to `/jobs?job=<id>`.
8. Click `Saved` again from the job detail.
9. Refresh `/saved/jobs` and confirm the job is removed.
10. Try saving the same job more than once and confirm no duplicate cards appear.

## Notes

- This task does not add delete behavior. Unsave is a reversible preference toggle and does not require an irreversible-action confirmation.
- Saved courses/events remain part of the later Academy slice.
