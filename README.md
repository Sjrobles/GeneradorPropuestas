# GeneradorPropuestas

## Resumen ejecutivo

Ágora es un sistema multiagente basado en inteligencia artificial orientado a apoyar la formulación básica de proyectos de Ciencia, Tecnología e Innovación (CTeI). La solución busca facilitar que estudiantes, docentes, investigadores y emprendedores transformen una idea inicial en un borrador estructurado de proyecto mediante una interacción guiada que recopila información, identifica datos faltantes y genera automáticamente los principales componentes del documento. El sistema organiza el contenido, permite su revisión por parte del usuario, integra todas las secciones en un único documento y ofrece la posibilidad de traducirlo al inglés, preservando su estructura y sentido técnico. Con ello, se pretende reducir el tiempo y la dificultad asociados a la elaboración de propuestas desde cero, brindando un asistente académico que agiliza el proceso de formulación sin reemplazar la revisión y validación de expertos. El proyecto tiene un alcance de prueba de concepto funcional, enfocado en demostrar el potencial de los sistemas multiagente y la inteligencia artificial generativa como herramientas de apoyo para la formulación de proyectos CTeI.

## Documentación del repositorio

## Estado de desarrollo

La **Fase 6 del frontend web** está disponible en [`frontend/`](./frontend). La
aplicación incluye la landing de Ágora, el catálogo de skills, la creación de
proyectos, la selección persistente de idioma y un flujo conversacional para
recopilar, diagnosticar, editar y confirmar el contexto sobre una API simulada
local. También incorpora la generación progresiva de 13 apartados mediante cinco agentes especializados, el
workspace de revisión, edición, advertencias y aprobación humana. La entrega
también incorpora ensamblaje determinista, vista previa navegable, traducción y
exportación simuladas, y finalización del proyecto.

Para ejecutarla con Node.js 24 LTS:

```bash
cd frontend
npm install
npm run dev
```

La arquitectura se documenta en [`docs/frontend.md`](./docs/frontend.md), la
simulación del orquestador y los agentes en [`docs/agents.md`](./docs/agents.md)
y el cierre técnico, responsive, accesibilidad y pruebas en
[`docs/cierre-frontend.md`](./docs/cierre-frontend.md).

La **Fase 7 del backend** comenzó en [`backend/`](./backend) como un monolito
modular NestJS con REST API versionada, OpenAPI y persistencia MongoDB mediante
Mongoose. El primer corte incluye health check, catálogo de skills, creación y
consulta de proyectos, selección de idioma, autenticación JWT y aislamiento por
propietario. El contexto y los mensajes del chat también se persisten, y el
backend ya integra la Responses API de OpenAI con respaldo local. La
arquitectura y ejecución están
en [`docs/backend.md`](./docs/backend.md), el contrato inicial en
[`docs/api.md`](./docs/api.md) y las decisiones de persistencia en
[`docs/database.md`](./docs/database.md).

Para iniciar el backend local con MongoDB Atlas:

```bash
cd backend
cp .env.example .env
pnpm install
pnpm db:ping
pnpm start:dev
```

En otra terminal, inicia el frontend conectado a la API:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

El catálogo, la creación de proyectos, la selección de idioma, los mensajes, el
contexto, los componentes y los documentos consolidados se guardan en MongoDB.
Los documentos quedan asociados al propietario autenticado y aparecen en su
biblioteca al volver a iniciar sesión. Los editores admiten negrita, cursiva,
subrayado, vínculos, listas y alineación; el formato se conserva al guardar,
previsualizar y exportar.

La generación se ejecuta en el orden Investigación → Ideación → Metodología →
Presupuesto → Impacto. Después de Ideación, el orquestador pausa el proceso y
solicita nueve respuestas obligatorias sobre ejecución, participantes,
recursos, tiempos, entregables, evidencias, costos y condiciones especiales.
Metodología y Presupuesto sólo se habilitan después de su confirmación.
El contexto inicial también solicita la duración total y la cantidad exacta de
objetivos específicos —entre 2 y 5— para que Ideación produzca exactamente los
objetivos solicitados y un cronograma concreto. Los proyectos incompletos se
mantienen en la biblioteca con estado pendiente y se reanudan desde el último
paso guardado. Cada proyecto admite hasta tres regeneraciones de fragmentos y
una única regeneración completa después de finalizarse.

Las actividades usan una numeración jerárquica vinculada al objetivo específico
(`1.1`, `1.2`, `2.1`, etc.) que se conserva en cronograma, metodología y
presupuesto. Durante la revisión presupuestal puede descargarse un Excel con una
pestaña por rubro, editarse localmente y volver a cargarse; Ágora valida el
archivo, recalcula los totales y reconstruye la tabla que se incorpora al
documento final.

La creación de Atlas y la conexión están explicadas paso a paso en
[`docs/atlas-setup.md`](./docs/atlas-setup.md). Docker queda disponible sólo
como alternativa opcional; no es necesario para desarrollar Ágora.

## Ejecución monolítica con Docker

El repositorio también permite levantar frontend, backend y MongoDB dentro de
un único contenedor. Nginx sirve la aplicación React y redirige `/api` al
backend NestJS; MongoDB sólo escucha dentro del contenedor y conserva sus datos
en un volumen administrado por Docker.

1. Crea el archivo local de variables y reemplaza, como mínimo, `JWT_SECRET`:

   ```bash
   cp .env.docker.example .env
   ```

2. Construye e inicia el contenedor:

   ```bash
   docker compose up --build -d
   ```

3. Comprueba el estado y abre la aplicación:

   ```bash
   docker compose ps
   curl http://127.0.0.1:8080/api/v1/health/ready
   ```

   La interfaz queda disponible en <http://127.0.0.1:8080>.

Para observar los tres procesos se puede usar `docker compose logs -f agora`.
`docker compose down` elimina el contenedor pero conserva los proyectos; sólo
`docker compose down -v` elimina también el volumen de MongoDB. Las variables
`VITE_*` se incorporan durante la construcción, por lo que un cambio del client
ID de Google requiere reconstruir la imagen.

El despliegue público del monorepo en Render y el recorrido de validación para
evaluadores externos se encuentran en
[`docs/render-y-pruebas-externas.md`](./docs/render-y-pruebas-externas.md). El
repositorio incluye un [`render.yaml`](./render.yaml) que crea el backend como
Web Service y el frontend como Static Site sin almacenar secretos en Git.
La expiración de sesión, los health checks, la recuperación de generaciones y
el diagnóstico operativo están documentados en
[`docs/operacion-sesiones-disponibilidad.md`](./docs/operacion-sesiones-disponibilidad.md).

### Primer informe

- [Primer Informe.md](./PrimerInforme.md): Documento que presenta el planteamiento del problema, los objetivos, la solución propuesta, el estado del arte, la metodología de desarrollo y el plan de trabajo del proyecto.

### Segundo informe

- [Segundo Informe.md](./SegundoInforme.md): Documento que presenta el estado actual del proyecto, incluyendo los avances logrados, las validaciones realizadas y los aspectos pendientes.

### Informe final

| Documento                            | Descripción                                  |
| ------------------------------------ | -------------------------------------------- |
| [InformeFinal.md](./InformeFinal.md) | Documento principal del proyecto             |
| [Instalación.md](./Instalación.md)   | Guía de instalación, desarrollo y despliegue |
| [Desarrollo.md](./Desarrollo.md)     | Detalles técnicos del desarrollo             |

## Estudiantes

| Nombre             | GitHub                                   |
| ------------------ | ---------------------------------------- |
| Samuel Robles      | [@usuario1](https://github.com/usuario1) |
| Sibeli Rodriguez   | [@usuario2](https://github.com/usuario2) |
| Alejandro Fontalvo | [@usuario3](https://github.com/usuario3) |
| Juan Morales       | [@usuario3](https://github.com/usuario3) |

## Tutores

- Daladier Jabba
