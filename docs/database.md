# Persistencia MongoDB de Ágora

## Decisión

El MVP utiliza MongoDB con Mongoose. Las cuentas viven en `users` y cada
proyecto conserva su contexto y conversación inicial embebidos, porque en esta
fase siempre se leen y actualizan junto con el agregado del proyecto:

- `users`
- `projects`
- `components`
- `documents`

No se busca reproducir una normalización SQL. Cuando el volumen de conversación
requiera paginación independiente, `messages` podrá extraerse a su propia
colección sin cambiar el contrato HTTP.

## Colección implementada: `users`

```text
_id
name
email (único)
passwordHash (excluido de consultas normales)
createdAt
updatedAt
```

Las contraseñas se transforman con `bcryptjs` y nunca se almacenan ni se
devuelven en texto plano.

## Colección implementada: `projects`

```text
_id
ownerId
title
selectedSkillId
language
state
progress
context
messages
diagnosis
createdAt
updatedAt
```

`ownerId` permite filtrar todas las operaciones por la cuenta autenticada. Los
timestamps son administrados por Mongoose. `state` y `progress` sólo cambian
desde servicios de aplicación; no se aceptan directamente desde los DTOs del
cliente. `context` mantiene los seis datos esenciales y `messages` el historial
que da trazabilidad a su captura.
`diagnosis` conserva la completitud calculada, campos faltantes, ambigüedades,
inconsistencias, preguntas de aclaración y fecha del análisis. Editar el
contexto invalida el diagnóstico anterior para evitar resultados obsoletos.

## Desarrollo y despliegue

MongoDB Atlas es el entorno principal de desarrollo para evitar que cada
integrante tenga que instalar MongoDB o aprender Docker. La aplicación recibe
la conexión mediante `MONGODB_URI`, por lo que la infraestructura no queda
acoplada al código.

`docker-compose.yml` permanece como alternativa opcional para quien prefiera
MongoDB local, pero no forma parte del camino de instalación recomendado.

No se almacenarán archivos DOCX o PDF dentro de MongoDB. La futura colección
`documents` conservará metadatos y una referencia de almacenamiento.
