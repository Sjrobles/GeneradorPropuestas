# Operación de sesiones y disponibilidad

## Sesión de usuario

Ágora utiliza un JWT de acceso con vigencia absoluta de dos horas. La estrategia
adoptada para esta versión es solicitar una nueva autenticación al vencer; no se
almacenan refresh tokens en `localStorage`.

El frontend lee `exp` al cargar una ruta protegida y antes de enviar una
solicitud. Un token vencido se elimina, se muestra «Tu sesión expiró. Inicia
sesión nuevamente para continuar.» y se conserva la ruta en `returnTo` para
regresar al mismo proyecto después del acceso.

`JWT_SECRET` debe ser un valor estable, privado y de al menos 32 caracteres. En
Render, `generateValue: true` lo crea al aprovisionar el servicio; no se debe
regenerar ni sustituir en cada despliegue. Rotarlo invalida inmediatamente todas
las sesiones existentes.

## Disponibilidad del backend

- `GET /api/v1/health/live` comprueba que el proceso NestJS responde.
- `GET /api/v1/health/ready` ejecuta un `ping` controlado contra MongoDB.
- `GET /api/v1/health` se mantiene como alias de vivacidad para compatibilidad.

El frontend hace un calentamiento silencioso al abrirse y reintenta con espera
progresiva. La interfaz no menciona Render ni detalles de infraestructura; si la
espera se prolonga, sólo informa «Estamos preparando tu espacio. Esto puede
tomar un momento.».

El plan gratuito puede suspender el proceso por inactividad. Los reintentos
mejoran la experiencia, pero la única forma de garantizar disponibilidad
continua es utilizar una instancia que no se suspenda.

## Generaciones interrumpidas

La creación principal se acepta con HTTP `202` y un `generationId`; después se
ejecuta en segundo plano. Cada agente persiste sus componentes y actualiza el
trabajo. El frontend consulta proyecto y componentes automáticamente.

Si el proceso se reinicia mientras genera, Ágora marca el trabajo como
`interrupted` y el proyecto como `error`. También considera interrumpido un
trabajo sin actualización durante 45 minutos. El usuario puede reanudar desde
el agente fallido sin repetir los agentes guardados.

## Acceso de red a Atlas

- Desarrollo local: añadir solamente la IP pública actual con máscara `/32`.
- Render: mantener todos los rangos CIDR que muestra **Connect → Outbound**.
- No dejar `0.0.0.0/0` de forma permanente.
- Cuando cambie la IP local, eliminar la entrada anterior si ya no se utiliza y
  añadir **Add Current IP Address**.

La URI, el usuario, la contraseña y los tokens nunca deben aparecer en logs,
capturas, documentos ni commits.

## Diagnóstico rápido

1. Consultar `/health/live`. Si no responde, revisar el servicio de Render.
2. Consultar `/health/ready`. Si responde `MONGODB_UNAVAILABLE`, revisar Atlas,
   sus rangos de red y el usuario de base de datos.
3. Buscar el `x-request-id` de la respuesta en los logs estructurados.
4. Revisar `durationMs`, ruta, código HTTP y el evento del agente.
5. No reiniciar ni regenerar todo el proyecto si los agentes anteriores ya
   quedaron persistidos.

## Prueba de humo local

Con backend, MongoDB y una clave privada de OpenAI configurados:

```bash
cd backend
SMOKE_FULL=1 node scripts/smoke-workflow.mjs
```

El script crea una cuenta y un proyecto de prueba, confirma el contexto, valida
la respuesta `202` de la generación, espera Investigación e Ideación, completa
las respuestas operativas, reanuda desde Metodología, aprueba los trece
componentes, ensambla el documento, descarga el Excel y comprueba que el
proyecto reaparece en el perfil. No imprime credenciales ni tokens.

Sin `SMOKE_FULL=1` comprueba únicamente salud, registro, JWT, perfil y
persistencia del contexto, sin consumir generación de OpenAI.
