# Frontend de Ágora

Aplicación web responsive creada con React, TypeScript y Vite. La Fase 6 incluye
landing, catálogo de skills, creación de proyecto, selección persistente de
idioma y un chat guiado que recopila, diagnostica y confirma el contexto mediante
una API mock local. Después simula la formulación de 13 apartados mediante un
orquestador y cinco agentes especializados, con validaciones y revisión humana. El
recorrido continúa con ensamblaje, vista previa, traducción opcional, exportación
mock y cierre del proyecto. La entrega final añade carga diferida por ruta,
navegación accesible, estados semánticos de progreso y validación responsive en
móvil, tableta y escritorio.

## Requisitos

- Node.js 24 LTS.
- npm 10 o superior.

## Ejecución

```bash
npm install
npm run dev
```

## Calidad

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

La arquitectura y las decisiones se documentan en
[`../docs/frontend.md`](../docs/frontend.md). El informe verificable de cierre y
las pruebas ejecutadas está en
[`../docs/cierre-frontend.md`](../docs/cierre-frontend.md).
