# Weldoo - Plan de tareas para Codex

## Como usar este documento

Este documento convierte el alcance funcional de Weldoo en tareas ejecutables por fases y sprints. Cada tarea incluye un prompt que puedes copiar en Codex.

Recomendacion de uso:

1. Ejecuta las tareas en orden.
2. No mezcles varias tareas grandes en un unico prompt.
3. Antes de cada tarea, confirma que los tests y lint actuales pasan.
4. Despues de cada tarea, revisa el diff, prueba manualmente el flujo y pide a Codex que corrija bugs concretos.
5. Mantén cada PR o commit pequeno y orientado a una funcionalidad.

Prompt base recomendado para todas las tareas:

```text
You are working on Weldoo, a responsive web app for a vertical professional network for welders, companies, and training providers. Follow the existing architecture and coding conventions. Keep the implementation production-oriented, typed, secure, and maintainable. Do not over-engineer. After implementing, run the relevant checks and summarize changed files, decisions, and any remaining risks.
```

## Phase 0 - Project Foundation

Objetivo: crear una base tecnica solida antes de implementar producto.

### Sprint 0.1 - Stack and App Setup

#### Task 0.1.1 - Create the Next.js project

Objetivo:

Crear la aplicacion base con Next.js, TypeScript, Tailwind, estructura de carpetas y configuracion inicial.

Prompt para Codex:

```text
Set up the Weldoo application as a Next.js App Router project using TypeScript and Tailwind CSS. Create a clean folder structure for app routes, reusable components, server actions, database utilities, validators, and shared types. Add sensible defaults for ESLint, formatting, environment variables, and path aliases. Do not implement product features yet. After setup, run the build/lint checks and document how to start the app locally.
```

Entregables:

- Proyecto Next.js funcionando.
- Tailwind configurado.
- Estructura base.
- Variables de entorno documentadas.

#### Task 0.1.2 - Convert prototype design tokens

Objetivo:

Extraer colores, radios, sombras y tipografia del prototipo actual y convertirlos en tokens reutilizables.

Prompt para Codex:

```text
Inspect the existing static prototype file and extract the core Weldoo visual tokens: colors, typography, spacing, border radii, shadows, and common layout dimensions. Convert them into Tailwind theme configuration and/or CSS variables. Create a small style guide page that displays buttons, cards, form fields, badges, avatars, and navigation states using those tokens. Keep the design close to the prototype but responsive and maintainable.
```

Entregables:

- Tokens de diseno.
- Componentes base visuales.
- Pagina interna de style guide.

#### Task 0.1.3 - Add base UI components

Objetivo:

Crear componentes reutilizables antes de construir pantallas.

Prompt para Codex:

```text
Create the core reusable UI components for Weldoo: Button, IconButton, Input, Textarea, Select, Badge, Card, Avatar, Tabs, Modal, Dropdown, EmptyState, LoadingState, and FormError. Use TypeScript props, accessible markup, keyboard-friendly interactions where relevant, and responsive styling. Add simple examples in the style guide page. Do not connect these components to real data yet.
```

Entregables:

- Componentes base.
- Ejemplos visuales.
- Accesibilidad basica.

### Sprint 0.2 - Database and Backend Foundation

#### Task 0.2.1 - Define initial database schema

Objetivo:

Crear el esquema inicial de Supabase/Postgres para Phase 1.

Prompt para Codex:

```text
Design and implement the initial Supabase/Postgres database schema for Weldoo Phase 1. Include tables for profiles, companies, training_providers, posts, comments, likes, saved_items, connections, jobs, job_applications, course_events, course_event_interests, contact_requests, notifications, and reports. Use UUID primary keys, timestamps, clear foreign keys, useful indexes, and enums where appropriate. Generate SQL migrations and explain the data model decisions.
```

Entregables:

- Migraciones SQL.
- Indices principales.
- Enums iniciales.
- Explicacion del modelo.

#### Task 0.2.2 - Configure Supabase client and server utilities

Objetivo:

Preparar acceso seguro a Supabase desde cliente y servidor.

Prompt para Codex:

```text
Add Supabase integration utilities for the Next.js app. Create separate browser and server clients, environment variable validation, typed database helpers, and a small health/debug route available only in development. Follow Supabase SSR best practices. Do not expose service role keys to the browser. Add documentation for required environment variables.
```

Entregables:

- Cliente Supabase browser.
- Cliente Supabase server.
- Validacion de env vars.
- Documentacion `.env`.

#### Task 0.2.3 - Add Row Level Security policies

Objetivo:

Proteger los datos desde el inicio.

Prompt para Codex:

```text
Add Row Level Security policies for the Phase 1 Supabase schema. Users should only edit their own profile/content, companies should only manage their own jobs, training providers should only manage their own courses/events, public profile/feed/job/course data should be readable where appropriate, and admin-only actions should be protected. Include SQL policies and a short security rationale for each table. Avoid overly permissive policies.
```

Entregables:

- RLS activado.
- Politicas por tabla.
- Racional de seguridad.

## Phase 1 - Strong MVP

## Sprint 1 - Authentication, Onboarding, and Profiles

### Task 1.1 - Authentication flows

Objetivo:

Implementar registro, login, logout y recuperacion de password.

Prompt para Codex:

```text
Implement authentication for Weldoo using Supabase Auth. Add sign up, sign in, sign out, forgot password, and reset password flows. Use the existing UI components, validate forms with Zod, show clear loading/error states, and redirect authenticated users correctly. Add route protection for private app routes. Include basic tests or verification steps for the auth flows.
```

Entregables:

- Registro.
- Login.
- Logout.
- Reset password.
- Rutas protegidas.

### Task 1.2 - User type onboarding

Objetivo:

Permitir seleccionar tipo de usuario y crear datos iniciales.

Prompt para Codex:

```text
Build the onboarding flow after sign up. The user must choose one profile type: professional/welder, company, or training provider. Based on that choice, collect the minimum required fields and create the corresponding records in the database. Make the flow resumable if the user leaves halfway. Redirect completed users to the main app. Add validation and clear empty/error states.
```

Entregables:

- Seleccion de tipo.
- Formularios por tipo.
- Estado onboarding completado.
- Redireccion correcta.

### Task 1.3 - Professional profile edit

Objetivo:

Crear perfil profesional editable especifico para soldadura.

Prompt para Codex:

```text
Implement the editable professional profile for welders. Include headline, location, bio, experience, welding processes, materials, welding positions, self-declared certifications, availability, work preferences, external links, avatar, and optional cover image. Use structured fields where possible rather than free text. Save changes to Supabase and show success/error states. Keep the profile page responsive.
```

Entregables:

- Formulario perfil profesional.
- Campos de soldadura.
- Guardado en base de datos.
- Upload avatar/cabecera si esta disponible.

### Task 1.4 - Company profile edit

Objetivo:

Crear perfil editable para empresas.

Prompt para Codex:

```text
Implement editable company profiles. Include company name, sector, company size, location, description, website, contact email, logo/avatar, and optional cover image. Connect the profile to the authenticated user or company owner. Add public and private edit views. Ensure only company owners can edit their company profile.
```

Entregables:

- Perfil empresa.
- Vista publica.
- Vista edicion.
- Permisos correctos.

### Task 1.5 - Training provider profile edit

Objetivo:

Crear perfil editable para academias o centros de formacion.

Prompt para Codex:

```text
Implement editable training provider profiles. Include organisation name, location, description, website, contact email, training types offered, logo/avatar, and optional cover image. Add public and private edit views. Ensure only the owner can edit the training provider profile.
```

Entregables:

- Perfil centro formacion.
- Vista publica.
- Vista edicion.
- Permisos correctos.

### Task 1.6 - Public profile pages

Objetivo:

Crear paginas publicas para todos los tipos de perfil.

Prompt para Codex:

```text
Create public profile pages for professional, company, and training provider profiles. Use a shared layout where possible but adapt the content to each profile type. Show posts, jobs, or courses/events related to the profile when available. Add loading, not found, and empty states. Ensure pages are responsive and SEO-friendly.
```

Entregables:

- Perfil publico profesional.
- Perfil publico empresa.
- Perfil publico centro.
- Estados vacios.

### Task 1.7 - Profile media upload

Objetivo:

Permitir subida real de avatar/logo y cover image para perfiles.

Prompt para Codex:

```text
Implement profile media uploads with Supabase Storage. Create storage buckets and policies for avatars and cover images. Add reusable upload controls to professional, company, and training provider profile forms. Validate file type and size, upload files to the authenticated user's folder, save the public URL in the existing profile fields, and show clear upload/save feedback.
```

Entregables:

- Buckets y politicas de Storage.
- Upload avatar/logo.
- Upload cover image.
- Integracion en formularios de perfil.
- Validacion tipo/tamano archivo.

## Sprint 2 - Feed

### Task 2.1 - Feed layout and data queries

Objetivo:

Crear feed real conectado a base de datos.

Prompt para Codex:

```text
Implement the main feed page using real Supabase data. Show posts from all users ordered by creation date. Include author avatar, name, role, timestamp, post text, optional image, like count, comment count, and saved state. Add pagination or infinite loading. Use server-side queries where appropriate and keep the UI responsive.
```

Entregables:

- Feed real.
- Query paginada.
- Cards de posts.

### Task 2.2 - Create, edit, and delete posts

Objetivo:

Permitir publicar contenido.

Prompt para Codex:

```text
Implement post creation, editing, and deletion for authenticated users. Support text content and optional image upload. Validate input, prevent empty posts, store images in Supabase Storage, and ensure users can only edit/delete their own posts. Add loading, success, and error states.
```

Entregables:

- Crear post.
- Editar post.
- Eliminar post.
- Imagen opcional.

### Task 2.3 - Likes and saved posts

Objetivo:

Implementar interacciones basicas.

Prompt para Codex:

```text
Implement likes and saved posts. Users should be able to like/unlike a post and save/unsave a post. Update the UI optimistically but handle rollback on error. Ensure database constraints prevent duplicate likes or duplicate saved records from the same user.
```

Entregables:

- Like/unlike.
- Save/unsave.
- Constraints anti duplicados.

### Task 2.4 - Comments

Objetivo:

Implementar comentarios.

Prompt para Codex:

```text
Implement comments for feed posts. Users can add comments, view comments, and delete their own comments. Show comment author, timestamp, and content. Use safe rendering to avoid HTML injection. Add validation, loading states, and empty states.
```

Entregables:

- Crear comentarios.
- Listar comentarios.
- Eliminar comentario propio.
- Renderizado seguro.

### Task 2.5 - Reports and moderation hooks

Objetivo:

Permitir reportar contenido.

Prompt para Codex:

```text
Add report functionality for posts and comments. Authenticated users can report content with a reason and optional note. Store reports in the database for admin review. Prevent duplicate active reports by the same user for the same content. Add a simple UI flow for reporting without disrupting the feed.
```

Entregables:

- Reportar post.
- Reportar comentario.
- Tabla reports.
- Evitar duplicados.

## Sprint 3 - Professional Network

### Task 3.1 - Directory page

Objetivo:

Crear directorio de perfiles.

Prompt para Codex:

```text
Build the professional network directory page. It should list professionals, companies, and training providers with cards showing avatar/logo, name, type, headline/sector, location, and key tags. Add pagination and responsive grid/list layouts. Use real database data and efficient queries.
```

Entregables:

- Directorio.
- Cards por tipo.
- Paginacion.

### Task 3.2 - Search and filters

Objetivo:

Implementar busqueda y filtros.

Prompt para Codex:

```text
Add search and filters to the network directory. Support search by name, headline, company, role, and location. Add filters for profile type, location, welding process, availability, and experience level where applicable. Keep filters reflected in the URL query parameters so results can be shared or refreshed.
```

Entregables:

- Busqueda.
- Filtros.
- URL query params.

### Task 3.3 - Connection or follow model

Objetivo:

Implementar relacion entre usuarios.

Prompt para Codex:

```text
Implement the Phase 1 relationship model for Weldoo. Use bilateral connection requests unless the existing product decision says otherwise. Users can send a connection request, cancel a pending request, accept/reject incoming requests, and see connected state on profile cards. Add database constraints and RLS policies to protect connection records.
```

Entregables:

- Solicitar conexion.
- Aceptar/rechazar.
- Estado conectado.
- Seguridad.

### Task 3.4 - Contact request flow

Objetivo:

Permitir contacto simple sin chat avanzado.

Prompt para Codex:

```text
Implement contact requests as the initial communication feature. A user can send a short message to another profile from the profile page or directory. The recipient can view incoming contact requests, mark them as read, accept/respond externally, or archive them. Do not build real-time chat yet.
```

Entregables:

- Enviar solicitud contacto.
- Bandeja de solicitudes.
- Marcar leida/archivar.

## Sprint 4 - Jobs

### Task 4.1 - Jobs listing and filters

Objetivo:

Crear bolsa de empleo.

Prompt para Codex:

```text
Implement the jobs listing page using real data. Show job title, company, location, contract type, work mode, salary range if available, welding processes, required certifications, and posted date. Add search and filters for location, welding process, contract type, travel availability, experience level, and company. Keep filters in URL query parameters.
```

Entregables:

- Listado jobs.
- Filtros.
- Busqueda.

### Task 4.2 - Job detail page

Objetivo:

Crear pagina de detalle de oferta.

Prompt para Codex:

```text
Create the job detail page. Include company info, job description, responsibilities, requirements, welding processes, materials, certifications, location, contract type, salary range, benefits, and apply/save actions. Add not found and inactive job states. Make the page responsive and readable on mobile.
```

Entregables:

- Detalle job.
- Save/apply.
- Estados inactive/not found.

### Task 4.3 - Company job management

Objetivo:

Permitir a empresas crear y gestionar ofertas.

Prompt para Codex:

```text
Implement company job management. Company owners can create, edit, close, and reopen job postings. Use validated forms with structured fields for welding process, materials, certifications, location, work mode, contract type, salary range, and application instructions. Ensure only the owning company can manage its jobs.
```

Entregables:

- Crear oferta.
- Editar oferta.
- Cerrar/reabrir.
- Permisos.

### Task 4.4 - Job applications

Objetivo:

Permitir candidaturas simples.

Prompt para Codex:

```text
Implement simple job applications inside Weldoo. A professional can apply to a job with a message, optional CV upload or external CV link, and profile snapshot data. Prevent duplicate applications to the same job by the same user. Companies can view applications for their jobs and update application status: submitted, viewed, contacted, rejected.
```

Entregables:

- Aplicar.
- CV/link opcional.
- Estados candidatura.
- Panel empresa.

### Task 4.5 - Saved jobs

Objetivo:

Guardar ofertas.

Prompt para Codex:

```text
Implement saved jobs. Users can save and unsave jobs from listing and detail pages. Add a saved jobs page under the user area. Use existing saved_items infrastructure if available and prevent duplicate saved records.
```

Entregables:

- Guardar oferta.
- Pagina saved jobs.

## Sprint 5 - Academy and Events

### Task 5.1 - Course/event listing

Objetivo:

Crear listado de formacion y eventos.

Prompt para Codex:

```text
Implement the Academy page with real course and event data. Support types: online course, webinar, in-person course, workshop, and sector event. Show cards with title, provider, type, level, date/duration, location or online status, and registration/interest state. Add responsive layout and empty states.
```

Entregables:

- Academy real.
- Cards.
- Tipos de curso/evento.

### Task 5.2 - Academy filters and search

Objetivo:

Filtrar cursos/eventos.

Prompt para Codex:

```text
Add search and filters to the Academy page. Support filtering by type, level, location, date range, welding process/topic, and provider. Keep filters in URL query parameters. Make sure search works well for welding-specific terms such as WPS, PQR, TIG, MIG/MAG, NDT, ISO 3834, and EN ISO 9606-1.
```

Entregables:

- Busqueda academy.
- Filtros.
- URL params.

### Task 5.3 - Course/event detail

Objetivo:

Crear detalle para cursos y eventos.

Prompt para Codex:

```text
Create course/event detail pages. Include provider info, description, agenda/content, level, topics, date, duration, location or online details, price text if provided, capacity if provided, and actions to save or register interest. For webinars in Phase 1, do not embed live video; allow an optional external meeting link or recording link.
```

Entregables:

- Detalle curso/evento.
- Registro interes.
- Guardar.
- Sin live video integrado.

### Task 5.4 - Training provider management

Objetivo:

Permitir publicar cursos/eventos.

Prompt para Codex:

```text
Implement training provider course/event management. Training provider owners can create, edit, publish/unpublish, and archive courses/events. Use validated structured forms for type, level, topics, dates, location/online link, description, agenda, capacity, and external registration link. Ensure only the owning provider can manage its content.
```

Entregables:

- Crear curso/evento.
- Editar.
- Publicar/archivar.
- Permisos.

### Task 5.5 - Interest registration

Objetivo:

Recibir interes de usuarios.

Prompt para Codex:

```text
Implement interest registration for courses and events. Authenticated users can register interest with an optional note. Prevent duplicate active interest registrations from the same user for the same course/event. Training providers can view interested users for their own courses/events.
```

Entregables:

- Registrar interes.
- Evitar duplicados.
- Panel provider.

## Sprint 6 - Admin, Notifications, QA, and Beta

### Task 6.1 - Basic admin layout and access control

Objetivo:

Crear panel admin protegido.

Prompt para Codex:

```text
Implement the basic admin area. Add admin-only route protection based on user role. Create an admin layout with navigation for users, posts, reports, jobs, courses/events, and platform settings. Non-admin users must not be able to access admin routes or admin data.
```

Entregables:

- Admin layout.
- Proteccion por rol.
- Navegacion admin.

### Task 6.2 - Admin user management

Objetivo:

Gestionar usuarios.

Prompt para Codex:

```text
Implement admin user management. Admins can list users, search/filter by role and status, view profile summary, deactivate/reactivate users, and inspect basic activity counts. Keep destructive actions confirmed with a modal and audit-friendly fields where possible.
```

Entregables:

- Listado usuarios.
- Buscar/filtrar.
- Activar/desactivar.

### Task 6.3 - Admin moderation for reports

Objetivo:

Gestionar reportes.

Prompt para Codex:

```text
Implement admin moderation for reports. Admins can view reported posts/comments, see report reason and reporter, mark reports as reviewed, dismiss reports, or remove the reported content. Add clear status states and make sure moderation actions are permission-protected.
```

Entregables:

- Listado reports.
- Revisar/descartar.
- Eliminar contenido.

### Task 6.4 - Admin jobs and academy moderation

Objetivo:

Moderar jobs/cursos.

Prompt para Codex:

```text
Implement admin moderation for jobs and course/events. Admins can list all jobs and academy items, filter by status, approve, unpublish, or archive items. Ensure the actions update public visibility correctly and are protected by admin permissions.
```

Entregables:

- Moderar jobs.
- Moderar cursos/eventos.
- Estados publicacion.

### Task 6.5 - Internal notifications

Objetivo:

Crear notificaciones internas simples.

Prompt para Codex:

```text
Implement simple internal notifications. Create notifications for new connection requests, accepted connections, comments on own posts, likes on own posts, contact requests, and new job applications. Add a notifications dropdown/page where users can view unread/read notifications and mark them as read. Do not implement push notifications or real-time infrastructure.
```

Entregables:

- Tabla notifications.
- Crear eventos.
- UI leer/marcar leido.

### Task 6.6 - Responsive QA pass

Objetivo:

Pulir desktop/mobile.

Prompt para Codex:

```text
Perform a responsive QA pass across the main Weldoo flows: auth, onboarding, feed, profile, network, jobs, academy, contact requests, and admin. Fix layout issues on mobile, tablet, and desktop. Ensure text does not overflow, navigation is usable, forms are comfortable, and cards remain readable. Use screenshots or browser checks where possible and summarize the fixes.
```

Entregables:

- UI responsive corregida.
- Flujos principales revisados.

### Task 6.7 - Security and data validation review

Objetivo:

Revisar seguridad antes de beta.

Prompt para Codex:

```text
Review the Weldoo Phase 1 implementation for security and data validation risks. Check RLS policies, server actions, API routes, file uploads, unsafe HTML rendering, authorization checks, form validation, duplicate constraints, and admin routes. Fix concrete issues found and provide a concise security review summary with remaining risks.
```

Entregables:

- RLS revisado.
- Validaciones revisadas.
- Bugs de seguridad corregidos.

### Task 6.8 - Seed data for beta

Objetivo:

Crear datos realistas para demo/beta.

Prompt para Codex:

```text
Create realistic seed data for Weldoo beta. Include welding professionals, industrial companies, training providers, posts, comments, jobs, courses/events, and applications using realistic welding-sector content. Avoid generic tech/product filler. Provide a safe way to load and reset seed data in development without affecting production.
```

Entregables:

- Seed realista.
- Script reset dev.
- Contenido vertical soldadura.

### Task 6.9 - Private beta launch checklist

Objetivo:

Preparar lanzamiento privado.

Prompt para Codex:

```text
Create a private beta launch checklist for Weldoo and implement any missing technical basics needed for launch. Include environment variables, database migrations, storage buckets, RLS checks, admin user creation, email setup, error monitoring, analytics, backup expectations, and manual smoke tests. Add documentation in the repository.
```

Entregables:

- Checklist beta.
- Docs lanzamiento.
- Smoke tests.

## Phase 2 - Product Evolution

Objetivo: ampliar la plataforma despues de validar Phase 1.

## Sprint 7A - OAuth Authentication

Objetivo: activar autenticacion social despues de validar el MVP base con email y password.

### Task 7A.1 - OAuth architecture and provider setup plan

Prompt para Codex:

```text
Design the Phase 2 OAuth authentication plan for Weldoo using Supabase Auth. Start with Google OAuth and keep LinkedIn OAuth as the second provider. Define required provider configuration, redirect URLs for local/staging/production, environment variables, callback behavior, account linking rules, onboarding behavior after OAuth sign-up, error states, and QA checks. Do not implement code yet; create a technical implementation plan in docs.
```

Entregables:

- Plan tecnico OAuth.
- Checklist de configuracion Google y LinkedIn.
- Reglas para cuentas existentes con el mismo email.
- Validaciones de onboarding despues de OAuth.

### Task 7A.2 - Google OAuth implementation

Prompt para Codex:

```text
Implement Google OAuth sign-in and sign-up for Weldoo using Supabase Auth. Enable the existing Google button in the auth UI, add the client-side OAuth start action, preserve redirectTo behavior, handle callback errors, and ensure new OAuth users are sent to onboarding if they do not have a completed profile. Keep email/password auth working unchanged. Add validation documentation and manual QA steps.
```

Entregables:

- Login y registro con Google.
- Manejo correcto de redirect y callback.
- Compatibilidad con onboarding por rol.
- Documento de validacion.

### Task 7A.3 - LinkedIn OAuth implementation

Prompt para Codex:

```text
Implement LinkedIn OAuth for Weldoo using Supabase Auth after Google OAuth is working. Enable the existing LinkedIn button, document the LinkedIn developer app configuration, handle provider-specific profile data limitations, preserve redirectTo behavior, and ensure OAuth-created accounts follow the same onboarding and profile completion rules as email/password users. Add validation documentation and manual QA steps.
```

Entregables:

- Login y registro con LinkedIn.
- Documentacion de configuracion LinkedIn.
- Manejo de datos parciales del perfil OAuth.
- Documento de validacion.

## Sprint 7 - Payments

### Task 7.1 - Payment architecture

Prompt para Codex:

```text
Design the Phase 2 payments architecture for Weldoo using Stripe. Define what can be paid for first: paid courses, featured jobs, company subscriptions, or premium plans. Propose the database changes, webhook events, security requirements, and user flows. Do not implement payments yet; create a technical implementation plan.
```

### Task 7.2 - Stripe checkout implementation

Prompt para Codex:

```text
Implement Stripe Checkout for the first selected paid flow in Weldoo. Add server-side checkout session creation, webhook handling, payment status persistence, user-facing success/cancel pages, and admin visibility. Follow Stripe security best practices and ensure webhooks are verified.
```

## Sprint 8 - Integrated Live Video

### Task 8.1 - Live video architecture

Prompt para Codex:

```text
Design the integrated live video architecture for Weldoo webinars. Compare embedding an external provider such as Jitsi/Zoom/Teams with building a deeper integration. Define permissions, waiting room, attendance tracking, session state, recording strategy, and privacy constraints. Produce an implementation plan before coding.
```

### Task 8.2 - Webinar room implementation

Prompt para Codex:

```text
Implement the first version of integrated webinar rooms for Weldoo using the selected provider. Add a waiting room, join/leave flow, permission handling, attendance tracking, and admin/provider controls. Keep the implementation isolated so it can be replaced later if the provider changes.
```

## Sprint 9 - Recommendations and Semantic Search

### Task 9.1 - Embeddings pipeline

Prompt para Codex:

```text
Implement an embeddings pipeline for Weldoo using OpenAI embeddings and Supabase pgvector. Start with profiles, jobs, and courses/events. Add database columns/tables for embeddings, background generation or manual regeneration scripts, and safe retry handling. Do not change the user-facing ranking yet.
```

### Task 9.2 - Semantic search

Prompt para Codex:

```text
Add semantic search to Weldoo for professionals, jobs, and courses/events. Combine traditional filters with vector similarity search. Keep results explainable and avoid replacing exact filters. Add a feature flag so semantic search can be enabled or disabled.
```

### Task 9.3 - Recommendation MVP

Prompt para Codex:

```text
Implement a first recommendation MVP for Weldoo. Recommend jobs to professionals, professionals to companies, and courses to users based on profile fields, saved items, and embeddings. Keep the algorithm simple, transparent, and auditable. Add logging so recommendations can be evaluated later.
```

## Sprint 10 - Certification Verification

### Task 10.1 - Certification upload and review

Prompt para Codex:

```text
Implement certification upload and admin review. Professionals can upload certification documents with metadata such as standard, process, position, material group, issue date, and expiry date. Admins can review, approve, reject, or request changes. Approved certifications show a verified badge on the profile.
```

### Task 10.2 - Certification expiry tracking

Prompt para Codex:

```text
Add certification expiry tracking. Show upcoming expiry dates to users, add internal notifications for expiring certifications, and allow users to update or replace documents. Do not claim official verification beyond the admin-reviewed status.
```

## Sprint 11 - Advanced Chat

### Task 11.1 - Real-time chat foundation

Prompt para Codex:

```text
Implement the foundation for advanced 1:1 chat in Weldoo. Add real-time message delivery, unread counts, read states, message history pagination, and authorization so users can only access their own conversations. Keep attachments out unless explicitly approved.
```

### Task 11.2 - Chat attachments and blocking

Prompt para Codex:

```text
Extend Weldoo chat with attachments and user blocking. Support safe file uploads, file type/size validation, attachment display, blocking a user, and preventing blocked users from sending new messages. Add tests for permission and validation edge cases.
```

## Sprint 12 - Advanced Notifications

### Task 12.1 - Email notification system

Prompt para Codex:

```text
Implement an advanced email notification system for Weldoo using Resend. Add templates for connection requests, job applications, course interest, comments, and weekly digests. Include user notification preferences and unsubscribe handling where required.
```

### Task 12.2 - Real-time notifications

Prompt para Codex:

```text
Implement real-time in-app notifications for Weldoo. Use the selected realtime mechanism to update notification badges and dropdowns without page refresh. Keep fallback behavior working if realtime is unavailable.
```

## Cross-Cutting AI Tasks

Estas tareas pueden implementarse durante Phase 1 o al inicio de Phase 2 segun prioridad.

### AI Task A - Profile assistant

Prompt para Codex:

```text
Implement a profile assistant using the OpenAI API. It should help professionals improve their headline, bio, skills, and welding-specific profile fields. The assistant must return structured suggestions, never overwrite data automatically, and require user confirmation before saving changes.
```

### AI Task B - Job post assistant

Prompt para Codex:

```text
Implement a job post assistant for companies. Given rough text, it should suggest a structured job posting with title, description, requirements, welding processes, materials, certifications, location, contract type, and tags. Use structured outputs and let the company review/edit before saving.
```

### AI Task C - Course/event assistant

Prompt para Codex:

```text
Implement a course/event assistant for training providers. Given rough notes, it should suggest a clear title, description, agenda, level, topics, audience, and tags. Use structured outputs and require provider confirmation before saving.
```

### AI Task D - Semantic tagging

Prompt para Codex:

```text
Implement AI-assisted semantic tagging for posts, jobs, and courses/events. The system should suggest welding-specific tags such as TIG, MIG/MAG, WPS, PQR, NDT, EN ISO 9606-1, ISO 3834, stainless steel, aluminium, safety, and inspection. Store suggested tags only after validation or user/admin acceptance.
```

### AI Task E - Moderation assistant

Prompt para Codex:

```text
Implement an AI-assisted moderation helper. For reported or newly created content, generate a moderation risk summary and suggested category such as spam, abuse, unsafe advice, irrelevant content, or acceptable. Do not remove content automatically. Show the AI suggestion only to admins.
```

## Final Codex Review Prompts

### Full Phase 1 review

```text
Review the entire Weldoo Phase 1 implementation as a senior engineer. Focus on production risks, security issues, broken user flows, missing validation, poor database constraints, RLS gaps, mobile UX issues, and performance problems. Provide prioritized findings with file references and then fix the high-priority issues after approval.
```

### UX review

```text
Review Weldoo's user experience across onboarding, profiles, feed, network, jobs, academy, contact requests, and admin. Focus on clarity, friction, mobile usability, empty states, loading states, and whether the product feels like a vertical network for welders rather than a generic social network. Provide concrete improvements and implement the highest-impact ones.
```

### Data model review

```text
Review the Weldoo database schema and RLS policies. Focus on relational integrity, duplicate prevention, indexes, query performance, authorization, auditability, and future extensibility for Phase 2. Provide findings and recommended migrations.
```
