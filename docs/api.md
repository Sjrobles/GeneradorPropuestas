# API REST de Ágora

## Convenciones

- Prefijo versionado: `/api/v1`.
- JSON para solicitudes y respuestas.
- DTOs con lista blanca: los campos no declarados se rechazan.
- Identificadores MongoDB validados antes de acceder a persistencia.
- Autenticación mediante `Authorization: Bearer <token>` en rutas privadas.
- Códigos HTTP semánticos: `201` al crear, `400` para datos inválidos y `404`
  para recursos inexistentes.

## Endpoints implementados

| Método  | Ruta                                                       | Responsabilidad                                                |
| ------- | ---------------------------------------------------------- | -------------------------------------------------------------- |
| `GET`   | `/api/v1/health`                                           | Disponibilidad de la API.                                      |
| `GET`   | `/api/v1/skills`                                           | Catálogo compatible con `AgoraApi`.                            |
| `POST`  | `/api/v1/auth/register`                                    | Crear una cuenta y entregar JWT.                               |
| `POST`  | `/api/v1/auth/login`                                       | Validar credenciales y entregar JWT.                           |
| `POST`  | `/api/v1/auth/google`                                      | Verificar Google y entregar el JWT propio de Ágora.            |
| `GET`   | `/api/v1/auth/me`                                          | Consultar la cuenta autenticada.                               |
| `POST`  | `/api/v1/projects`                                         | Crear un proyecto del usuario autenticado.                     |
| `GET`   | `/api/v1/projects`                                         | Listar únicamente proyectos propios.                           |
| `GET`   | `/api/v1/projects/:projectId`                              | Consultar un proyecto propio.                                  |
| `PATCH` | `/api/v1/projects/:projectId/language`                     | Seleccionar idioma de un proyecto propio.                      |
| `GET`   | `/api/v1/projects/:projectId/messages`                     | Consultar e inicializar la conversación persistente.           |
| `POST`  | `/api/v1/projects/:projectId/messages`                     | Guardar una respuesta y generar la intervención de Ágora.      |
| `GET`   | `/api/v1/projects/:projectId/context`                      | Consultar el contexto recopilado.                              |
| `PATCH` | `/api/v1/projects/:projectId/context`                      | Editar y persistir el contexto recopilado.                     |
| `POST`  | `/api/v1/projects/:projectId/diagnosis`                    | Analizar completitud y coherencia del contexto.                |
| `POST`  | `/api/v1/projects/:projectId/context/confirm`              | Confirmar el contexto completo.                                |
| `GET`   | `/api/v1/projects/:projectId/execution-details`            | Consultar respuestas para metodología y presupuesto.           |
| `PATCH` | `/api/v1/projects/:projectId/execution-details`            | Guardar respuestas operativas del usuario.                     |
| `POST`  | `/api/v1/projects/:projectId/execution-details/confirm`    | Confirmar las nueve respuestas y reanudar agentes.             |
| `GET`   | `/api/v1/projects/:projectId/components`                   | Consultar componentes generados.                               |
| `POST`  | `/api/v1/projects/:projectId/components/generate`          | Iniciar o reanudar la generación multiagente.                  |
| `POST`  | `/api/v1/projects/:projectId/components/budget/regenerate` | Regenerar sólo Presupuesto con las salidas previas guardadas.  |
| `GET`   | `/api/v1/projects/:projectId/components/budget/workbook`   | Descargar el presupuesto .xlsx con una pestaña por rubro.      |
| `POST`  | `/api/v1/projects/:projectId/components/budget/workbook`   | Importar el .xlsx editado y reconstruir la tabla presupuestal. |
| `POST`  | `/api/v1/projects/:projectId/document/assemble`            | Ensamblar y persistir el documento aprobado.                   |
| `GET`   | `/api/v1/projects/:projectId/document`                     | Consultar el documento persistido del propietario.             |
| `POST`  | `/api/v1/projects/:projectId/document/translate`           | Traducir y persistir una versión del documento.                |
| `POST`  | `/api/v1/projects/:projectId/complete`                     | Marcar como finalizado un proyecto con documento.              |

## Ejemplo: crear proyecto

```http
POST /api/v1/projects
Content-Type: application/json
Authorization: Bearer eyJ...

{
  "selectedSkillId": "international-calls",
  "title": "Nuevo proyecto Ágora"
}
```

La respuesta conserva los nombres del contrato frontend: `id`, `title`,
`selectedSkillId`, `language`, `state`, `progress`, `createdAt` y `updatedAt`.

Un proyecto ajeno responde `404`, incluso cuando el identificador existe. Esto
evita revelar recursos de otras cuentas.

## Chat asistido por IA

El backend controla qué campo se recopila en cada turno y persiste tanto el
mensaje como el contexto. Si `OPENAI_API_KEY` está configurada, OpenAI redacta
el acuse y la siguiente pregunta. Si la clave no existe o el proveedor no
responde, el mismo endpoint utiliza una pregunta local controlada para que el
flujo no se interrumpa.

## Diagnóstico estructurado

La completitud se calcula en el backend a partir de los siete campos obligatorios;
no queda a criterio del modelo. Cuando todos existen, OpenAI revisa el contenido
y responde bajo un esquema JSON fijo con `ambiguities`, `inconsistencies` y un
máximo de tres `questions`. Cada pregunta incluye `id`, `field` y `prompt`.

El séptimo campo, `projectDuration`, solicita la duración total prevista en
semanas o meses y una eventual fecha límite. Ideación lo usa para generar un
cronograma concreto y coherente con el contexto confirmado.

Si OpenAI no está disponible, el diagnóstico conserva la completitud calculada
y devuelve listas de observaciones vacías. Si faltan campos, el backend produce
preguntas deterministas sin consumir la API externa.

## Intervención entre Ideación y Metodología

La primera llamada de generación ejecuta Investigación e Ideación. Al terminar,
el proyecto cambia a `waiting_execution_details`. El usuario debe responder y
confirmar las nueve preguntas operativas. Sólo entonces el proyecto cambia a
`execution_details_confirmed` y una nueva llamada de generación reanuda el flujo
con Metodología, Presupuesto e Impacto, sin repetir los agentes completados.

## Documento persistente por perfil

El documento consolidado se guarda dentro del proyecto en MongoDB. Todos los
endpoints anteriores resuelven el proyecto mediante su `_id` y el `ownerId` del
JWT, de modo que cada perfil sólo puede listar y consultar sus propios
documentos. Si se edita un componente aprobado, la versión consolidada previa se
invalida hasta que el usuario vuelva a ensamblarla.
