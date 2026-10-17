# Backend de Ágora — Fase 7

## Estado del corte

La Fase 7 inicia con una base NestJS separada del frontend y preparada para
crecer como **monolito modular**. Este primer corte implementa configuración,
seguridad HTTP básica, documentación OpenAPI, MongoDB, autenticación JWT y los
módulos iniciales de usuarios, salud, skills y proyectos. El chat de contexto
ya persiste mensajes en MongoDB y dispone de su primera integración con la
Responses API de OpenAI.
El diagnóstico, la edición y la confirmación del contexto también se ejecutan
ya en el backend y se conservan en MongoDB. La generación multiagente persiste
cada salida y se detiene después de Ideación para recopilar nueve respuestas
operativas obligatorias antes de ejecutar Metodología, Presupuesto e Impacto.
Presupuesto cuenta con evidencia externa de precios y recuperación automática
de respuestas estructuradas inválidas; un reintento del proyecto conserva todos
los agentes que ya finalizaron correctamente.
Los componentes aprobados se ensamblan ahora en un documento persistido dentro
del proyecto. La consulta, traducción y finalización del documento respetan el
`ownerId` de la sesión, por lo que la biblioteca de cada perfil queda aislada.

## Arquitectura

```text
Frontend React
    │ HTTP /api/v1
    ▼
NestJS
    ├── common/       validaciones y elementos transversales
    ├── config/       entorno validado
    ├── auth/         registro, login, JWT y sesión
    ├── ai/           proveedor OpenAI y respaldo local controlado
    ├── users/        cuentas y contraseñas cifradas
    ├── health/       disponibilidad de la API
    ├── skills/       catálogo público
    └── projects/     creación, consulta y workflow inicial
            │
            ▼
         Mongoose
            │
            ▼
          MongoDB
```

Se mantiene la regla del proyecto: el código controla estados, persistencia,
permisos y validaciones estructurales; los agentes realizan únicamente tareas
cognitivas.

## Ejecución local

Requisitos:

- Node.js 24.
- pnpm 11 o npm compatible.
- Una cuenta de MongoDB Atlas.

```bash
cd backend
cp .env.example .env
pnpm install
pnpm db:ping
pnpm start:dev
```

Servicios:

- API: `http://127.0.0.1:3000/api/v1`
- Swagger UI: `http://127.0.0.1:3000/api/docs`
- OpenAPI JSON: `http://127.0.0.1:3000/api/docs/openapi.json`
- MongoDB: despliegue administrado en Atlas mediante `MONGODB_URI`.

La configuración guiada está en [`atlas-setup.md`](./atlas-setup.md). Docker no
es necesario para el flujo principal. El archivo `docker-compose.yml` se
conserva únicamente como alternativa para integrantes que prefieran una base
local.

## Variables de entorno

| Variable           | Uso                                                                   |
| ------------------ | --------------------------------------------------------------------- |
| `PORT`             | Puerto HTTP del backend.                                              |
| `MONGODB_URI`      | Conexión local o MongoDB Atlas.                                       |
| `FRONTEND_ORIGIN`  | Origen o lista de orígenes autorizados por CORS, separados por comas. |
| `GOOGLE_CLIENT_ID` | ID del cliente web usado para verificar el acceso con Google.         |
| `JWT_SECRET`       | Secreto privado de al menos 32 caracteres para firmar JWT.            |
| `OPENAI_API_KEY`   | Reservada para agentes; nunca se expone al frontend.                  |
| `OPENAI_MODEL`     | Modelo utilizado por el backend; por defecto `gpt-5.6-luna`.          |

El archivo `.env` está ignorado por Git. Sólo `.env.example` puede versionarse.

## Integración progresiva con el frontend

El frontend dispone de un adaptador híbrido activado con:

```env
VITE_API_MODE=backend
VITE_API_URL=http://127.0.0.1:3000/api/v1
VITE_GOOGLE_CLIENT_ID=el-mismo-id-del-cliente-web.apps.googleusercontent.com
```

Para Google Identity Services, crea un cliente OAuth 2.0 de tipo aplicación
web, autoriza el origen local del frontend (por ejemplo,
`http://localhost:5173`) y configura el mismo ID de cliente en backend y
frontend. El secreto del cliente de Google no se utiliza ni debe exponerse.

En este corte, registro, inicio de sesión, catálogo de skills, creación del
proyecto, comprobación de propiedad, selección de idioma, conversación,
diagnóstico, edición y confirmación del contexto, generación multiagente,
respuestas operativas, edición y aprobación de componentes se ejecutan contra
NestJS y MongoDB Atlas. El ensamblaje, la consulta y la traducción también se
persisten en el backend; la descarga DOCX/PDF se genera en el navegador a partir
del documento recuperado para el perfil autenticado.

## Comandos de calidad

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

## Secuencia de implementación

1. Fundación, skills y proyectos.
2. Autenticación JWT, usuarios y autorización por propietario. ✅
3. Contexto, mensajes y diagnóstico persistentes con OpenAI. ✅
4. Orquestador y generación multiagente. ✅
5. Intervención humana entre Ideación y Metodología. ✅
6. Revisión, validación y ensamblaje. ✅
7. Traducción y exportación. ✅
8. Observabilidad y endurecimiento operativo.
