# Weldoo - Documento funcional vivo

Ultima actualizacion: 2026-07-12

## 1. Proposito del documento

Este documento describe el comportamiento funcional de Weldoo: perfiles, permisos, modulos, reglas de negocio, flujos principales y criterios de validacion.

Debe mantenerse como documento vivo junto al desarrollo. Los documentos de validacion por tarea siguen siendo utiles para QA puntual; este documento consolida la vision funcional global de la plataforma.

## 2. Vision del producto

Weldoo es una red profesional vertical para el sector de la soldadura. Conecta profesionales tecnicos, empresas industriales y centros de formacion en una experiencia enfocada en perfil profesional, contenido, oportunidades laborales, formacion, networking, mensajes y notificaciones.

El MVP no busca replicar una red social horizontal completa. La prioridad es validar una comunidad profesional especializada con flujos claros:

- Crear un perfil sectorial creible.
- Descubrir profesionales, empresas y centros de formacion.
- Conectar con otros miembros.
- Comunicarse con contactos aceptados.
- Publicar y consumir contenido profesional.
- Publicar, guardar y solicitar empleos.
- Publicar y gestionar cursos o eventos.
- Recibir notificaciones de actividad relevante.

## 3. Roles y tipos de perfil

### 3.1 Visitante anonimo

Usuario no autenticado.

Puede:

- Ver la home publica.
- Acceder a sign in, sign up y recuperacion de password.
- Ver paginas publicas disponibles segun RLS y rutas publicas.
- Consultar listados publicos cuando la pagina lo permita.

No puede:

- Publicar contenido.
- Guardar items.
- Conectar con perfiles.
- Enviar mensajes.
- Aplicar a trabajos.
- Registrar interes en cursos/eventos.
- Ver datos privados, inboxes o notificaciones.

### 3.2 Profesional

Usuario individual del sector de la soldadura.

Necesita:

- Crear y mantener un perfil profesional.
- Mostrar experiencia, disponibilidad, procesos, materiales, posiciones y certificaciones.
- Descubrir oportunidades de empleo, cursos, eventos y contactos.
- Publicar contenido tecnico o profesional.
- Conectar y comunicarse con otros miembros.

Entidad principal:

- `profiles` con `profile_type = professional`.
- `professional_profiles` con datos tecnicos especificos.

### 3.3 Empresa

Organizacion industrial, taller, ingenieria, fabricante, constructora o recruiter especializado.

Necesita:

- Crear y mantener perfil de empresa.
- Publicar ofertas de trabajo.
- Gestionar candidaturas.
- Buscar y conectar con profesionales.
- Publicar contenido de marca o actividad tecnica.

Entidad principal:

- `profiles` con `profile_type = company`.
- `companies` asociada por `owner_profile_id`.

### 3.4 Centro de formacion

Organizacion que publica cursos, certificaciones, webinars, workshops o eventos.

Necesita:

- Crear y mantener perfil de centro.
- Publicar cursos y eventos.
- Gestionar registros de interes.
- Ganar visibilidad dentro de la comunidad.

Entidad principal:

- `profiles` con `profile_type = training_provider`.
- `training_providers` asociada por `owner_profile_id`.

### 3.5 Administrador

Rol operativo de plataforma.

Necesita:

- Revisar contenido y reportes.
- Acceder a datos necesarios para moderacion.
- Gestionar usuarios o entidades cuando sea necesario.
- Resolver incidencias funcionales.

Entidad principal:

- `profiles` con `profile_type = admin`.

Nota: el admin existe en el modelo de permisos/RLS. La interfaz completa de administracion debe tratarse como modulo propio si se desarrolla.

## 4. Matriz funcional de permisos

| Funcionalidad | Visitante | Profesional | Empresa | Centro formacion | Admin |
| --- | --- | --- | --- | --- | --- |
| Registrarse / iniciar sesion | Si | Si | Si | Si | Si |
| Completar onboarding | No | Si | Si | Si | Si |
| Ver perfil publico | Parcial | Si | Si | Si | Si |
| Editar perfil propio | No | Si | Si | Si | Si |
| Editar perfiles ajenos | No | No | No | No | Si |
| Ver Network | Parcial/segun sesion | Si | Si | Si | Si |
| Enviar solicitud de conexion | No | Si | Si | Si | Si |
| Aceptar/rechazar conexion recibida | No | Si | Si | Si | Si |
| Enviar contact request | No | Solo a conexiones aceptadas | Solo a conexiones aceptadas | Solo a conexiones aceptadas | Si |
| Enviar mensaje privado | No | Solo a conexiones aceptadas | Solo a conexiones aceptadas | Solo a conexiones aceptadas | Si |
| Ver mensajes propios | No | Si | Si | Si | Si |
| Publicar post | No | Si | Si | Si | Si |
| Editar/eliminar post propio | No | Si | Si | Si | Si |
| Moderar posts ajenos | No | No | No | No | Si |
| Comentar / dar like / guardar post | No | Si | Si | Si | Si |
| Reportar contenido | No | Si | Si | Si | Si |
| Ver jobs publicados | Si | Si | Si | Si | Si |
| Guardar jobs | No | Si | Si | Si | Si |
| Aplicar a jobs | No | Si | Si | Si | Si |
| Publicar jobs | No | No | Si, si es owner | No | Si |
| Gestionar candidaturas | No | No | Si, si es owner | No | Si |
| Ver academy/eventos publicados | Si | Si | Si | Si | Si |
| Guardar cursos/eventos | No | Si | Si | Si | Si |
| Registrar interes en cursos/eventos | No | Si | Si | Si | Si |
| Publicar cursos/eventos | No | No | No | Si, si es owner | Si |
| Gestionar intereses de cursos/eventos | No | No | No | Si, si es owner | Si |
| Ver notificaciones propias | No | Si | Si | Si | Si |
| Marcar notificaciones como leidas | No | Si, propias | Si, propias | Si, propias | Si |
| Reset de actividad de test | No | Si, propia | Si, propia | Si, propia | Segun implementacion |
| Borrar cuenta de test | No | Si, propia | Si, propia | Si, propia | Segun implementacion |

## 5. Reglas transversales

### 5.1 Identidad y onboarding

- Todo usuario autenticado debe tener un registro en `profiles`.
- El `profile_type` determina la experiencia principal: profesional, empresa, centro de formacion o admin.
- Un usuario sin onboarding completo debe ser redirigido al onboarding.
- Las pantallas privadas deben requerir sesion.
- Las acciones de escritura deben validar usuario, perfil activo y permisos.

### 5.2 Propiedad

- Un usuario solo puede editar su propio perfil base.
- Una empresa solo puede editar los datos de `companies` cuyo `owner_profile_id` sea el usuario actual.
- Un centro de formacion solo puede editar los datos de `training_providers` cuyo `owner_profile_id` sea el usuario actual.
- Los posts, comentarios, saved items, conexiones, mensajes y notificaciones deben estar vinculados al perfil autenticado o a una relacion donde participa.

### 5.3 Visibilidad publica

- Los perfiles activos y publicados pueden mostrarse en paginas publicas o listados segun modulo.
- Los datos privados deben quedar protegidos por RLS y por validaciones de servidor.
- Los borradores o contenidos no publicados solo son visibles para su owner y administradores.

### 5.4 Estados comunes

Estados de perfil:

- `active`: perfil operativo.
- Otros estados quedan reservados para moderacion, suspension o fases futuras.

Estados de contenido:

- `draft`: editable por owner, no publico.
- `published`: visible publicamente segun modulo.
- `archived`: retirado del flujo publico.

Estados de conexion:

- `pending`: solicitud enviada y pendiente.
- `accepted`: conexion aceptada.
- `rejected` o estados equivalentes: relacion no activa para comunicacion.

Estados de lectura:

- `read_at = null`: no leido.
- `read_at != null`: leido.

## 6. Modulos funcionales

### 6.1 Autenticacion

Funcionalidades:

- Registro con email/password.
- Login y logout.
- Recuperacion de password.
- OAuth/LinkedIn cuando este configurado.
- Callback de autenticacion con recuperacion ante errores habituales.

Reglas:

- Un usuario registrado debe completar onboarding antes de acceder a la experiencia privada.
- Los errores de validacion y servidor deben mostrarse en pantalla.
- Si Supabase confirma una cuenta pero la app no puede completar el flujo, debe mostrarse un mensaje accionable.

### 6.2 Onboarding

Funcionalidades:

- Seleccion de tipo de perfil.
- Captura de datos minimos segun rol.
- Creacion o actualizacion de registros asociados:
  - Profesional: `profiles` + `professional_profiles`.
  - Empresa: `profiles` + `companies`.
  - Centro de formacion: `profiles` + `training_providers`.

Reglas:

- El onboarding debe ser reanudable.
- Al completarse, `onboarding_completed` pasa a `true`.
- Cada rol debe crear su entidad funcional necesaria.

### 6.3 App shell y navegacion

Funcionalidades:

- Header con navegacion principal.
- Menu de perfil.
- Acceso a mensajes y notificaciones con badges.
- Accesos especificos segun rol.
- Layout responsive desktop/mobile.

Reglas:

- El shell debe ser auth-aware.
- Los badges no deben usar numeros hardcoded.
- Las rutas privadas deben protegerse aunque la navegacion oculte enlaces.

### 6.4 Perfil

Funcionalidades comunes:

- Ver perfil publico.
- Editar perfil propio.
- Avatar y cover.
- Nombre, headline, bio, ubicacion, website.

Profesional:

- Experiencia.
- Disponibilidad.
- Procesos de soldadura.
- Materiales.
- Posiciones.
- Certificaciones.
- Preferencias de trabajo.
- Disponibilidad para viajar.

Empresa:

- Nombre, sector, tamano, ubicacion.
- Descripcion, web, email de contacto.
- Logo y cover.
- Jobs publicados.

Centro de formacion:

- Nombre, ubicacion, descripcion.
- Web, email de contacto.
- Tipos de formacion.
- Cursos/eventos publicados.

Reglas:

- Cada usuario solo edita su propia entidad.
- Los perfiles publicos pueden mostrar un boton de contacto solo cuando existe una conexion aceptada.

### 6.5 Feed

Funcionalidades:

- Listado de posts.
- Crear post.
- Editar/eliminar post propio.
- Imagen o carrusel de imagenes.
- Likes.
- Comentarios.
- Guardar post.
- Reportar contenido.

Reglas:

- El autor puede editar/eliminar su contenido.
- Los usuarios autenticados pueden interactuar con contenido publicado.
- Los reportes deben quedar disponibles para moderacion.
- El feed no requiere algoritmo avanzado en MVP.

### 6.6 Network y conexiones

Funcionalidades:

- Directorio de perfiles profesionales, empresas y centros.
- Busqueda por nombre, rol o texto relevante.
- Filtros principales por tipo de perfil.
- Cards con avatar/logo, tipo, nombre, descripcion, ubicacion, tags y acceso a perfil.
- Solicitud de conexion.
- Estados de boton:
  - Connect.
  - Pending.
  - Connected.
  - Accept/Reject si se recibe una solicitud.

Reglas:

- Las cards de Network no muestran boton de Contact.
- La accion primaria de Network es conectar o ver perfil.
- Una pareja de perfiles no debe tener duplicados activos de conexion.
- Solo el destinatario puede aceptar o rechazar una solicitud recibida.
- Solo el solicitante puede cancelar una solicitud enviada.

### 6.7 Contact requests

Funcionalidades:

- Enviar una solicitud corta de contacto.
- Ver inbox de solicitudes recibidas.
- Ver solicitudes enviadas.
- Marcar como leidas.
- Archivar/gestionar estados desde inbox.

Reglas:

- Solo se puede enviar contact request a perfiles con conexion aceptada.
- No se puede enviar contact request al propio perfil.
- No se permiten duplicados abiertos entre dos perfiles.
- Los errores de validacion y permisos deben mostrarse al usuario.

Nota funcional:

- Contact requests y conexiones son conceptos distintos:
  - Conexion: relacion de red.
  - Contact request: solicitud/mensaje inicial dentro del contexto de mensajes/contacto.

### 6.8 Mensajes

Funcionalidades:

- Inbox de conversaciones.
- Lista de conversaciones.
- Thread de mensajes.
- Busqueda de destinatarios.
- Componer nuevo mensaje.
- Respuestas rapidas.
- Estados de leido/no leido.
- Badge de mensajes no leidos.
- Layout desktop y mobile con overlays.

Reglas:

- Solo se pueden enviar mensajes privados a conexiones aceptadas.
- Un usuario solo puede ver conversaciones donde participa.
- Los mensajes eliminados deben conservar integridad historica cuando aplique.
- El contador de no leidos debe calcularse con datos reales.

### 6.9 Notificaciones

Funcionalidades:

- Dropdown de notificaciones.
- Pagina de notificaciones.
- Badge de no leidas.
- Marcar una como leida.
- Marcar todas como leidas.
- Empty state.
- Demo data solo cuando no exista integracion real o para estados de prototipo.

Eventos actuales o previstos:

- Nueva solicitud de conexion.
- Conexion aceptada.
- Contact request recibido.
- Nuevo mensaje.
- Interaccion en post.
- Comentario en post.
- Job guardado o candidatura.
- Interes en curso/evento.

Reglas:

- Cada notificacion pertenece a `recipient_profile_id`.
- Solo el destinatario o admin puede leer/modificar la notificacion.
- No se incluye email/push en MVP salvo peticion explicita.
- La infraestructura debe permitir real-time en fase futura sin acoplar UI a tiempo real desde el inicio.

### 6.10 Jobs

Funcionalidades publicas:

- Listado de trabajos.
- Filtros y busqueda.
- Detalle con URL propia.
- Guardar trabajo.
- Aplicar a trabajo.

Funcionalidades de empresa:

- Crear job.
- Editar datos estructurados.
- Publicar/archivar.
- Ver candidaturas.
- Actualizar estado de candidaturas.

Reglas:

- Cada trabajo pertenece a una empresa.
- Solo el owner de la empresa puede gestionar sus jobs.
- Los usuarios autenticados pueden guardar y aplicar.
- Los jobs publicados son visibles en el listado.
- Cada trabajo debe tener URL propia.

### 6.11 Academy y eventos

Funcionalidades publicas:

- Listado de cursos.
- Listado de eventos.
- Detalle con URL propia.
- Guardar curso/evento.
- Registrar interes.

Funcionalidades de centro de formacion:

- Crear curso/evento.
- Publicar/archivar.
- Gestionar registros de interes.

Reglas:

- Cada curso/evento pertenece a un centro de formacion.
- Solo el owner del centro puede gestionar sus publicaciones.
- Los usuarios autenticados pueden guardar y registrar interes.
- Los items publicados son visibles publicamente.

### 6.12 Settings

Funcionalidades:

- Accesos a perfil, saved jobs y preferencias.
- Importacion de LinkedIn para usuarios existentes.
- Reset de actividad de test.
- Borrado de cuenta de test.

Reglas:

- El reset de actividad de test debe eliminar actividad generada por el usuario sin eliminar la cuenta base.
- Debe conservar login, perfil base, onboarding y entidades principales.
- Acciones destructivas deben requerir confirmacion explicita en UI.

## 7. Modelo de datos funcional

Entidades principales:

| Entidad | Proposito funcional |
| --- | --- |
| `profiles` | Identidad funcional base del usuario y tipo de perfil. |
| `professional_profiles` | Datos tecnicos especificos del profesional. |
| `companies` | Perfil de empresa asociado a un owner. |
| `training_providers` | Perfil de centro de formacion asociado a un owner. |
| `posts` | Publicaciones del feed. |
| `comments` | Comentarios en posts. |
| `likes` | Reacciones simples en posts. |
| `saved_items` | Guardados de posts, jobs y cursos/eventos. |
| `connections` | Relaciones de red entre perfiles. |
| `contact_requests` | Solicitudes/mensajes iniciales de contacto. |
| `message_conversations` | Conversaciones privadas. |
| `message_conversation_participants` | Participantes y estado de lectura de conversaciones. |
| `messages` | Mensajes dentro de conversaciones. |
| `jobs` | Ofertas de empleo. |
| `job_applications` | Candidaturas a jobs. |
| `course_events` | Cursos, formaciones y eventos. |
| `course_event_interests` | Registros de interes en cursos/eventos. |
| `notifications` | Notificaciones persistidas del usuario. |
| `reports` | Reportes de contenido para moderacion. |

## 8. Flujos principales

### 8.1 Registro y onboarding

1. Usuario crea cuenta.
2. Confirma email si aplica.
3. Accede a onboarding.
4. Selecciona rol.
5. Completa datos minimos.
6. Se crean los registros funcionales.
7. Entra en la experiencia privada.

### 8.2 Conexion entre usuarios

1. Usuario entra en Network.
2. Busca o filtra perfiles.
3. Pulsa Connect.
4. El destinatario recibe solicitud/notificacion.
5. El destinatario acepta o rechaza.
6. Si acepta, ambos quedan conectados.

### 8.3 Contacto y mensajeria

1. Usuario abre un perfil publico.
2. Si ya existe conexion aceptada, puede contactar.
3. Envia un mensaje corto de contacto o inicia conversacion.
4. El destinatario recibe notificacion/inbox.
5. Ambos pueden continuar por mensajes privados.

### 8.4 Publicacion en feed

1. Usuario autenticado escribe post.
2. Opcionalmente sube imagen.
3. Publica.
4. Otros usuarios pueden comentar, dar like, guardar o reportar.
5. El autor puede editar o eliminar.

### 8.5 Job

1. Empresa crea job desde su area.
2. Publica el job.
3. Usuarios lo descubren en `/jobs` o por URL propia.
4. Usuario guarda o aplica.
5. Empresa revisa candidaturas.
6. Empresa actualiza estado.

### 8.6 Curso/evento

1. Centro de formacion crea item.
2. Publica.
3. Usuarios lo descubren en Academy/Eventos o por URL propia.
4. Usuario guarda o registra interes.
5. Centro revisa interesados.

### 8.7 Notificaciones

1. Ocurre un evento funcional relevante.
2. Se crea notificacion persistida para el destinatario.
3. El header muestra badge si hay no leidas.
4. El usuario abre dropdown o pagina.
5. Marca una o todas como leidas.

## 9. Reglas de seguridad y permisos

- La UI puede ocultar acciones, pero la seguridad real debe estar en servidor y RLS.
- Las operaciones de escritura deben validar sesion.
- Las entidades con owner deben validar ownership.
- Los datos privados solo deben ser visibles para participantes, owner o admin.
- Las conversaciones privadas requieren conexion aceptada.
- Las contact requests requieren conexion aceptada.
- Las notificaciones son privadas del destinatario.
- Los contadores de badges deben consultarse de forma eficiente.

## 10. Criterios generales de QA manual

Cada modulo debe poder validarse con al menos estos estados:

- Usuario anonimo.
- Usuario autenticado sin onboarding.
- Profesional activo.
- Empresa activa.
- Centro de formacion activo.
- Usuario owner vs no owner.
- Estado vacio.
- Estado con datos reales.
- Error de validacion.
- Error de permisos.
- Desktop.
- Mobile.

Checklist basico por funcionalidad:

1. La accion aparece solo a quien tiene permiso.
2. La accion funciona con datos reales.
3. Los errores son visibles.
4. El estado visual cambia despues de la accion.
5. La recarga mantiene el estado persistido.
6. La ruta directa no permite saltarse permisos.
7. El layout no se rompe en mobile.

## 11. Fuera de alcance actual o Phase 2

Funcionalidades que deben tratarse como fase posterior salvo decision explicita:

- Realtime completo en mensajes/notificaciones.
- Email/push notifications.
- Algoritmo avanzado de feed.
- Recomendaciones inteligentes.
- Busqueda full-text avanzada global.
- Admin panel completo.
- Pagos, suscripciones o monetizacion.
- Verificacion formal de certificaciones.
- Matching automatico empresa-profesional.
- Aplicaciones moviles nativas.

## 12. Documentos relacionados

- `docs/weldoo-functional-mvp.md`: especificacion MVP inicial.
- `docs/weldoo-functional-mvp-en.md`: version inglesa del MVP inicial.
- `docs/weldoo-epics-task-plan-ca.md`: plan por epicas y tareas.
- `docs/weldoo-codex-task-plan-es.md`: plan de trabajo orientado a Codex.
- `docs/task-*-validation.md`: validaciones manuales por tarea.
- `docs/task-msg-004-full-messages-inbox-plan.md`: plan funcional/tecnico de mensajes Phase 2.
- `docs/task-notif-003-notification-infrastructure-plan.md`: plan funcional/tecnico de notificaciones.

## 13. Pendientes de documentacion

- Detallar flujos exactos de administracion cuando se implemente admin panel.
- Separar una matriz de permisos independiente si este documento crece demasiado.
- Crear diccionario de eventos de notificacion definitivo.
- Crear mapa de rutas funcionales con owner, publico/privado y estados.
- Añadir criterios de aceptacion por modulo cuando se cierre cada epic.
