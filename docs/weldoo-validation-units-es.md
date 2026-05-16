# Weldoo - Unidades de validacion

## Como usar este documento

Este documento organiza Weldoo en unidades de validacion orientadas a flujos completos de usuario. La idea es validar producto, UX, datos, seguridad y operacion por cada flujo, no solo por tareas tecnicas.

Cada unidad incluye:

- Objetivo.
- Usuarios implicados.
- Historias de usuario.
- Criterios de aceptacion.
- Validacion tecnica.
- QA manual.
- Prompt de revision para Codex.

Recomendacion:

- Implementar por vertical slices.
- Validar cada unidad antes de pasar a la siguiente.
- Crear un issue/ticket por unidad.
- Usar los criterios de aceptacion como checklist de cierre.

## Estados recomendados

Usa estos estados para cada unidad:

- `Backlog`
- `Ready`
- `In Progress`
- `Code Review`
- `QA`
- `Accepted`
- `Needs Fixes`

## Plantilla base

```md
## Validation Unit: [Name]

### Goal

### Users

### User Stories

### Acceptance Criteria

### Technical Validation

### Manual QA

### Codex Review Prompt
```

---

# Phase 1 - MVP Validation Units

## VU-01 - Auth and Onboarding

### Goal

Permitir que un usuario se registre, inicie sesion, elija su tipo de perfil y llegue a la app con el onboarding completado.

### Users

- Professional / welder.
- Company.
- Training provider.

### User Stories

- Como usuario nuevo, puedo crear una cuenta con email y password.
- Como usuario existente, puedo iniciar y cerrar sesion.
- Como usuario nuevo, puedo seleccionar si soy profesional, empresa o centro de formacion.
- Como usuario nuevo, puedo completar los datos minimos de onboarding.
- Como usuario que abandono el onboarding, puedo retomarlo.

### Acceptance Criteria

- El registro valida email, password y errores comunes.
- El login muestra errores claros si las credenciales fallan.
- Las rutas privadas redirigen a login si no hay sesion.
- Los usuarios autenticados sin onboarding completado van a onboarding.
- Los usuarios con onboarding completado van a la app.
- Se crea el registro correcto segun tipo de usuario.
- No se puede seleccionar mas de un tipo principal de perfil.
- El flujo funciona en desktop y mobile.

### Technical Validation

- Supabase Auth esta configurado correctamente.
- No se exponen claves sensibles en cliente.
- Existe proteccion de rutas privadas.
- El estado `onboarding_completed` o equivalente es consistente.
- Las tablas relacionadas usan foreign keys correctas.
- RLS impide que un usuario modifique onboarding/perfil de otro usuario.

### Manual QA

1. Crear cuenta como profesional.
2. Completar onboarding profesional.
3. Cerrar sesion.
4. Iniciar sesion.
5. Confirmar redireccion a app.
6. Crear cuenta como empresa.
7. Completar onboarding empresa.
8. Crear cuenta como centro de formacion.
9. Intentar acceder a ruta privada sin sesion.
10. Probar en mobile.

### Codex Review Prompt

```text
Review the Auth and Onboarding validation unit. Check the full flow for sign up, login, logout, route protection, onboarding resumption, user type creation, RLS, form validation, mobile usability, and error states. Identify gaps against the acceptance criteria and fix the high-priority issues.
```

---

## VU-02 - Professional Profile Completion

### Goal

Permitir que un soldador/profesional cree, edite y publique un perfil profesional especifico de soldadura.

### Users

- Professional / welder.
- Visitor.
- Company.

### User Stories

- Como profesional, puedo editar mi perfil.
- Como profesional, puedo declarar procesos de soldadura, materiales, posiciones y certificaciones.
- Como profesional, puedo indicar disponibilidad y preferencias de trabajo.
- Como visitante o empresa, puedo ver el perfil publico.
- Como profesional, puedo ver como queda mi perfil publico.

### Acceptance Criteria

- El perfil incluye headline, bio, ubicacion y experiencia.
- El perfil incluye procesos: MIG/MAG, TIG, MMA/SMAW, FCAW, SAW u otros.
- El perfil incluye materiales y posiciones.
- Las certificaciones son declarativas en Phase 1.
- El profesional puede marcar disponibilidad.
- El profesional puede guardar cambios y ver confirmacion.
- Los campos obligatorios tienen validacion.
- El perfil publico no muestra controles de edicion a otros usuarios.
- Mobile layout es usable.

### Technical Validation

- Solo el owner puede editar el perfil.
- Los campos estructurados se guardan como enums, arrays controlados o tablas relacionadas.
- No se renderiza HTML inseguro en bio/experiencia.
- Avatar/cabecera usan storage seguro si aplica.
- RLS protege lectura/escritura correctamente.

### Manual QA

1. Login como profesional.
2. Editar perfil completo.
3. Guardar.
4. Refrescar pagina y comprobar persistencia.
5. Abrir perfil publico.
6. Login como otro usuario y comprobar que no puede editar.
7. Probar campos vacios/invalidos.
8. Probar mobile.

### Codex Review Prompt

```text
Review the Professional Profile Completion validation unit. Check edit permissions, public/private profile states, welding-specific fields, data persistence, unsafe rendering, validation, storage usage, RLS policies, and mobile layout. Fix concrete issues and summarize remaining risks.
```

---

## VU-03 - Company Profile and Job Publisher Readiness

### Goal

Permitir que una empresa configure su perfil y quede lista para publicar ofertas de empleo.

### Users

- Company owner.
- Professional / welder.
- Visitor.

### User Stories

- Como empresa, puedo editar mi perfil.
- Como empresa, puedo mostrar sector, ubicacion, descripcion y contacto.
- Como profesional, puedo ver el perfil publico de una empresa.
- Como empresa, puedo acceder a mis herramientas de gestion.

### Acceptance Criteria

- La empresa puede editar nombre, sector, tamano, ubicacion, descripcion, web y contacto.
- La vista publica muestra informacion relevante.
- El owner ve acciones de edicion.
- Otros usuarios no ven acciones de edicion.
- El perfil puede listar ofertas activas cuando existan.
- Mobile layout es usable.

### Technical Validation

- Solo owners pueden editar.
- Relacion user-company esta protegida.
- RLS bloquea edicion no autorizada.
- Campos de contacto se validan.
- No se expone informacion privada en vista publica.

### Manual QA

1. Crear cuenta de empresa.
2. Completar perfil.
3. Ver perfil publico.
4. Login como profesional.
5. Ver perfil empresa sin permisos de edicion.
6. Probar mobile.

### Codex Review Prompt

```text
Review the Company Profile validation unit. Check company ownership, edit/public states, validation, RLS, public data exposure, readiness for job publishing, and responsive behavior. Fix high-priority issues.
```

---

## VU-04 - Training Provider Profile and Publishing Readiness

### Goal

Permitir que un centro de formacion configure su perfil y quede listo para publicar cursos/eventos.

### Users

- Training provider owner.
- Professional / welder.
- Visitor.

### User Stories

- Como centro de formacion, puedo editar mi perfil.
- Como centro de formacion, puedo indicar tipos de formacion ofrecida.
- Como profesional, puedo ver el perfil publico del centro.
- Como centro, puedo acceder a mis herramientas de cursos/eventos.

### Acceptance Criteria

- El centro puede editar nombre, ubicacion, descripcion, web, contacto y tipos de formacion.
- La vista publica muestra informacion relevante.
- El perfil puede listar cursos/eventos publicados cuando existan.
- Solo el owner ve acciones de gestion.
- Mobile layout es usable.

### Technical Validation

- Ownership protegido.
- RLS correcto.
- Campos publicos/privados separados.
- Validacion de web/email.

### Manual QA

1. Crear cuenta de training provider.
2. Completar perfil.
3. Ver perfil publico.
4. Login como profesional y comprobar permisos.
5. Probar mobile.

### Codex Review Prompt

```text
Review the Training Provider Profile validation unit. Check ownership, profile editing, public profile rendering, validation, RLS, and readiness for course/event publishing. Fix concrete issues.
```

---

## VU-05 - Feed Posting and Interaction

### Goal

Permitir que los usuarios publiquen contenido tecnico/profesional, interactuen con posts y mantengan un feed usable.

### Users

- Professional / welder.
- Company.
- Training provider.
- Admin.

### User Stories

- Como usuario, puedo crear una publicacion.
- Como usuario, puedo ver publicaciones en el feed.
- Como usuario, puedo dar like y guardar posts.
- Como usuario, puedo comentar.
- Como autor, puedo editar o eliminar mi post.
- Como usuario, puedo reportar contenido.

### Acceptance Criteria

- No se permiten posts vacios.
- El feed muestra autor, rol, fecha, contenido e interacciones.
- Likes no se duplican.
- Saved posts no se duplican.
- Comentarios muestran autor y fecha.
- El autor puede editar/eliminar su contenido.
- Otros usuarios no pueden editar/eliminar contenido ajeno.
- Se puede reportar post/comentario.
- El feed carga de forma paginada o incremental.
- Estados empty/loading/error existen.

### Technical Validation

- Constraints para evitar likes/saves duplicados.
- RLS para posts, comments, likes, saved_items y reports.
- Inputs renderizados de forma segura.
- Imagenes usan storage seguro si aplica.
- Queries paginadas e indexadas.

### Manual QA

1. Crear post como profesional.
2. Crear post como empresa.
3. Dar like/unlike.
4. Guardar/desguardar.
5. Comentar.
6. Intentar editar post ajeno.
7. Reportar contenido.
8. Probar feed en mobile.

### Codex Review Prompt

```text
Review the Feed Posting and Interaction validation unit. Check post creation/edit/delete, likes, saved posts, comments, reports, duplicate constraints, RLS, unsafe rendering, pagination, and mobile states. Fix high-priority issues.
```

---

## VU-06 - Professional Directory Search

### Goal

Permitir descubrir perfiles relevantes mediante busqueda y filtros.

### Users

- Professional / welder.
- Company.
- Training provider.
- Visitor, si se permite acceso publico.

### User Stories

- Como usuario, puedo ver un directorio de perfiles.
- Como usuario, puedo buscar por nombre, rol, empresa o ubicacion.
- Como empresa, puedo filtrar profesionales por proceso, disponibilidad y experiencia.
- Como usuario, puedo abrir un perfil desde el directorio.

### Acceptance Criteria

- El directorio muestra profesionales, empresas y centros.
- La busqueda devuelve resultados relevantes.
- Los filtros funcionan y se combinan correctamente.
- Los filtros quedan reflejados en la URL.
- Los resultados vacios tienen mensaje claro.
- La vista mobile es usable.

### Technical Validation

- Queries indexadas para busqueda/filtros principales.
- No se exponen datos privados.
- URL query params se validan.
- Paginacion o limite de resultados.

### Manual QA

1. Buscar por nombre.
2. Buscar por proceso TIG.
3. Filtrar por disponibilidad.
4. Filtrar por tipo empresa.
5. Abrir perfil desde resultado.
6. Refrescar URL con filtros.
7. Probar mobile.

### Codex Review Prompt

```text
Review the Professional Directory Search validation unit. Check search relevance, filters, URL state, data exposure, query performance, empty states, and mobile layout. Fix issues that block product validation.
```

---

## VU-07 - Connections and Contact Requests

### Goal

Permitir que usuarios establezcan relaciones profesionales y se contacten de forma basica sin chat avanzado.

### Users

- Professional / welder.
- Company.
- Training provider.

### User Stories

- Como usuario, puedo enviar una solicitud de conexion.
- Como usuario, puedo aceptar o rechazar solicitudes recibidas.
- Como usuario, puedo ver si estoy conectado con otro perfil.
- Como usuario, puedo enviar una solicitud de contacto con mensaje.
- Como receptor, puedo ver y archivar solicitudes de contacto.

### Acceptance Criteria

- No se pueden duplicar solicitudes activas.
- No puedo enviarme una solicitud a mi mismo.
- El receptor puede aceptar/rechazar.
- El estado se refleja en cards y perfiles.
- Las solicitudes de contacto incluyen mensaje corto.
- El receptor puede marcar como leida o archivar.
- No hay chat en tiempo real en Phase 1.

### Technical Validation

- Constraints para duplicados.
- RLS en connections/contact_requests.
- Validacion server-side de receptor/emisor.
- No se puede leer solicitudes ajenas.

### Manual QA

1. Usuario A envia conexion a usuario B.
2. Usuario B acepta.
3. Ver estado conectado en ambos.
4. Intentar duplicar solicitud.
5. Enviar contact request.
6. Receptor la marca como leida/archivada.
7. Probar permisos con tercer usuario.

### Codex Review Prompt

```text
Review the Connections and Contact Requests validation unit. Check duplicate prevention, self-request prevention, sender/receiver permissions, RLS, state transitions, UI states, and absence of unintended real-time chat scope. Fix security and flow issues.
```

---

## VU-08 - Company Job Posting

### Goal

Permitir que empresas creen, editen y gestionen ofertas de empleo.

### Users

- Company owner.
- Admin.

### User Stories

- Como empresa, puedo crear una oferta.
- Como empresa, puedo editar mi oferta.
- Como empresa, puedo cerrar o reabrir mi oferta.
- Como admin, puedo moderar ofertas si es necesario.

### Acceptance Criteria

- La oferta tiene titulo, descripcion, ubicacion, contrato y empresa.
- Incluye campos de soldadura: procesos, materiales, certificaciones, experiencia.
- Solo la empresa owner puede editar.
- Ofertas cerradas no aparecen como activas.
- Formulario valida campos obligatorios.
- Mobile layout es usable.

### Technical Validation

- RLS por ownership.
- Estados de publicacion claros.
- Indices para busqueda.
- Validacion server-side.
- No HTML inseguro en descripcion.

### Manual QA

1. Login como empresa.
2. Crear oferta.
3. Editar oferta.
4. Cerrar oferta.
5. Ver que no aparece como activa.
6. Reabrir.
7. Login como otra empresa e intentar editar.

### Codex Review Prompt

```text
Review the Company Job Posting validation unit. Check job creation/edit/close/reopen, ownership permissions, welding-specific fields, publication states, validation, RLS, unsafe rendering, and mobile usability. Fix blocking issues.
```

---

## VU-09 - Job Search and Application

### Goal

Permitir que profesionales encuentren ofertas y apliquen de forma simple.

### Users

- Professional / welder.
- Company owner.

### User Stories

- Como profesional, puedo buscar ofertas.
- Como profesional, puedo filtrar por ubicacion, proceso, contrato y experiencia.
- Como profesional, puedo ver detalle de oferta.
- Como profesional, puedo guardar una oferta.
- Como profesional, puedo aplicar con mensaje y CV/link opcional.
- Como empresa, puedo ver candidaturas a mis ofertas.
- Como empresa, puedo actualizar el estado de una candidatura.

### Acceptance Criteria

- Busqueda y filtros funcionan.
- El detalle muestra toda la informacion relevante.
- No se permiten candidaturas duplicadas.
- Solo profesionales pueden aplicar.
- La empresa solo ve candidaturas de sus ofertas.
- Estados: submitted, viewed, contacted, rejected.
- Guardar oferta no genera duplicados.

### Technical Validation

- Unique constraint user/job en applications.
- RLS en applications.
- Storage seguro para CV si aplica.
- Validacion de archivo/tamano si hay upload.
- URL params en filtros.

### Manual QA

1. Crear oferta como empresa.
2. Login como profesional.
3. Buscar oferta.
4. Guardar oferta.
5. Aplicar.
6. Intentar aplicar otra vez.
7. Login como empresa.
8. Ver candidatura.
9. Cambiar estado.
10. Login como otra empresa y comprobar que no ve candidaturas ajenas.

### Codex Review Prompt

```text
Review the Job Search and Application validation unit. Check search/filter behavior, job detail, saved jobs, duplicate application prevention, professional-only applications, company-only application access, RLS, file validation, and mobile usability. Fix critical issues.
```

---

## VU-10 - Academy Publishing

### Goal

Permitir que centros de formacion publiquen cursos y eventos.

### Users

- Training provider owner.
- Admin.

### User Stories

- Como centro, puedo crear curso/evento.
- Como centro, puedo editarlo.
- Como centro, puedo publicarlo o archivarlo.
- Como admin, puedo moderarlo.

### Acceptance Criteria

- Tipos soportados: online course, webinar, in-person course, workshop, sector event.
- Campos: titulo, descripcion, nivel, fecha/duracion, ubicacion/online, temas, provider.
- Webinars en Phase 1 usan enlace externo opcional, no live video integrado.
- Solo owner puede gestionar sus cursos/eventos.
- Estados publicacion claros.

### Technical Validation

- RLS por provider owner.
- Validacion server-side.
- No HTML inseguro.
- Campos de fechas consistentes.
- Estados publish/archive consistentes.

### Manual QA

1. Login como training provider.
2. Crear curso online.
3. Crear webinar con link externo.
4. Crear evento presencial.
5. Publicar/archivar.
6. Login como otro provider e intentar editar.

### Codex Review Prompt

```text
Review the Academy Publishing validation unit. Check course/event creation, editing, publishing, archiving, provider ownership, Phase 1 webinar constraints, RLS, date validation, unsafe rendering, and mobile usability. Fix high-priority issues.
```

---

## VU-11 - Academy Discovery and Interest Registration

### Goal

Permitir que usuarios descubran cursos/eventos y registren interes.

### Users

- Professional / welder.
- Company.
- Training provider.

### User Stories

- Como usuario, puedo buscar cursos/eventos.
- Como usuario, puedo filtrar por tipo, nivel, ubicacion, fecha y tema.
- Como usuario, puedo ver detalle.
- Como usuario, puedo guardar un curso/evento.
- Como usuario, puedo registrar interes.
- Como provider, puedo ver usuarios interesados en mis cursos/eventos.

### Acceptance Criteria

- Filtros funcionan y quedan en URL.
- Detalle muestra informacion clara.
- Registro de interes no se duplica.
- Provider solo ve interesados de sus propios items.
- Estados empty/loading/error existen.
- Mobile layout es usable.

### Technical Validation

- Unique constraint user/course_event.
- RLS en interests.
- Queries indexadas.
- No se exponen emails/contactos si no corresponde.

### Manual QA

1. Buscar curso por TIG.
2. Filtrar webinars.
3. Abrir detalle.
4. Guardar.
5. Registrar interes.
6. Intentar registrar interes de nuevo.
7. Login como provider.
8. Ver interesados.
9. Probar permisos con otro provider.

### Codex Review Prompt

```text
Review the Academy Discovery and Interest Registration validation unit. Check search/filters, detail pages, saved items, duplicate interest prevention, provider access to interested users, RLS, data exposure, and mobile states. Fix blocking issues.
```

---

## VU-12 - Admin Moderation

### Goal

Permitir que administradores gestionen usuarios, reportes, posts, jobs y cursos/eventos.

### Users

- Admin.

### User Stories

- Como admin, puedo acceder a un panel protegido.
- Como admin, puedo buscar usuarios.
- Como admin, puedo desactivar/reactivar usuarios.
- Como admin, puedo revisar reportes.
- Como admin, puedo eliminar contenido reportado.
- Como admin, puedo aprobar/retirar jobs y cursos/eventos.

### Acceptance Criteria

- Solo admins acceden a rutas admin.
- Usuarios no admin no pueden leer datos admin.
- Acciones destructivas requieren confirmacion.
- Reportes tienen estados.
- La visibilidad publica cambia al retirar contenido.
- Admin UI es usable en desktop.

### Technical Validation

- Role admin protegido server-side.
- RLS o service role usado de forma segura.
- No service role en cliente.
- Acciones admin auditables si aplica.
- Confirmaciones para acciones destructivas.

### Manual QA

1. Login como admin.
2. Acceder admin.
3. Buscar usuario.
4. Desactivar/reactivar.
5. Revisar reporte.
6. Retirar post.
7. Retirar job.
8. Login como usuario normal e intentar acceder admin.

### Codex Review Prompt

```text
Review the Admin Moderation validation unit. Check admin-only access, server-side authorization, service role safety, destructive confirmations, report states, public visibility changes, and auditability. Fix critical security issues.
```

---

## VU-13 - Internal Notifications

### Goal

Mostrar actividad relevante dentro de la app sin infraestructura avanzada.

### Users

- Professional / welder.
- Company.
- Training provider.

### User Stories

- Como usuario, recibo notificacion por solicitud de conexion.
- Como usuario, recibo notificacion cuando aceptan mi conexion.
- Como autor, recibo notificacion por comentario/like.
- Como empresa, recibo notificacion por nueva candidatura.
- Como usuario, puedo marcar notificaciones como leidas.

### Acceptance Criteria

- Notificaciones se crean para eventos definidos.
- Badge unread se actualiza al refrescar.
- Se pueden marcar como leidas.
- No hay push ni realtime obligatorio en Phase 1.
- Usuarios no ven notificaciones ajenas.

### Technical Validation

- RLS en notifications.
- Generacion de eventos idempotente si aplica.
- Queries eficientes por usuario.
- Estados read/unread consistentes.

### Manual QA

1. Generar connection request.
2. Ver notificacion.
3. Comentar post ajeno.
4. Ver notificacion del autor.
5. Aplicar a job.
6. Ver notificacion empresa.
7. Marcar leidas.
8. Probar permisos.

### Codex Review Prompt

```text
Review the Internal Notifications validation unit. Check event generation, unread/read state, user isolation, RLS, badge behavior, idempotency, and Phase 1 scope boundaries. Fix issues that affect reliability or privacy.
```

---

## VU-14 - Responsive Web App QA

### Goal

Validar que Weldoo funciona como web app responsive en los flujos principales.

### Users

- Todos.

### User Stories

- Como usuario mobile, puedo registrarme y completar onboarding.
- Como usuario mobile, puedo leer feed y publicar.
- Como usuario mobile, puedo buscar jobs y aplicar.
- Como usuario mobile, puedo consultar cursos/eventos.
- Como admin desktop, puedo moderar contenido.

### Acceptance Criteria

- No hay overflow horizontal en mobile.
- Navegacion principal es usable.
- Formularios son comodos.
- Cards son legibles.
- Botones no se solapan.
- Estados empty/loading/error son visibles.
- Tablas admin tienen alternativa usable o scroll controlado.

### Technical Validation

- Breakpoints definidos.
- Componentes con layout responsive.
- No estilos inline rigidos que rompan mobile.
- Pruebas visuales o screenshots en viewports principales.

### Manual QA

Viewports:

- 390x844 mobile.
- 768x1024 tablet.
- 1440x900 desktop.

Flujos:

1. Auth/onboarding.
2. Perfil.
3. Feed.
4. Directorio.
5. Jobs.
6. Academy.
7. Contact requests.
8. Admin.

### Codex Review Prompt

```text
Review Weldoo as a responsive web app. Test auth, onboarding, profile, feed, directory, jobs, academy, contact requests, notifications, and admin across mobile, tablet, and desktop. Fix layout overflow, unusable navigation, cramped forms, overlapping text, broken cards, and poor empty/loading/error states.
```

---

## VU-15 - Security and Data Integrity Gate

### Goal

Validar seguridad y consistencia de datos antes de beta privada.

### Users

- Todos.

### User Stories

- Como usuario, mis datos privados no son accesibles por otros.
- Como empresa, mis candidaturas no son visibles por competidores.
- Como provider, mis interesados no son visibles por otros providers.
- Como admin, puedo moderar sin exponer service role al cliente.

### Acceptance Criteria

- RLS esta activado en tablas sensibles.
- No hay claves service role en cliente.
- Acciones server-side validan identidad y permisos.
- Hay constraints para duplicados criticos.
- Inputs se validan server-side.
- No se renderiza HTML inseguro.
- Uploads validan tipo y tamano.

### Technical Validation

Revisar:

- profiles.
- companies.
- training_providers.
- posts.
- comments.
- likes.
- saved_items.
- connections.
- jobs.
- job_applications.
- course_events.
- course_event_interests.
- contact_requests.
- notifications.
- reports.

### Manual QA

1. Intentar editar perfil ajeno.
2. Intentar ver candidaturas de otra empresa.
3. Intentar ver interesados de otro provider.
4. Intentar acceder admin como usuario normal.
5. Intentar duplicar like/save/application/interest.
6. Probar input con HTML/script.
7. Probar upload invalido.

### Codex Review Prompt

```text
Perform a security and data integrity gate review for Weldoo Phase 1. Check RLS on every sensitive table, server-side authorization, service role exposure, duplicate constraints, input validation, unsafe HTML rendering, upload validation, and admin-only actions. Provide prioritized findings, then fix all critical and high severity issues.
```

---

# Phase 2 Validation Units

## VU-16 - Payments

### Goal

Validar pagos para cursos, ofertas destacadas o planes.

### Core Validation

- Checkout seguro.
- Webhooks verificados.
- Estado de pago persistido.
- Acceso/beneficio concedido solo tras pago confirmado.
- Reembolsos/cancelaciones definidos.

### Codex Review Prompt

```text
Review the Payments validation unit. Check Stripe checkout creation, webhook verification, payment state persistence, entitlement granting, duplicate webhook handling, refund/cancel behavior, and security. Fix critical issues.
```

## VU-17 - Integrated Live Video

### Goal

Validar webinars con sala integrada.

### Core Validation

- Waiting room.
- Join/leave flow.
- Permisos de camara/micro.
- Attendance tracking.
- Provider/admin controls.
- Fallback si proveedor externo falla.

### Codex Review Prompt

```text
Review the Integrated Live Video validation unit. Check waiting room, join/leave flow, permissions, attendance tracking, provider/admin controls, privacy, failure states, and mobile usability. Fix critical issues.
```

## VU-18 - Semantic Search and Recommendations

### Goal

Validar busqueda semantica y recomendaciones explicables.

### Core Validation

- Embeddings generados correctamente.
- Filtros exactos siguen funcionando.
- Resultados son explicables.
- Feature flag disponible.
- Coste controlado.

### Codex Review Prompt

```text
Review the Semantic Search and Recommendations validation unit. Check embeddings generation, vector queries, hybrid filtering, explainability, feature flags, cost controls, and result quality. Fix issues and document limitations.
```

## VU-19 - Certification Verification

### Goal

Validar carga, revision y estado verificado de certificaciones.

### Core Validation

- Upload seguro.
- Metadata estructurada.
- Revision admin.
- Estados approve/reject/request changes.
- Badge verificado solo tras aprobacion.
- Expiry tracking.

### Codex Review Prompt

```text
Review the Certification Verification validation unit. Check secure uploads, metadata validation, admin review states, verified badge logic, expiry tracking, RLS, and privacy. Fix critical issues.
```

## VU-20 - Advanced Chat

### Goal

Validar chat avanzado con permisos, realtime y adjuntos.

### Core Validation

- Solo participantes acceden a conversacion.
- Realtime funciona y tiene fallback.
- Read states correctos.
- Adjuntos seguros.
- Bloqueo de usuarios.

### Codex Review Prompt

```text
Review the Advanced Chat validation unit. Check participant permissions, realtime delivery, fallback behavior, read states, attachments, blocking, RLS, and abuse risks. Fix critical issues.
```

## VU-21 - Advanced Notifications

### Goal

Validar notificaciones email, preferencias y realtime.

### Core Validation

- Preferencias por usuario.
- Emails transaccionales.
- Unsubscribe si aplica.
- Digest.
- Realtime in-app.
- Fallback sin realtime.

### Codex Review Prompt

```text
Review the Advanced Notifications validation unit. Check user preferences, email templates, unsubscribe handling, digest generation, realtime in-app notifications, fallback behavior, and event duplication. Fix reliability and privacy issues.
```

