# Weldoo - Documento funcional del MVP

## 1. Objetivo

Weldoo es una red profesional vertical para soldadores, empresas industriales, centros de formacion y especialistas del sector de la soldadura.

El objetivo de la Fase 1 es convertir el prototipo actual en un MVP funcional, usable por usuarios reales, con las funcionalidades principales necesarias para validar la propuesta de valor:

- Crear y gestionar perfiles profesionales especificos de soldadura.
- Publicar contenido tecnico y profesional en un feed.
- Descubrir y conectar con otros perfiles del sector.
- Publicar y consultar ofertas de empleo.
- Publicar y consultar formacion, cursos y eventos.
- Permitir una comunicacion basica entre usuarios.
- Disponer de un panel de administracion para gestionar contenido y moderacion.

La Fase 1 no busca competir todavia con una plataforma tipo LinkedIn completa, sino validar si existe traccion real en una comunidad profesional vertical de soldadura.

## 2. Enfoque de desarrollo

El MVP sera desarrollado por un unico desarrollador usando Codex como apoyo para acelerar:

- Generacion de componentes.
- Implementacion de CRUDs.
- Modelado de base de datos.
- Refactorizacion del prototipo.
- Tests basicos.
- Correccion de bugs.
- Documentacion tecnica.

La estimacion recomendada para una Fase 1 fuerte es de aproximadamente:

- 350-550 horas de desarrollo efectivo.
- 10-16 semanas si se trabaja con dedicacion alta.
- 14-22 semanas si se trabaja de forma parcial pero constante.

Como numero de planificacion, se recomienda usar:

**500 horas / 14 semanas**

Este numero deja margen para construir un producto real, no solo conectar pantallas a una base de datos.

## 3. Usuarios objetivo

### 3.1 Soldador / profesional tecnico

Usuario principal de la plataforma.

Necesita:

- Crear un perfil profesional.
- Mostrar experiencia, procesos de soldadura, materiales, posiciones, certificaciones y disponibilidad.
- Encontrar oportunidades laborales.
- Seguir contenido tecnico.
- Conectar con empresas, otros soldadores y centros de formacion.
- Descubrir cursos, webinars y eventos.

### 3.2 Empresa / empleador

Empresa industrial, taller, constructora, ingenieria, fabricante o recruiter especializado.

Necesita:

- Crear un perfil de empresa.
- Publicar ofertas de trabajo.
- Buscar profesionales.
- Contactar candidatos.
- Publicar contenido de marca o noticias tecnicas.

### 3.3 Centro de formacion / academia

Centro que ofrece cursos, certificaciones, webinars o workshops.

Necesita:

- Crear perfil de organizacion.
- Publicar cursos y eventos.
- Recibir solicitudes de interes o registros.
- Ganar visibilidad dentro de una comunidad vertical.

### 3.4 Administrador

Responsable de operar la plataforma.

Necesita:

- Gestionar usuarios.
- Moderar publicaciones.
- Revisar reportes.
- Gestionar jobs, cursos y eventos destacados.
- Mantener la calidad del contenido.

## 4. Fase 1 - MVP fuerte

### 4.1 Autenticacion y onboarding

Funcionalidades:

- Registro con email y password.
- Login y logout.
- Recuperacion de password.
- Seleccion de tipo de usuario:
  - Profesional / soldador.
  - Empresa.
  - Centro de formacion.
- Onboarding inicial con datos minimos segun tipo de usuario.

Campos iniciales para profesional:

- Nombre.
- Ubicacion.
- Titular profesional.
- Procesos de soldadura.
- Experiencia.
- Disponibilidad.

Campos iniciales para empresa:

- Nombre de empresa.
- Sector.
- Ubicacion.
- Descripcion.
- Web/contacto.

Campos iniciales para centro de formacion:

- Nombre.
- Ubicacion.
- Tipos de formacion ofrecida.
- Web/contacto.

### 4.2 Perfiles

El perfil debe ser una de las piezas centrales del MVP.

Funcionalidades comunes:

- Ver perfil publico.
- Editar perfil propio.
- Foto/avatar.
- Imagen de cabecera opcional.
- Ubicacion.
- Descripcion.
- Enlaces externos.

Perfil profesional:

- Titular profesional.
- Experiencia laboral.
- Procesos de soldadura:
  - MIG/MAG.
  - TIG.
  - MMA/SMAW.
  - FCAW.
  - SAW.
  - Otros.
- Materiales:
  - Acero carbono.
  - Acero inoxidable.
  - Aluminio.
  - Duplex.
  - Aleaciones especiales.
- Posiciones:
  - PA, PB, PC, PD, PE, PF, PG.
  - 1G, 2G, 3G, 4G, 5G, 6G.
- Certificaciones declaradas.
- Disponibilidad:
  - Disponible.
  - No disponible.
  - Abierto a propuestas.
- Preferencia de trabajo:
  - Local.
  - Nacional.
  - Internacional.
  - Offshore.
  - Taller.
  - Obra.

Perfil de empresa:

- Descripcion.
- Sector.
- Tamano.
- Ubicacion.
- Ofertas activas.
- Publicaciones.
- Contacto.

Perfil de centro de formacion:

- Descripcion.
- Cursos publicados.
- Eventos publicados.
- Ubicacion.
- Contacto.

### 4.3 Feed profesional

El feed debe permitir actividad social basica, con contenido enfocado al sector.

Funcionalidades:

- Crear publicacion.
- Editar/eliminar publicacion propia.
- Ver feed general.
- Ver publicaciones de un perfil.
- Like.
- Comentarios.
- Guardar publicacion.
- Subida de imagen opcional.
- Reportar publicacion.

Tipos de contenido esperados:

- Casos tecnicos.
- Fotos de soldaduras.
- Parametros de procedimiento.
- Dudas tecnicas.
- Seguridad.
- Certificaciones.
- Proyectos.
- Noticias del sector.

No se recomienda incluir en Fase 1:

- Algoritmo complejo de ranking.
- Recomendaciones avanzadas.
- Video social.
- Hashtags avanzados.

### 4.4 Red / directorio profesional

Funcionalidades:

- Listado de perfiles.
- Busqueda por nombre, rol o empresa.
- Filtros:
  - Tipo de perfil.
  - Ubicacion.
  - Proceso de soldadura.
  - Disponibilidad.
  - Experiencia.
- Ver perfil publico.
- Seguir o conectar con otro usuario.
- Estado basico de relacion:
  - No conectado.
  - Solicitud enviada.
  - Conectado.

Para simplificar el MVP, se puede elegir entre:

- Modelo de seguir.
- Modelo de conexion bilateral.

Recomendacion para Fase 1:

Usar conexion bilateral si el foco es empleo y contacto profesional. Usar seguimiento si el foco inicial es contenido y comunidad.

### 4.5 Empleos

Funcionalidades para usuarios:

- Ver listado de ofertas.
- Buscar ofertas.
- Filtrar por:
  - Ubicacion.
  - Proceso de soldadura.
  - Tipo de contrato.
  - Disponibilidad para viajar.
  - Experiencia.
  - Empresa.
- Ver detalle de oferta.
- Guardar oferta.
- Aplicar a una oferta.

Funcionalidades para empresa:

- Crear oferta.
- Editar oferta.
- Cerrar oferta.
- Ver candidatos o solicitudes.

Modelo de aplicacion recomendado para Fase 1:

- Opcion A: boton de aplicacion externa.
- Opcion B: formulario simple dentro de Weldoo.

Recomendacion:

Implementar primero un formulario simple:

- Mensaje del candidato.
- CV o enlace externo opcional.
- Datos basicos del perfil.
- Estado de candidatura.

Estados de candidatura:

- Enviada.
- Vista.
- Contactado.
- Descartada.

### 4.6 Academia, cursos y eventos

Funcionalidades:

- Listado de cursos/eventos.
- Filtros:
  - Online.
  - Webinar.
  - Presencial.
  - Nivel.
  - Ubicacion.
- Pagina de detalle.
- Guardar curso/evento.
- Registrar interes.
- Solicitar informacion.

Tipos:

- Curso online.
- Webinar.
- Curso presencial.
- Workshop.
- Evento sectorial.

Para Fase 1, los webinars no deben incluir sala de live video integrada. Deben funcionar como:

- Pagina informativa.
- Registro de interes.
- Enlace externo opcional a Zoom, Meet, Teams o Jitsi.
- Grabacion opcional como enlace externo.

### 4.7 Mensajeria basica

La Fase 1 debe incluir una comunicacion simple, pero no un chat avanzado.

Opciones:

1. Contact request:
   - Usuario envia una solicitud de contacto con mensaje.
   - El destinatario recibe la solicitud en su panel.

2. Mensajeria simple:
   - Conversaciones 1:1.
   - Texto plano.
   - Sin archivos.
   - Sin indicadores de escritura.
   - Sin lectura en tiempo real.

Recomendacion:

Para reducir complejidad, empezar con contact requests y evolucionar a mensajeria simple si el producto lo necesita.

### 4.8 Notificaciones basicas dentro de la app

Aunque la infraestructura avanzada de notificaciones queda para Fase 2, en Fase 1 conviene tener eventos visibles dentro de la app.

Funcionalidades:

- Ver actividad reciente.
- Notificaciones internas simples para:
  - Nueva conexion.
  - Comentario en publicacion.
  - Like en publicacion.
  - Solicitud de contacto.
  - Nueva candidatura.

No incluido en Fase 1:

- Push notifications.
- Email notifications complejas.
- WebSockets.
- Infraestructura en tiempo real.
- Preferencias avanzadas por canal.

### 4.9 Administracion y moderacion

Panel basico para administradores.

Funcionalidades:

- Ver usuarios.
- Buscar usuarios.
- Activar/desactivar usuarios.
- Ver publicaciones.
- Eliminar publicaciones.
- Ver comentarios reportados.
- Gestionar reportes.
- Ver ofertas de empleo.
- Aprobar o retirar ofertas.
- Ver cursos/eventos.
- Aprobar o retirar cursos/eventos.

Roles:

- Usuario normal.
- Empresa.
- Centro de formacion.
- Administrador.

### 4.10 Responsive y calidad visual

El MVP debe funcionar correctamente en:

- Desktop.
- Tablet.
- Mobile.

Prioridades:

- Navegacion mobile clara.
- Feed legible.
- Formularios usables.
- Perfiles bien estructurados.
- Jobs y cursos faciles de consultar.

El prototipo actual puede servir como base visual, pero debe convertirse en componentes mantenibles.

## 5. Fase 2 - Funcionalidades excluidas de Fase 1

Las siguientes funcionalidades quedan explicitamente fuera de la Fase 1 y se plantean para Fase 2.

### 5.1 Pagos

Posibles usos futuros:

- Cursos de pago.
- Subscripciones premium.
- Publicacion destacada de ofertas.
- Planes para empresas.
- Comisiones por contratacion o formacion.

No incluido en Fase 1:

- Stripe.
- Facturacion.
- Planes de pago.
- Checkout.
- Gestion fiscal.

### 5.2 Live video integrado

Posibles usos futuros:

- Webinars dentro de Weldoo.
- Salas en directo.
- Clases en vivo.
- Q&A interactivo.
- Grabaciones internas.

No incluido en Fase 1:

- Jitsi/Zoom/Meet embebido como sala propia.
- Camara/microfono dentro de la plataforma.
- Gestion de participantes en tiempo real.
- Grabacion de sesiones.

En Fase 1, los webinars pueden usar enlaces externos.

### 5.3 Recomendaciones complejas

Posibles usos futuros:

- Recomendacion de contactos.
- Recomendacion de empleos.
- Recomendacion de cursos.
- Ranking personalizado del feed.
- Matching avanzado entre soldadores y empresas.

No incluido en Fase 1:

- Algoritmos avanzados.
- Machine learning.
- Scoring complejo.
- Personalizacion profunda.

En Fase 1, se pueden usar filtros y ordenacion simple.

### 5.4 Verificacion de certificaciones

Posibles usos futuros:

- Subida de certificados.
- Validacion manual por admin.
- Validacion por entidades externas.
- Badge de perfil verificado.
- Expiracion y renovacion de certificados.

No incluido en Fase 1:

- Validacion oficial.
- Integracion con organismos certificadores.
- Sellos verificados.

En Fase 1, las certificaciones seran declarativas.

### 5.5 Chat avanzado

Posibles usos futuros:

- Chat en tiempo real.
- Indicador de escritura.
- Leido/no leido.
- Adjuntos.
- Audio/video.
- Grupos.
- Bloqueo de usuarios.

No incluido en Fase 1:

- WebSockets.
- Chat avanzado.
- Multimedia.
- Grupos.

En Fase 1, se recomienda usar solicitudes de contacto o mensajeria simple.

### 5.6 Infraestructura avanzada de notificaciones

Posibles usos futuros:

- Notificaciones push.
- Emails transaccionales avanzados.
- Preferencias por canal.
- Digest semanal.
- Notificaciones en tiempo real.

No incluido en Fase 1:

- Push mobile/browser.
- Sistema complejo de preferencias.
- Cola avanzada de notificaciones.

En Fase 1, bastan notificaciones internas simples.

### 5.7 Apps nativas

Posibles usos futuros:

- App iOS.
- App Android.
- Push notifications nativas.
- Experiencia mobile dedicada.

No incluido en Fase 1:

- Desarrollo nativo.
- React Native.
- Publicacion en App Store / Google Play.

En Fase 1, la prioridad es una web responsive.

## 6. Modelo de datos inicial

Entidades principales:

- User.
- Profile.
- Company.
- TrainingProvider.
- Post.
- Comment.
- Like.
- SavedItem.
- Connection.
- Job.
- JobApplication.
- CourseEvent.
- CourseRegistrationInterest.
- ContactRequest.
- Notification.
- Report.

Relaciones clave:

- Un User tiene un Profile.
- Un User puede pertenecer a una Company o TrainingProvider.
- Un User crea Posts.
- Un Post tiene Comments y Likes.
- Un User puede guardar Posts, Jobs y Courses.
- Una Company crea Jobs.
- Un User aplica a Jobs.
- Un TrainingProvider crea Courses/Events.
- Un User registra interes en Courses/Events.
- Users pueden conectarse entre si.

## 7. Prioridad funcional

### Must have

- Auth.
- Onboarding.
- Perfil editable.
- Feed con posts/comentarios/likes.
- Directorio de perfiles.
- Jobs.
- Cursos/eventos.
- Contact request o mensajeria simple.
- Admin basico.
- Responsive.

### Should have

- Guardar posts/jobs/cursos.
- Reportar contenido.
- Filtros avanzados en jobs y perfiles.
- Estados de candidatura.
- Notificaciones internas simples.

### Could have

- Subida de imagen en posts.
- Subida de CV.
- Perfiles destacados.
- Cursos destacados.
- Empresas destacadas.

### Won't have en Fase 1

- Pagos.
- Live video integrado.
- Recomendaciones complejas.
- Verificacion de certificaciones.
- Chat avanzado.
- Infraestructura avanzada de notificaciones.
- Apps nativas.

## 8. Estimacion por modulo

| Modulo | Estimacion |
|---|---:|
| Product cleanup / especificacion | 12-24h |
| Setup tecnico, arquitectura y despliegue | 30-50h |
| Conversion del prototipo a app responsive | 50-90h |
| Auth y onboarding | 25-45h |
| Perfiles | 45-75h |
| Feed | 55-90h |
| Red / directorio | 35-60h |
| Jobs | 40-70h |
| Academia/eventos | 35-60h |
| Contact request / mensajeria simple | 30-60h |
| Admin/moderacion | 40-70h |
| QA, mobile polish y launch fixes | 40-70h |

Estimacion total objetivo:

**350-550 horas**

Numero de planificacion recomendado:

**500 horas**

## 9. Plan de ejecucion sugerido

### Sprint 0 - Preparacion

- Elegir stack.
- Definir modelo de datos.
- Crear repositorio y estructura.
- Configurar auth, base de datos y despliegue.
- Convertir el prototipo en rutas/componentes iniciales.

### Sprint 1 - Auth, onboarding y perfiles

- Registro/login.
- Seleccion de tipo de usuario.
- Perfil editable.
- Perfil publico.
- Datos especificos de soldadura.

### Sprint 2 - Feed

- Crear posts.
- Ver feed.
- Likes.
- Comentarios.
- Guardados.
- Reportes basicos.

### Sprint 3 - Red profesional

- Directorio.
- Busqueda.
- Filtros.
- Conexion o follow.
- Vista de perfil desde directorio.

### Sprint 4 - Jobs

- Listado de ofertas.
- Detalle.
- Crear/editar oferta como empresa.
- Aplicacion simple.
- Guardar oferta.

### Sprint 5 - Academia y eventos

- Listado.
- Detalle.
- Filtros.
- Registro de interes.
- Guardar curso/evento.

### Sprint 6 - Contacto, admin y QA

- Solicitudes de contacto o mensajeria simple.
- Admin basico.
- Moderacion.
- Responsive.
- QA.
- Preparacion de beta privada.

## 10. Criterios de exito de la Fase 1

La Fase 1 se considera lista cuando:

- Un usuario puede registrarse y crear un perfil profesional.
- Una empresa puede crear perfil y publicar una oferta.
- Un usuario puede encontrar y aplicar a una oferta.
- Un usuario puede publicar contenido y recibir interaccion.
- Un usuario puede descubrir perfiles y conectar/contactar.
- Un centro de formacion puede publicar cursos/eventos.
- Un usuario puede registrar interes en cursos/eventos.
- Un administrador puede moderar contenido basico.
- La app funciona correctamente en desktop y mobile.
- El producto puede ser mostrado a usuarios reales sin depender del prototipo estatico.

