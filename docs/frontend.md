# Arquitectura del frontend de Ágora

## Estado

La Fase 6 cierra y endurece el recorrido funcional del frontend web: después de la
landing, el catálogo, la creación y la selección de idioma, el usuario conversa
con Ágora para completar seis datos esenciales, ejecuta un diagnóstico simulado y
confirma un resumen editable. A continuación genera 13 apartados mediante cinco agentes, los revisa
en un workspace, edita su contenido y los aprueba. Finalmente, revisa pendientes,
ensambla las últimas versiones, navega la vista previa, solicita una traducción
opcional, descarga archivos simulados y finaliza el proyecto. La información se
conserva en el navegador mediante una API simulada. La entrega final incorpora
carga diferida por ruta, títulos dinámicos, administración de foco, controles de
progreso accesibles, pruebas automáticas con axe-core y verificación responsive
en navegador real.

## Arquitectura

El frontend es una SPA (Single Page Application) web construida con React y
Vite. React Router mantiene una URL independiente para cada etapa del proyecto.
Esto permite abrir o recargar una pantalla sin depender exclusivamente del
estado en memoria.

La estructura se organiza por funcionalidades. Los componentes exclusivos de
una funcionalidad permanecen dentro de su carpeta y los componentes realmente
compartidos viven en `src/components`.

```text
src/
├── app/          # Router, providers y estilos globales
├── components/   # UI, layout y estados reutilizables
├── features/     # Funcionalidades del producto
├── lib/          # Utilidades sin estado
├── services/     # Contrato AgoraApi e implementación mock local
├── stores/       # Estado local de interfaz
├── test/         # Configuración transversal de pruebas
└── types/        # Contratos del dominio
```

## Estado y datos

TanStack Query administra los datos provenientes de la MockAPI y posteriormente
podrá administrar los del backend. Una **query** representa una lectura asíncrona; una **mutation**,
una operación que modifica datos; y la **cache** conserva resultados para evitar
solicitudes duplicadas y mantener la interfaz sincronizada.

Zustand se reserva para estado puramente visual. No debe copiar proyectos,
componentes ni documentos que ya pertenezcan a TanStack Query.

`AgoraApi` es el contrato que separa la interfaz de la fuente de datos.
`MockAgoraApi` lo implementa con una latencia breve y persistencia en
`localStorage`, usando claves separadas para proyectos, mensajes, contextos,
componentes y documentos.
Más adelante podrá sustituirse por una implementación HTTP sin reescribir las
páginas.

Los hooks de cada feature actúan como capa de aplicación: traducen las acciones
de la interfaz a consultas y mutaciones sobre el contrato. Las páginas no leen
ni escriben `localStorage` directamente.

## Providers

Un **provider** es un componente React que hace disponible una configuración a
todo el árbol de componentes. `AppProviders` crea y expone el `QueryClient` de
TanStack Query.

## Sistema visual

Los tokens de color, espaciado, tipografía, radios y sombras están en
`src/app/styles/tokens.css`. La paleta se deriva visualmente del Figma público y
se expresa mediante nombres semánticos como `primary`, `warning` y `border`.

Tailwind CSS 4 consume estos tokens. `components.json` deja shadcn/ui preparado
para incorporar sólo los componentes que sean necesarios. `AgoraButton`
demuestra el patrón de variantes reutilizables.

La aplicación es web responsive:

- Desktop es la experiencia principal.
- Tablet reorganiza paneles y espacios.
- Móvil apila el contenido y mantiene objetivos táctiles de al menos 44 px.
- No se utiliza React Native ni se construye una aplicación móvil nativa.

## Rutas

```text
/
/skills
/projects/new
/projects/:projectId/language
/projects/:projectId/chat
/projects/:projectId/context
/projects/:projectId/generation
/projects/:projectId/review
/projects/:projectId/components/:componentId
/projects/:projectId/document/assemble
/projects/:projectId/document
/projects/:projectId/translation
/projects/:projectId/export
/projects/:projectId/complete
```

En la Fase 6 todas las rutas del recorrido frontend están implementadas. Las
rutas de documento soportan preparación, ensamblaje, vista previa, traducción,
exportación mock y finalización sin depender únicamente del estado React.

## Documento y traducción

`DocumentAssembler` es un servicio determinista. Recupera la versión vigente de
los 13 apartados, respeta el orden del registro, agrega títulos y produce la
estructura navegable. Nunca solicita a un modelo que reescriba contenido
aprobado.

`TranslationAgent` mantiene aislada la operación cognitiva. En esta fase es una
simulación local que traduce los títulos y marca el contenido como traducción
simulada; posteriormente podrá sustituirse por un agente real sin modificar las
pantallas. Las descargas DOCX y PDF también son mocks del contrato futuro.

## Dependencias principales

- React: interfaz declarativa.
- React Router: navegación web.
- TanStack Query: datos asíncronos y cache.
- Zustand: estado temporal de interfaz.
- React Hook Form y Zod: formularios y validación.
- Tailwind CSS y shadcn/ui: sistema visual.
- Lucide: iconografía.
- Vitest y Testing Library: pruebas de comportamiento.
- ESLint y Prettier: calidad y formato.

## Ejecución

```bash
cd frontend
npm install
npm run dev
```

Vite mostrará la URL local disponible.

## Verificación

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```

## Decisiones

- Node 24 LTS evita incompatibilidades con Vite 8, ESLint 10 y jsdom.
- TypeScript 6 se mantiene dentro del rango admitido por typescript-eslint.
- React Router usa rutas reales desde el bootstrap.
- No se introduce Redux.
- La Fase 6 no implementa backend, autenticación ni llamadas reales a agentes u
  OpenAI. `ProjectOrchestrator`, `FormulatorAgent` y sus subagentes son
  simulaciones locales con límites equivalentes a la arquitectura futura.
- Sólo la skill de convocatorias internacionales y Banco de la República está
  habilitada; las demás comunican explícitamente su estado “Próximamente”.
- La creación, conversación, diagnóstico, generación, edición, aprobación,
  ensamblaje y finalización se validan con pruebas de navegación y persistencia.
