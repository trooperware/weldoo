# Weldoo - Epics and Task Plan

## How to Use This Document

This document reorganizes Weldoo development around product epics. An epic represents a large product area, such as Feed, Login, Messages, or Jobs. A task represents an executable and validatable unit, such as Create post, Save job, or Create message.

Recommended workflow:

1. Work on one epic at a time, except for small fixes.
2. Run small tasks with Codex, not entire epics.
3. Validate each task with a real user flow, database state, and browser testing.
4. Separate functionality, data work, and visual polish whenever risk is high.
5. Before moving to a new epic, document any pending validations.

Base prompt for Codex:

```text
You are working on Weldoo, a Next.js App Router web app for a vertical professional network for welders, companies, and training providers. Follow the existing architecture, Supabase schema, UI components, and prototype direction. Keep the implementation typed, secure, responsive, and maintainable. Do not over-engineer. Preserve existing user changes. After implementing, run relevant checks and summarize changed files, validation steps, and remaining risks.
```

## Status

- `Done`: implemented and basically validated.
- `Needs polish`: functional, but still needs visual or UX polish.
- `Planned`: pending implementation.
- `Phase 2`: outside the first functional MVP.

## Epic 0 - Foundation, Architecture and Deployment

Objective: maintain a stable technical foundation so the product can be developed sprint by sprint without accumulating critical debt.

### Task 0.1 - Project foundation

Status: `Done`

Prompt:

```text
Review the current Weldoo Next.js project foundation. Verify the src structure, TypeScript setup, Tailwind/CSS tokens, reusable UI components, Supabase utilities, environment variable handling, and local development documentation. Fix only issues that block future feature work. Do not implement product features.
```

### Task 0.2 - Supabase schema and RLS baseline

Status: `Done / Needs review`

Prompt:

```text
Review the current Supabase database migrations and Row Level Security policies for Weldoo Phase 1. Confirm that profiles, feed, jobs, academy, events, contact requests, saved items, notifications, and reports have appropriate tables, foreign keys, indexes, and RLS policies. Identify any missing migration required by the current application before implementing new features.
```

### Task 0.3 - Vercel staging deployment

Status: `Planned`

Prompt:

```text
Prepare Weldoo for a Vercel staging deployment. Check Next.js build compatibility, required environment variables, Supabase redirect URLs, auth callback URLs, production-safe settings, and deployment documentation. Do not change product behavior unless required for deployment. Provide a deployment checklist for Vercel and Supabase.
```

### Task 0.4 - Performance baseline

Status: `Planned`

Prompt:

```text
Create a performance baseline for Weldoo. Inspect the current pages for unnecessary server queries, large client bundles, slow Supabase calls, missing indexes, and avoidable re-renders. Add lightweight improvements where safe and document the main bottlenecks to test after deploying to Vercel.
```

## Epic 1 - Authentication and Onboarding

Objective: allow users to sign up, sign in, recover their password, and complete their initial profile.

### Task 1.1 - Sign in

Status: `Done / Needs visual QA`

Prompt:

```text
Polish the Weldoo sign-in page against the latest prototype. Keep the existing Supabase auth behavior. Review typography, spacing, logo size, tabs, demo access block, field labels, Show password button, submit button, validation errors, and redirect behavior. Users who already completed onboarding must be redirected to the feed after login.
```

### Task 1.2 - Sign up

Status: `Done / Needs visual QA`

Prompt:

```text
Polish the Weldoo sign-up page against the latest prototype. Keep the existing Supabase sign-up behavior and Zod validation. Align visual spacing, tabs, social buttons, role/intention pills, field labels, Show password button, submit button, and legal text. Do not implement OAuth unless explicitly requested.
```

### Task 1.3 - Forgot and reset password

Status: `Done / Needs visual QA`

Prompt:

```text
Review and polish the forgot-password and reset-password flows. Keep Supabase password recovery behavior, improve visual parity with the auth prototype, validate error/success states, and ensure the user can return to sign in cleanly.
```

### Task 1.4 - OAuth login

Status: `Planned`

Prompt:

```text
Add OAuth login for Google and LinkedIn using Supabase Auth. Keep email/password auth intact. Add provider buttons to sign-in and sign-up pages, configure callback handling, redirect completed users to the feed, redirect incomplete users to onboarding, and document the required Supabase provider settings.
```

### Task 1.6 - LinkedIn OAuth profile import

Status: `Planned`

Prompt:

```text
Implement LinkedIn OAuth profile import for new Weldoo users. When a user signs up with LinkedIn, use the official LinkedIn OpenID Connect/OAuth profile data returned by the provider through Supabase Auth to prefill Weldoo onboarding/profile fields where available: first name, last name, display name, profile image, email, and professional headline if available. Do not scrape LinkedIn pages. Do not assume access to full LinkedIn profile data unless the official API and granted scopes provide it. Let the user review and edit all imported fields before saving them to Weldoo. Document the required LinkedIn app product, scopes, Supabase provider configuration, privacy implications, and fallback behavior when LinkedIn does not return a field.
```

Notes:

- This import must use the official API/OAuth flow, not scraping.
- With LinkedIn OpenID Connect, we can normally expect basic identity data through scopes such as `openid`, `profile`, and `email`.
- Fields such as full work experience, skills, certifications, or professional history should not be assumed to be available by default.
- Imported data must remain an editable proposal before onboarding is completed.

### Task 1.7 - LinkedIn profile import for existing users

Status: `Planned`

Prompt:

```text
Implement LinkedIn profile import for existing Weldoo users who originally signed up with email/password, Google, or another method. Add a clear entry point from Settings and/or Profile Edit to connect LinkedIn. Use the official LinkedIn OAuth/OpenID Connect flow through Supabase Auth or a secure provider-linking flow. Import only the profile fields returned by the official API and granted scopes, such as first name, last name, display name, profile image, email, and professional headline if available. Do not scrape LinkedIn pages. Show a review screen comparing current Weldoo profile data with imported LinkedIn data, let the user choose which fields to update, and never overwrite existing profile data automatically. Document required scopes, privacy implications, fallback behavior, and how to disconnect LinkedIn if supported.
```

Notes:

- This task is different from LinkedIn sign-up: the user already exists in Weldoo.
- The import must require explicit consent before updating profile data.
- If Supabase does not support identity linking well enough for this case, design a server-side OAuth flow that imports data without changing the user's primary login method.

### Task 1.5 - Role onboarding

Status: `Done`

Prompt:

```text
Review the Weldoo onboarding flow for professional, company, and training provider users. Ensure the selected user type creates the correct database records, the flow is resumable, validation errors are visible, and completed users are redirected to the feed.
```

## Epic 2 - App Shell, Navigation and Mobile UX

Objective: make the main navigation consistent with the prototype on desktop and mobile.

### Task 2.1 - Header and main navigation

Status: `Done / Needs polish`

Prompt:

```text
Polish the Weldoo app header against the latest prototype. Align logo, navigation icons, typography, active states, spacing, right-side message/notification/profile controls, and responsive behavior. Keep existing routes and auth-aware behavior.
```

### Task 2.2 - My profile menu

Status: `Done / Needs polish`

Prompt:

```text
Review the My Profile dropdown menu. Ensure it matches the prototype structure, includes links to profile, saved jobs, settings, and sign out, and uses the correct avatar/initials state. Keep it keyboard accessible and responsive.
```

### Task 2.3 - Mobile bottom navigation

Status: `Planned`

Prompt:

```text
Implement the mobile bottom navigation from the latest Weldoo prototype. Add Home, Network, Events, Jobs, and Academy actions with matching icons, active states, spacing, and safe-area handling. Keep desktop navigation unchanged and ensure the mobile nav does not overlap page content.
```

### Task 2.4 - Mobile profile drawer

Status: `Planned`

Prompt:

```text
Implement the mobile profile drawer from the latest prototype. It should open from the avatar/profile control, show the current user identity, primary navigation shortcuts, saved jobs, settings, and sign out. Use the existing modal/drawer styling rather than browser dialogs.
```

## Epic 3 - Feed

Objective: build Weldoo's social core: publish, view, comment, react, save, and moderate content.

### Task 3.1 - Feed layout and data loading

Status: `Done / Needs visual polish`

Prompt:

```text
Polish the feed layout against the latest prototype. Align the left profile card, central feed column, right sidebar, post card spacing, typography, avatars, action rows, and responsive behavior. Keep existing Supabase data loading and avoid breaking post interactions.
```

### Task 3.2 - Create post

Status: `Done / Needs prototype parity`

Prompt:

```text
Convert the feed post composer to match the latest prototype modal behavior. The feed should show a compact composer trigger, open a modal for writing a post, support text and optional image, show a character counter, validate input, submit to Supabase, and insert the new post into the feed.
```

### Task 3.3 - Edit and delete own post

Status: `Done`

Prompt:

```text
Review the edit and delete post flow. Ensure only the post owner can edit or delete. Any delete action must use the platform modal style, ask for confirmation, and clearly state that the action is irreversible. Keep existing media handling intact.
```

### Task 3.4 - Likes and saved posts

Status: `Done`

Prompt:

```text
Review feed likes and saved posts. Ensure each action is scoped per post, updates only the clicked post, persists to Supabase, handles loading states independently, and remains correct when navigating or refreshing.
```

### Task 3.5 - Comments

Status: `Done`

Prompt:

```text
Review feed comments. Ensure users can add comments, see existing comments, get validation errors, and interact with each post independently. Improve visual parity with the prototype comment area without changing the data model unless required.
```

### Task 3.6 - Report content

Status: `Done`

Prompt:

```text
Review the report content flow for feed posts. Ensure the modal uses Weldoo UI styling, stores the report in Supabase, prevents duplicate accidental submissions, and gives clear success/error feedback.
```

### Task 3.7 - Infinite feed loading

Status: `Planned`

Prompt:

```text
Implement infinite loading for the feed inspired by the latest prototype. Load posts in small batches, show a loading spinner near the end of the list, show an end-of-feed state, and avoid loading duplicate posts. Keep server queries efficient and indexed.
```

## Epic 4 - Profiles

Objective: make professional, company, and training provider profiles valuable public identities within the network.

### Task 4.1 - Professional profile edit

Status: `Done / Needs advanced polish`

Prompt:

```text
Review the professional profile edit flow. Ensure welding-specific fields, availability, work preferences, links, avatar, cover, validation, save states, and permissions work correctly. Improve visual parity only where it does not require a data model change.
```

### Task 4.2 - Company profile edit

Status: `Done`

Prompt:

```text
Review the company profile edit flow. Ensure company fields, avatar, cover, validation, save states, public profile link, and owner permissions work correctly.
```

### Task 4.3 - Training provider profile edit

Status: `Done`

Prompt:

```text
Review the training provider profile edit flow. Ensure organisation fields, avatar, cover, validation, save states, public profile link, and owner permissions work correctly.
```

### Task 4.4 - Public profile pages

Status: `Done / Needs prototype parity`

Prompt:

```text
Polish public profile pages for professionals, companies, and training providers against the latest prototype. Align cover area, avatar, identity block, action buttons, profile sections, empty states, and responsive layout. Keep the current data model unless a missing field blocks the visual structure.
```

### Task 4.5 - Avatar and cover advanced editing

Status: `Planned`

Prompt:

```text
Implement advanced avatar and cover image editing based on the latest prototype. Add modal upload flows, drag-and-drop, image preview, remove cover, save/cancel states, and clear validation for file type and size. Do not implement complex cropping unless it can be done safely with the existing stack.
```

### Task 4.6 - Profile skills editor

Status: `Planned`

Prompt:

```text
Implement a structured welding skills editor for professional profiles. Use a searchable dropdown based on a welding skills catalog, allow adding/removing skills, prevent duplicates, persist to Supabase, and display skills on the public profile.
```

## Epic 5 - Network

Objective: discover profiles and create professional relationships.

### Task 5.1 - Network directory

Status: `Done`

Prompt:

```text
Review the Network directory. Ensure it lists professionals, companies, and training providers, excludes the currently logged-in user profile, displays correct cards, and remains responsive.
```

### Task 5.2 - Search and filters

Status: `Done / Needs polish`

Prompt:

```text
Review Network search and filters. Ensure type filters, search by name/role, empty states, and URL query state work correctly. Polish visual parity with the prototype without changing core behavior.
```

### Task 5.3 - Connect, pending and connected states

Status: `Done`

Prompt:

```text
Review Network connection actions. Ensure Connect, Pending, Connected, and Contact states use correct 13.2px button typography, persist to Supabase, update independently per profile card, and avoid showing actions for the current user's own profile.
```

### Task 5.4 - Cancel invitation

Status: `Planned`

Prompt:

```text
Add the ability to cancel a pending connection invitation from Network. Use a Weldoo confirmation modal if the action removes an existing request. Update Supabase state, refresh the card state, and handle errors clearly.
```

## Epic 6 - Messages and Contact Requests

Objective: enable basic communication between users without building a complex chat system yet.

### Task 6.1 - Contact request from profile/network

Status: `Done`

Prompt:

```text
Review the contact request flow from Network and public profiles. Ensure users can send a short message, the recipient can see it, duplicate requests are handled, and button states remain consistent.
```

### Task 6.2 - Contact requests inbox

Status: `Done / Needs polish`

Prompt:

```text
Polish the contact requests inbox against the latest prototype messages direction. Keep the current contact request data model, improve spacing, typography, message cards, accept/reject states, and empty states.
```

### Task 6.3 - Message icon unread count

Status: `Planned`

Prompt:

```text
Connect the header message icon badge to real unread contact request data. Show the count only when there are pending/unread contact requests for the logged-in user. Keep the query efficient and avoid hardcoded numbers.
```

### Task 6.4 - Full messages inbox

Status: `Phase 2`

Prompt:

```text
Implement the full Messages inbox from the latest prototype. Add conversations, message threads, conversation search, compose new message modal, quick replies, read states, and mobile overlays. Use a proper messages/conversations data model and RLS policies. This is Phase 2 and should not be mixed with basic contact requests.
```

## Epic 7 - Notifications

Objective: inform users about relevant activity without building complex notification infrastructure yet.

### Task 7.1 - Notification dropdown shell

Status: `Planned`

Prompt:

```text
Implement the notification dropdown shell from the latest prototype. Show a list of notification items from existing or demo data, empty state, unread styling, and a Mark all as read action. Keep it visually complete but avoid introducing real-time infrastructure.
```

### Task 7.2 - Notification data integration

Status: `Planned`

Prompt:

```text
Connect the notification dropdown to Supabase notifications. Query notifications for the current user, show unread count in the header badge, support mark as read and mark all as read, and keep RLS policies secure.
```

### Task 7.3 - Notification infrastructure

Status: `Phase 2`

Prompt:

```text
Design and implement a scalable notifications infrastructure for Weldoo. Define notification events, background creation strategy, read/unread state, delivery channels, and future real-time support. Keep email/push notifications out unless explicitly requested.
```

## Epic 8 - Jobs

Objective: allow users to discover, save, apply to, and manage job opportunities.

### Task 8.1 - Job listing and filters

Status: `Done / Needs polish`

Prompt:

```text
Review the Jobs listing page against the latest prototype. Ensure demo/live jobs load correctly, filters work, visual badges include correct icons, typography matches the prototype, and the page is responsive.
```

### Task 8.2 - Job detail

Status: `Done`

Prompt:

```text
Review the Job detail page. Ensure job information, company data, Apply, Save, and navigation states work correctly. Polish visual parity with the prototype and keep button typography consistent.
```

### Task 8.3 - Save jobs

Status: `Done`

Prompt:

```text
Review saved jobs behavior. Ensure save/unsave is scoped to each job, persists in Supabase, does not leak loading state across job cards, and the Saved Jobs page shows the correct saved list.
```

### Task 8.4 - Apply to job

Status: `Done`

Prompt:

```text
Review job application behavior. Ensure users can apply once, see the correct applied state, submit required data, and receive clear success/error feedback. Ensure companies can see applications for their own jobs only.
```

### Task 8.5 - Company job management

Status: `Done`

Prompt:

```text
Review company job management. Ensure companies can create, edit, publish/unpublish, and view their own jobs. Any destructive action must use a Weldoo confirmation modal with irreversible warning where applicable.
```

## Epic 9 - Academy and Learning

Objective: allow users to discover courses, webinars, and training, and register interest.

### Task 9.1 - Academy listing

Status: `Done / Needs polish`

Prompt:

```text
Review the Academy listing against the latest prototype. Ensure course/event cards, tags, provider data, availability text, and visual spacing match the prototype. Do not add search or filters if the prototype does not show them.
```

### Task 9.2 - Course and webinar detail

Status: `Done / Needs polish`

Prompt:

```text
Review Academy detail pages for online training, webinar, and in-person course types. Match the latest prototype structure, badges, metadata, CTA buttons, provider block, and responsive layout. Keep current interest/save behavior.
```

### Task 9.3 - Register interest

Status: `Done`

Prompt:

```text
Review course/event interest registration. Ensure users can register interest once, training providers can see interested users, and UI states remain clear after refresh.
```

### Task 9.4 - Training provider academy management

Status: `Done`

Prompt:

```text
Review training provider academy management. Ensure providers can create, edit, publish/unpublish, and view interest registrations for their own courses/events. Protect actions with RLS and clear validation.
```

### Task 9.5 - Course player and lesson progress

Status: `Phase 2`

Prompt:

```text
Implement the course player from the latest prototype. Add chapters, lessons, video/reading lesson types, progress tracking, mark lesson complete, next lesson navigation, completion state, and certificate download placeholder. Add the required Supabase schema changes and RLS policies.
```

### Task 9.6 - Live webinar room

Status: `Phase 2`

Prompt:

```text
Implement the webinar waiting room and live room experience from the latest prototype. Include upcoming/live/ended states, countdown, participant count, Add to calendar, Join now, and a Jitsi or equivalent embedded room. Treat this as Phase 2 live video work.
```

## Epic 10 - Events

Objective: allow users to discover industry events and register interest or attendance.

### Task 10.1 - Events listing

Status: `Done / Needs polish`

Prompt:

```text
Review the Events listing page against the latest prototype. Ensure event cards, event type labels, dates, location/virtual metadata, CTA states, empty states, and responsive layout match the prototype.
```

### Task 10.2 - Event detail

Status: `Done / Needs polish`

Prompt:

```text
Review Event detail pages for in-person and virtual events. Match the latest prototype structure, metadata, agenda/speakers where available, register/save actions, and responsive layout.
```

### Task 10.3 - Event registration

Status: `Planned`

Prompt:

```text
Implement event registration or attendance interest. Users should be able to register interest once, see a registered state, and cancel if appropriate. Persist the state to Supabase and expose interested users to the event owner if the data model supports it.
```

## Epic 11 - Settings and Account

Objective: give users basic control over account, privacy, and preferences.

### Task 11.1 - Settings visual shell

Status: `Planned`

Prompt:

```text
Implement the Settings visual shell from the latest prototype. Add tabs for Account, Notifications, Privacy, Appearance, and Subscription. Use real user data where available and placeholders where functionality is not yet implemented. Do not add billing or destructive actions yet.
```

### Task 11.2 - Account settings

Status: `Planned`

Prompt:

```text
Implement Account settings. Allow editing account display fields that belong to the profile, show email as account identity, and provide a password change entry point using the existing reset-password flow where appropriate.
```

### Task 11.3 - Privacy and notification preferences

Status: `Planned`

Prompt:

```text
Implement basic privacy and notification preference settings. Store preferences in Supabase, validate allowed values, and make the UI clear even if not every preference is consumed elsewhere yet.
```

### Task 11.4 - Delete account

Status: `Phase 2`

Prompt:

```text
Implement account deletion. Use a Weldoo modal, ask the user to confirm, clearly state that deletion is irreversible, and design the backend flow carefully to remove or anonymize user data according to the chosen product policy. Do not implement this without a confirmed data retention decision.
```

## Epic 12 - Activity Dashboard

Objective: centralize user activity: jobs, events, courses, and progress.

### Task 12.1 - My Activity shell

Status: `Planned`

Prompt:

```text
Implement a My Activity page shell based on the latest prototype. Show cards for saved/applied jobs, registered events, saved courses, and recent activity using existing data where possible. Keep recommendations as placeholders unless real data is available.
```

### Task 12.2 - Learning activity

Status: `Phase 2`

Prompt:

```text
Connect My Activity to course progress once the course player exists. Show learning streak, XP/progress placeholders or real metrics, completed lessons, and completed courses. Do not invent metrics without a clear data model.
```

## Epic 13 - Admin and Moderation

Objective: allow the platform to be operated and content quality to be controlled.

### Task 13.1 - Reports review

Status: `Planned`

Prompt:

```text
Create an admin-facing reports review page for reported feed content. Show reported item, reporter, reason, status, and moderation actions. Protect the route so only admin users can access it. Use confirmation modals for destructive moderation actions.
```

### Task 13.2 - Basic content moderation actions

Status: `Planned`

Prompt:

```text
Implement basic moderation actions for admins: mark report as reviewed, dismiss report, and hide reported content. Ensure actions are audited with timestamps and admin user ID. Avoid permanent deletion unless explicitly confirmed.
```

## Epic 14 - AI Features

Objective: incorporate AI in a pragmatic, useful, and non-critical way for the initial MVP.

### Task 14.1 - AI profile assistant

Status: `Planned`

Prompt:

```text
Design and implement an optional AI assistant for improving professional profile text. The user provides draft bio/headline/experience text, the assistant suggests a clearer professional version, and the user explicitly accepts before saving. Do not auto-publish AI output.
```

### Task 14.2 - AI post drafting assistant

Status: `Planned`

Prompt:

```text
Add an optional AI drafting assistant to the feed composer. It should help rewrite a post for clarity and professionalism, keep technical meaning intact, and require explicit user acceptance before inserting text into the composer.
```

### Task 14.3 - AI matching recommendations

Status: `Phase 2`

Prompt:

```text
Design AI-assisted matching recommendations for jobs, professionals, courses, and companies. Start with a documented recommendation strategy and data requirements before implementing. Do not build complex recommendations in Phase 1.
```

## Epic 15 - Infrastructure, Scalability and Operations

Objective: prepare Weldoo to operate reliably, first as an MVP on Vercel + Supabase and later with an architecture capable of supporting international growth and high load.

### Task 15.1 - MVP infrastructure baseline

Status: `Planned`

Prompt:

```text
Define the MVP infrastructure baseline for Weldoo using Vercel and Supabase. Document the production architecture, environments, required services, environment variables, Supabase project settings, storage buckets, auth redirects, database migrations, backups, and deployment process. Keep the architecture pragmatic for an early MVP but production-ready enough to share with external users.
```

### Task 15.2 - Vercel and Supabase limits review

Status: `Planned`

Prompt:

```text
Review the current Weldoo architecture and document the practical limits of using Vercel plus Supabase for the MVP. Cover database connection limits, Supabase plan constraints, edge/serverless execution, storage, auth, realtime, API routes, image/media delivery, cold starts, and likely bottlenecks. Provide concrete recommendations for the expected first production stage.
```

### Task 15.3 - Load testing plan

Status: `Planned`

Prompt:

```text
Create a load testing plan for Weldoo. Recommend tools such as k6, Artillery, or Grafana Cloud k6. Define realistic test scenarios for anonymous browsing, authenticated feed loading, network search, jobs browsing, academy browsing, posting, commenting, saving jobs, and login. Include target metrics, test data requirements, safe environments, and how to avoid damaging production data.
```

### Task 15.4 - Performance monitoring and observability

Status: `Planned`

Prompt:

```text
Add a monitoring and observability plan for Weldoo. Define what should be tracked in Vercel, Supabase, and the application: page performance, API latency, database query latency, error rates, slow queries, auth failures, storage errors, and user-facing failures. Recommend a minimal stack for MVP and a stronger stack for scale.
```

### Task 15.5 - Database scalability plan

Status: `Planned`

Prompt:

```text
Review the Weldoo Supabase/Postgres data model from a scalability perspective. Identify required indexes, pagination strategy, query patterns, RLS cost risks, feed query risks, search limitations, connection-heavy features, and future partitioning or read-replica needs. Produce a prioritized database optimization checklist.
```

### Task 15.6 - Search architecture

Status: `Planned`

Prompt:

```text
Design the search architecture for Weldoo. Start with what can be handled safely in Postgres for MVP, then define when to introduce a dedicated search engine such as Meilisearch, Typesense, Algolia, or OpenSearch. Cover profile search, jobs search, academy search, events search, filters, ranking, indexing strategy, and synchronization from Supabase.
```

### Task 15.7 - Media and CDN strategy

Status: `Planned`

Prompt:

```text
Design the media delivery strategy for Weldoo. Review current avatar, cover, post image, course image, and company logo storage. Define file size limits, image optimization, CDN usage, signed/public URLs, cache headers, cleanup of unused files, and future migration options if Supabase Storage becomes limiting.
```

### Task 15.8 - Global users architecture

Status: `Phase 2`

Prompt:

```text
Design a future global architecture for Weldoo users across multiple regions. Compare keeping Vercel globally with Supabase in one primary region versus moving to a more distributed backend. Cover latency, database region, read replicas, edge caching, media CDN, background jobs, queues, regional compliance, and operational complexity.
```

### Task 15.9 - 100k concurrent users architecture

Status: `Phase 2`

Prompt:

```text
Design a target architecture for Weldoo capable of supporting 100k concurrent users. Separate read-heavy traffic, write-heavy traffic, feed generation, search, notifications, messages, media, background jobs, caching, queues, database scaling, read replicas, rate limiting, and observability. Provide a staged migration path from the current Vercel + Supabase MVP architecture.
```

### Task 15.10 - Migration path beyond Supabase

Status: `Phase 2`

Prompt:

```text
Prepare a future migration plan in case Weldoo outgrows Supabase. Compare options such as managed Postgres on AWS/GCP/Azure, Neon, Crunchy Bridge, PlanetScale for non-Postgres workloads, dedicated object storage/CDN, separate auth provider, and custom backend services. Focus on migration risks, data ownership, operational cost, and what abstractions should be introduced now to avoid lock-in.
```

### Task 15.11 - Background jobs and queues

Status: `Phase 2`

Prompt:

```text
Design the background jobs and queue architecture for Weldoo. Cover notification fan-out, email sending, feed enrichment, media processing, search indexing, AI jobs, moderation jobs, and analytics events. Recommend when to introduce services such as Inngest, Trigger.dev, Upstash QStash, Cloud Tasks, SQS, or a worker service.
```

### Task 15.12 - Security and abuse protection

Status: `Planned`

Prompt:

```text
Create a security and abuse protection plan for Weldoo. Cover rate limiting, bot protection, auth hardening, file upload restrictions, RLS verification, admin access, audit logs, report abuse flow, spam prevention, and safe handling of destructive actions. Prioritize what must exist before a public MVP launch.
```

## Recommended Execution Order

1. Finish deployment readiness: `0.3`.
2. Define the infrastructure baseline: `15.1`, `15.2`, `15.12`.
3. Close auth visual QA and OAuth planning: `1.1`, `1.2`, `1.3`, `1.4`, `1.6`, `1.7`.
4. Finish Phase 1 navigation: `2.1`, `2.2`, then `2.3`.
5. Finish Feed parity: `3.1`, `3.2`, `3.7`.
6. Finish public profile parity: `4.4`, then `4.5` only if needed.
7. Close Network/Jobs/Academy/Events polish: `5.2`, `8.1`, `9.1`, `10.1`.
8. Add message and notification counts/shells: `6.3`, `7.1`.
9. Add Settings shell: `11.1`.
10. Prepare admin/moderation: `13.1`.
11. Prepare load testing and monitoring before a wider beta: `15.3`, `15.4`, `15.5`.
12. Move Phase 2 work only after the MVP is shareable and validated.
