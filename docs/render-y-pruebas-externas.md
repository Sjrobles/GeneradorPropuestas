# Despliegue en Render y pruebas externas

Esta guía publica Ágora desde la rama `main` mediante el Blueprint
[`render.yaml`](../render.yaml). Render crea dos recursos:

- `agora-api-alejofontalvo-pf-prueba`: backend NestJS como Web Service.
- `agora-alejofontalvo-pf-prueba`: frontend React como Static Site.

MongoDB continúa alojado en Atlas. Los documentos no se guardan en el sistema
de archivos efímero de Render, sino en MongoDB y asociados al usuario
autenticado.

## 1. Requisitos previos de seguridad

Antes de publicar una URL accesible desde Internet:

1. Revocar la clave de OpenAI que se haya compartido en mensajes, capturas o
   archivos y crear una nueva clave.
2. Cambiar la contraseña del usuario de MongoDB Atlas que se haya compartido y
   generar una nueva cadena `MONGODB_URI`.
3. No guardar ninguna de esas credenciales en Git, en el frontend ni en
   variables cuyo nombre comience por `VITE_`.
4. Usar una cuenta o proyecto de OpenAI con límite de gasto apropiado para la
   prueba externa.

## 2. Integrar los cambios

1. Abrir un Pull Request de `fix/stability-persistence-performance` hacia
   `main`.
2. Confirmar que las pruebas y los builds pasan.
3. Revisar el diff y hacer merge.
4. Verificar que `main` contiene `render.yaml`.

## 3. Preparar MongoDB Atlas

1. Cambiar la contraseña del usuario de base de datos y copiar la nueva cadena
   de conexión de la base `agora`.
2. Crear primero el backend en Render.
3. En el servicio del backend, abrir **Connect > Outbound** y copiar todos los
   rangos CIDR de salida.
4. En Atlas, abrir **Network Access** y añadir esos rangos a la lista de acceso.
5. Confirmar que el usuario de Atlas sólo tiene los permisos necesarios sobre
   la base `agora`.

Para una prueba temporal se puede habilitar acceso desde cualquier IP, pero no
es la configuración recomendada. La lista de rangos de salida de Render permite
mantener Atlas restringido.

## 4. Crear el Blueprint en Render

1. Iniciar sesión en Render y conectar la cuenta de GitHub que tenga acceso a
   `alejofontalvo/PF_PRUEBA`.
2. Elegir **New > Blueprint**.
3. Seleccionar el repositorio `PF_PRUEBA` y la rama `main`.
4. Render detectará el archivo `render.yaml`.
5. Introducir únicamente en el formulario seguro de Render:
   - `MONGODB_URI`: la nueva cadena de Atlas.
   - `OPENAI_API_KEY`: la nueva clave de OpenAI.
   - `GOOGLE_CLIENT_ID`: el ID del cliente web de Google.
   - `VITE_GOOGLE_CLIENT_ID`: exactamente el mismo ID del cliente web.
6. Aplicar el Blueprint y esperar a que ambos despliegues terminen.

`JWT_SECRET` se genera automáticamente. `OPENAI_MODEL` queda configurado como
`gpt-5.6-luna`. Render proporciona `PORT`; no debe añadirse manualmente.

En Google Cloud Console, añadir
`https://agora-alejofontalvo-pf-prueba.onrender.com` a los orígenes JavaScript
autorizados del cliente OAuth web. No se necesita un secreto de cliente en
Ágora.

## 5. Validación técnica

Comprobar en este orden:

1. El proceso responde con estado `ok` en:
   `https://agora-api-alejofontalvo-pf-prueba.onrender.com/api/v1/health/live`.
   MongoDB responde en `/api/v1/health/ready` con estado `ready`.
2. La interfaz abre en:
   `https://agora-alejofontalvo-pf-prueba.onrender.com`.
3. Al recargar una ruta interna, por ejemplo `/auth`, no aparece un 404. El
   Blueprint incluye la reescritura `/*` a `/index.html` necesaria para React
   Router.
4. Se puede registrar un usuario, cerrar sesión y volver a entrar.
5. Un documento creado aparece de nuevo después de iniciar sesión.

Si el backend gratuito fue suspendido por inactividad, la primera petición
puede tardar mientras Render reactiva el servicio. Ágora realiza reintentos
silenciosos; una instancia que no se suspenda es necesaria cuando se requiera
disponibilidad continua.

## 6. Recorrido para la persona evaluadora

Compartir únicamente la URL del frontend y estas instrucciones:

1. Crear una cuenta de prueba con un correo no sensible.
2. Crear un proyecto nuevo y seleccionar el flujo en español.
3. Responder el diagnóstico inicial, incluyendo la duración total y una
   cantidad exacta de objetivos entre 2 y 5.
4. Confirmar que se ejecutan Investigación e Ideación.
5. Revisar los objetivos y actividades generados.
6. Responder las nueve preguntas obligatorias de ejecución.
7. Confirmar que Metodología inicia sin refrescar manualmente la página.
8. Confirmar que Presupuesto se ejecuta después de Metodología, muestra una
   tabla completa y no deja costos o totales como “pendiente”.
9. Revisar Impacto y aprobar los componentes.
10. Editar un fragmento con negrita, cursiva, lista y alineación; guardar y
    volver a abrirlo.
11. Ensamblar el documento, traducirlo al inglés de forma opcional y exportarlo
    a DOCX y PDF.
12. Iniciar otro proyecto, dejarlo a medias, cerrar sesión y comprobar que
    aparece como pendiente y se reanuda en el paso correcto.
13. Confirmar que sólo se permiten tres regeneraciones de fragmentos y una
    regeneración completa del proyecto terminado.
14. Cerrar sesión, volver a entrar y confirmar que los proyectos y documentos
    continúan disponibles.

## 7. Formato para reportar hallazgos

Cada incidencia debe incluir:

- Fecha y hora aproximada.
- Navegador, versión y dispositivo.
- Identificador o URL del proyecto, sin contraseñas ni claves.
- Etapa del flujo donde ocurrió.
- Pasos exactos para reproducirla.
- Resultado esperado y resultado obtenido.
- Captura de pantalla, si aporta contexto.

No compartir `OPENAI_API_KEY`, `MONGODB_URI`, tokens JWT ni contraseñas en el
reporte.

## 8. Criterio de aceptación de la prueba

La versión se considera apta para demostración si:

- El health check y el frontend están disponibles.
- El orden de agentes es Investigación, Ideación, Metodología, Presupuesto e
  Impacto.
- Metodología comienza sin recargar la página.
- Ideación genera exactamente entre 2 y 5 objetivos, según la selección del
  usuario.
- Metodología y Presupuesto reflejan las actividades y son coherentes entre sí.
- El presupuesto contiene cantidades, costos unitarios y totales numéricos.
- El formato enriquecido persiste y se conserva en DOCX y PDF.
- Los proyectos permanecen asociados al perfil después de una nueva sesión.
- Los límites de regeneración se aplican y persisten en la base de datos.
